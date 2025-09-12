import os
import threading
from typing import List, Tuple

from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain import hub
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough


class RAGPipeline:
    """Simple RAG pipeline over local policy documents.

    - Indexes all .txt files under data_docs_path
    - Stores embeddings in a persistent Chroma directory
    - Answers questions with sources
    """

    def __init__(
        self,
        data_docs_path: str,
        persist_dir: str,
        openai_api_key: str | None = None,
    ) -> None:
        self.data_docs_path = data_docs_path
        self.persist_dir = persist_dir
        if openai_api_key:
            os.environ.setdefault("OPENAI_API_KEY", openai_api_key)

        self._lock = threading.Lock()
        self._vectorstore: Chroma | None = None
        self._retriever = None
        self._rag_chain = None

    def _build_or_load_index(self) -> None:
        os.makedirs(self.persist_dir, exist_ok=True)

        # Load .txt documents from directory
        loader = DirectoryLoader(
            self.data_docs_path,
            glob="**/*.txt",
            loader_cls=TextLoader,
            show_progress=False,
            use_multithreading=True,
            loader_kwargs={"encoding": "utf-8"},
        )
        docs = loader.load()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=150,
        )
        splits = splitter.split_documents(docs)

        embeddings = OpenAIEmbeddings()

        # Persisted Chroma index
        self._vectorstore = Chroma(
            collection_name="uptiq_policies",
            embedding_function=embeddings,
            persist_directory=self.persist_dir,
        )

        # If collection empty, add docs; else keep existing
        existing_count = len(self._vectorstore.get(include=["embeddings"]).get("ids", []))
        if existing_count == 0 and splits:
            self._vectorstore.add_documents(splits)
            self._vectorstore.persist()

        self._retriever = self._vectorstore.as_retriever()

        # Build RAG chain
        prompt = hub.pull("rlm/rag-prompt")
        llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)

        def format_docs(docs):
            return "\n\n".join(doc.page_content for doc in docs)

        from langchain_core.runnables import RunnableMap

        self._rag_chain = (
            {"context": self._retriever | format_docs, "question": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )

    def ensure_ready(self) -> None:
        with self._lock:
            if self._rag_chain is None:
                self._build_or_load_index()

    def answer(self, question: str, k: int = 4) -> Tuple[str, List[str]]:
        self.ensure_ready()
        assert self._retriever is not None
        assert self._rag_chain is not None

        # Retrieve sources explicitly for returning
        docs = self._retriever.get_relevant_documents(question)
        sources = []
        for d in docs[:k]:
            src = d.metadata.get("source") or d.metadata.get("file_path") or "unknown"
            sources.append(src)

        answer_text = self._rag_chain.invoke(question)
        return answer_text, sources


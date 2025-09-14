"""
Indexing module for RAG pipeline.

Handles document loading, chunking, and vector store creation.
"""

import os
from pathlib import Path
from typing import List, Optional
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document


class DocumentIndexer:
    """Handles document indexing and vector store creation."""
    
    def __init__(
        self,
        documents_path: str,
        chunk_size: int = 200,
        chunk_overlap: int = 20,
        embedding_model: str = "all-MiniLM-L6-v2"
    ):
        """
        Initialize the document indexer.
        
        Args:
            documents_path: Path to directory containing documents
            chunk_size: Size of text chunks
            chunk_overlap: Overlap between chunks
            embedding_model: HuggingFace embedding model name
        """
        self.documents_path = documents_path
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.embedding_model = embedding_model
        self.embeddings = HuggingFaceEmbeddings(model_name=embedding_model)
        self.vectorstore = None
        
    def load_documents(self) -> List[Document]:
        """Load documents from the specified directory."""
        if not os.path.exists(self.documents_path):
            raise FileNotFoundError(f"Documents path not found: {self.documents_path}")
            
        loader = DirectoryLoader(
            self.documents_path,
            glob="*.txt",
            loader_cls=TextLoader,
            loader_kwargs={"encoding": "utf-8"}
        )
        
        docs = loader.load()
        print(f"Loaded {len(docs)} documents")
        for i, doc in enumerate(docs):
            filename = os.path.basename(doc.metadata['source'])
            print(f"{i+1}. {filename}: {len(doc.page_content)} characters")
        
        return docs
    
    def chunk_documents(self, docs: List[Document]) -> List[Document]:
        """Split documents into chunks."""
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap
        )
        splits = text_splitter.split_documents(docs)
        print(f"Created {len(splits)} chunks")
        return splits
    
    def create_vectorstore(self, docs: Optional[List[Document]] = None) -> Chroma:
        """Create or load vector store."""
        if docs is None:
            docs = self.load_documents()
        
        chunks = self.chunk_documents(docs)
        
        self.vectorstore = Chroma.from_documents(
            documents=chunks,
            embedding=self.embeddings
        )
        
        print("Vector store created successfully")
        return self.vectorstore
    
    def get_retriever(self, k: int = 4):
        """Get a retriever from the vector store."""
        if self.vectorstore is None:
            self.create_vectorstore()
        
        return self.vectorstore.as_retriever(search_kwargs={"k": k})

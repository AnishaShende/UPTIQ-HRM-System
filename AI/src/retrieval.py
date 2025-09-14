"""
Retrieval module for RAG pipeline.

Handles document retrieval and similarity search.
"""

from typing import List, Dict, Any, Optional
from langchain_core.documents import Document
from langchain_core.vectorstores import VectorStoreRetriever


class DocumentRetriever:
    """Handles document retrieval operations."""
    
    def __init__(self, retriever: VectorStoreRetriever):
        """Initialize with a vector store retriever."""
        self.retriever = retriever
    
    def retrieve_documents(self, query: str, k: int = 4) -> List[Document]:
        """Retrieve documents for a single query."""
        return self.retriever.invoke(query)
    
    def retrieve_multiple_queries(self, queries: List[str], k: int = 4) -> List[List[Document]]:
        """Retrieve documents for multiple queries."""
        results = []
        for query in queries:
            docs = self.retrieve_documents(query, k)
            results.append(docs)
        return results
    
    def format_documents(self, docs: List[Document]) -> str:
        """Format documents for use in prompts."""
        return "\n\n".join(doc.page_content for doc in docs)
    
    def retrieve_with_scores(self, query: str, k: int = 4) -> List[tuple]:
        """Retrieve documents with similarity scores."""
        if hasattr(self.retriever, 'similarity_search_with_score'):
            return self.retriever.vectorstore.similarity_search_with_score(query, k=k)
        else:
            # Fallback to regular retrieval
            docs = self.retrieve_documents(query, k)
            return [(doc, 1.0) for doc in docs]  # Default score

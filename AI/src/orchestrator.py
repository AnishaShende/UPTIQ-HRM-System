"""
Main orchestrator for the RAG pipeline.

Coordinates all components to provide a unified interface.
"""

import os
import time
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from pathlib import Path

from langchain_groq import ChatGroq



from .indexing import DocumentIndexer
from .query_transform import QueryTransformer, DocumentReranker
from .retrieval import DocumentRetriever
from .routing import LogicalRouter, SemanticRouter
from .generation import ResponseGenerator


@dataclass
class PipelineConfig:
    """Configuration for the RAG pipeline."""
    # API Keys
    groq_api_key: str = os.environ.get("GROQ_API_KEY", "")
    gemini_api_key: str = os.environ.get("GEMINI_API_KEY", "")
    
    # Document settings
    documents_path: str = "rag/uptiq_hr_policies"
    chunk_size: int = 200
    chunk_overlap: int = 20
    
    # Model settings
    embedding_model: str = "all-MiniLM-L6-v2"
    llm_model: str = "deepseek-r1-distill-llama-70b"
    
    # Retrieval settings
    top_k: int = 4
    rerank_threshold: float = 0.7
    
    # Query transformation settings
    enable_multi_query: bool = True
    enable_rag_fusion: bool = True
    enable_decomposition: bool = True
    enable_step_back: bool = True
    enable_hyde: bool = True
    
    # Routing settings
    enable_logical_routing: bool = True
    enable_semantic_routing: bool = True


class RAGPipeline:
    """Main RAG pipeline orchestrator."""
    
    def __init__(self, config: PipelineConfig):
        """Initialize the pipeline with configuration."""
        self.config = config
        self._setup_environment()
        self._initialize_components()
    
    def _setup_environment(self):
        """Set up environment variables."""
        if self.config.groq_api_key:
            os.environ["GROQ_API_KEY"] = self.config.groq_api_key
        if self.config.gemini_api_key:
            os.environ["GEMINI_API_KEY"] = self.config.gemini_api_key
    
    def _initialize_components(self):
        """Initialize all pipeline components."""
        # Initialize LLM
        self.llm = ChatGroq(
            model=self.config.llm_model,
            temperature=0,
            max_tokens=None,
            reasoning_format="parsed",
            timeout=None,
            max_retries=2
        )
        
        # Initialize components
        self.indexer = DocumentIndexer(
            documents_path=self.config.documents_path,
            chunk_size=self.config.chunk_size,
            chunk_overlap=self.config.chunk_overlap,
            embedding_model=self.config.embedding_model
        )
        
        self.query_transformer = QueryTransformer(self.llm)
        self.document_reranker = DocumentReranker()
        self.response_generator = ResponseGenerator(self.llm)
        
        if self.config.enable_logical_routing:
            self.logical_router = LogicalRouter(self.llm)
        
        if self.config.enable_semantic_routing:
            self.semantic_router = SemanticRouter(self.config.embedding_model)
        
        # Initialize retriever
        self.retriever = None
        self._initialize_retriever()
    
    def _initialize_retriever(self):
        """Initialize the document retriever."""
        try:
            vectorstore = self.indexer.create_vectorstore()
            retriever = self.indexer.get_retriever(k=self.config.top_k)
            self.retriever = DocumentRetriever(retriever)
        except Exception as e:
            print(f"Warning: Could not initialize retriever: {e}")
            print("Pipeline will use mock responses")
    
    def run_pipeline(self, query: str, config_override: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Run the complete RAG pipeline.
        
        Args:
            query: User query string
            config_override: Optional configuration overrides
            
        Returns:
            Dictionary containing pipeline results and metadata
        """
        start_time = time.time()
        results = {
            "query": query,
            "timestamp": start_time,
            "pipeline_stages": {},
            "final_answer": "",
            "metadata": {}
        }
        
        try:
            # Stage 1: Query Transformation
            if config_override and config_override.get("transformation_method"):
                method = config_override["transformation_method"]
            else:
                method = "basic"  # Default to basic retrieval
            
            transformed_queries = self._transform_query(query, method)
            results["pipeline_stages"]["query_transformation"] = {
                "method": method,
                "transformed_queries": transformed_queries
            }
            
            # Stage 2: Retrieval
            retrieved_docs = self._retrieve_documents(transformed_queries)
            results["pipeline_stages"]["retrieval"] = {
                "num_documents": len(retrieved_docs),
                "documents": [doc.page_content[:100] + "..." for doc in retrieved_docs]
            }
            
            # Stage 3: Reranking (if applicable)
            if method in ["rag_fusion", "multi_query"] and len(retrieved_docs) > 1:
                reranked_docs = self._rerank_documents(retrieved_docs, method)
                results["pipeline_stages"]["reranking"] = {
                    "method": method,
                    "num_documents": len(reranked_docs)
                }
                retrieved_docs = reranked_docs
            
            # Stage 4: Routing (if enabled)
            routing_info = self._route_query(query)
            if routing_info:
                results["pipeline_stages"]["routing"] = routing_info
            
            # Stage 5: Generation
            if method == "decomposition":
                final_answer = self._generate_decomposed_response(query, transformed_queries)
            elif method == "step_back":
                final_answer = self._generate_step_back_response(query, transformed_queries)
            else:
                final_answer = self._generate_response(query, retrieved_docs)
            
            results["final_answer"] = final_answer
            
        except Exception as e:
            results["error"] = str(e)
            results["final_answer"] = f"Error processing query: {str(e)}"
        
        results["execution_time"] = time.time() - start_time
        return results
    
    def _transform_query(self, query: str, method: str) -> List[str]:
        """Transform query based on selected method."""
        if method == "multi_query":
            return self.query_transformer.multi_query_generation(query)
        elif method == "rag_fusion":
            return self.query_transformer.rag_fusion_generation(query)
        elif method == "decomposition":
            return self.query_transformer.decomposition(query)
        elif method == "step_back":
            return [self.query_transformer.step_back_prompting(query)]
        elif method == "hyde":
            return [self.query_transformer.hyde_generation(query)]
        else:
            return [query]  # Basic retrieval
    
    def _retrieve_documents(self, queries: List[str]) -> List:
        """Retrieve documents for given queries."""
        if not self.retriever:
            # Return mock documents if retriever not available
            return [type('Document', (), {'page_content': 'Mock document content'})()]
        
        if len(queries) == 1:
            return self.retriever.retrieve_documents(queries[0], self.config.top_k)
        else:
            # For multiple queries, get union of results
            all_docs = self.retriever.retrieve_multiple_queries(queries, self.config.top_k)
            return self.document_reranker.get_unique_union(all_docs)
    
    def _rerank_documents(self, docs: List, method: str) -> List:
        """Rerank documents using appropriate method."""
        if method == "rag_fusion":
            # For RAG-Fusion, we need multiple query results
            # This is a simplified version
            return docs
        return docs
    
    def _route_query(self, query: str) -> Optional[Dict[str, Any]]:
        """Route query using available routing methods."""
        routing_info = {}
        
        if self.config.enable_logical_routing and hasattr(self, 'logical_router'):
            try:
                logical_result = self.logical_router.route_query(query)
                routing_info["logical_routing"] = {
                    "file_name": logical_result.file_name
                }
            except Exception as e:
                routing_info["logical_routing"] = {"error": str(e)}
        
        if self.config.enable_semantic_routing and hasattr(self, 'semantic_router'):
            try:
                semantic_result = self.semantic_router.route_query(query)
                routing_info["semantic_routing"] = semantic_result
            except Exception as e:
                routing_info["semantic_routing"] = {"error": str(e)}
        
        return routing_info if routing_info else None
    
    def _generate_response(self, query: str, docs: List) -> str:
        """Generate response using retrieved documents."""
        if not self.retriever:
            return "Mock response: This is a placeholder response since the retriever is not available."
        
        return self.response_generator.generate_response_from_docs(docs, query)
    
    def _generate_decomposed_response(self, query: str, sub_questions: List[str]) -> str:
        """Generate response using decomposition method."""
        if not self.retriever:
            return "Mock decomposed response: This is a placeholder response."
        
        sub_answers = []
        for sub_q in sub_questions:
            docs = self.retriever.retrieve_documents(sub_q, self.config.top_k)
            answer = self.response_generator.generate_response_from_docs(docs, sub_q)
            sub_answers.append(answer)
        
        return self.response_generator.generate_decomposed_response(sub_questions, sub_answers, query)
    
    def _generate_step_back_response(self, query: str, step_back_queries: List[str]) -> str:
        """Generate response using step-back method."""
        if not self.retriever:
            return "Mock step-back response: This is a placeholder response."
        
        normal_docs = self.retriever.retrieve_documents(query, self.config.top_k)
        step_back_docs = self.retriever.retrieve_documents(step_back_queries[0], self.config.top_k)
        
        return self.response_generator.generate_step_back_response(normal_docs, step_back_docs, query)


def create_pipeline(config_dict: Dict[str, Any]) -> RAGPipeline:
    """Create a pipeline instance from configuration dictionary."""
    config = PipelineConfig(**config_dict)
    return RAGPipeline(config)

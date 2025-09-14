"""
Integration tests for the RAG pipeline.
"""

import pytest
import os
import tempfile
from pathlib import Path
from unittest.mock import Mock, patch

from src.orchestrator import RAGPipeline, PipelineConfig


class TestRAGPipelineIntegration:
    """Integration tests for the complete RAG pipeline."""
    
    def setup_method(self):
        """Set up test environment."""
        # Create temporary directory for test documents
        self.temp_dir = tempfile.mkdtemp()
        self.test_doc_path = Path(self.temp_dir) / "test.txt"
        
        # Create a test document
        with open(self.test_doc_path, 'w') as f:
            f.write("This is a test document about HR policies. It contains information about leave policies and employee benefits.")
        
        # Test configuration
        self.config = PipelineConfig(
            groq_api_key="test_key",
            documents_path=self.temp_dir,
            chunk_size=50,
            chunk_overlap=10
        )
    
    def teardown_method(self):
        """Clean up test environment."""
        import shutil
        shutil.rmtree(self.temp_dir)
    
    @patch('src.orchestrator.ChatGroq')
    def test_pipeline_initialization(self, mock_chatgroq):
        """Test pipeline initialization."""
        mock_llm = Mock()
        mock_chatgroq.return_value = mock_llm
        
        with patch('src.orchestrator.DocumentIndexer') as mock_indexer:
            mock_indexer.return_value.create_vectorstore.return_value = Mock()
            mock_indexer.return_value.get_retriever.return_value = Mock()
            
            pipeline = RAGPipeline(self.config)
            
            assert pipeline.config == self.config
            assert pipeline.llm == mock_llm
            assert pipeline.indexer is not None
            assert pipeline.query_transformer is not None
            assert pipeline.response_generator is not None
    
    @patch('src.orchestrator.ChatGroq')
    def test_basic_query_processing(self, mock_chatgroq):
        """Test basic query processing."""
        mock_llm = Mock()
        mock_chatgroq.return_value = mock_llm
        
        with patch('src.orchestrator.DocumentIndexer') as mock_indexer:
            mock_indexer.return_value.create_vectorstore.return_value = Mock()
            mock_indexer.return_value.get_retriever.return_value = Mock()
            
            pipeline = RAGPipeline(self.config)
            
            # Mock the retriever and response generation
            mock_doc = Mock()
            mock_doc.page_content = "Test HR policy content"
            pipeline.retriever = Mock()
            pipeline.retriever.retrieve_documents.return_value = [mock_doc]
            
            # Mock response generation
            pipeline.response_generator.generate_response_from_docs.return_value = "Test response"
            
            result = pipeline.run_pipeline("What are the leave policies?")
            
            assert result["query"] == "What are the leave policies?"
            assert result["final_answer"] == "Test response"
            assert "execution_time" in result
            assert "pipeline_stages" in result
    
    @patch('src.orchestrator.ChatGroq')
    def test_multi_query_processing(self, mock_chatgroq):
        """Test multi-query processing."""
        mock_llm = Mock()
        mock_chatgroq.return_value = mock_llm
        
        with patch('src.orchestrator.DocumentIndexer') as mock_indexer:
            mock_indexer.return_value.create_vectorstore.return_value = Mock()
            mock_indexer.return_value.get_retriever.return_value = Mock()
            
            pipeline = RAGPipeline(self.config)
            
            # Mock query transformation
            pipeline.query_transformer.multi_query_generation.return_value = [
                "What are leave policies?",
                "How does leave work?",
                "What is the leave policy?"
            ]
            
            # Mock retriever
            mock_doc = Mock()
            mock_doc.page_content = "Test content"
            pipeline.retriever = Mock()
            pipeline.retriever.retrieve_documents.return_value = [mock_doc]
            pipeline.retriever.retrieve_multiple_queries.return_value = [[mock_doc], [mock_doc], [mock_doc]]
            
            # Mock response generation
            pipeline.response_generator.generate_response_from_docs.return_value = "Multi-query response"
            
            result = pipeline.run_pipeline("What are the leave policies?", {"transformation_method": "multi_query"})
            
            assert result["query"] == "What are the leave policies?"
            assert result["final_answer"] == "Multi-query response"
            assert result["pipeline_stages"]["query_transformation"]["method"] == "multi_query"
    
    @patch('src.orchestrator.ChatGroq')
    def test_error_handling(self, mock_chatgroq):
        """Test error handling in pipeline."""
        mock_llm = Mock()
        mock_chatgroq.return_value = mock_llm
        
        with patch('src.orchestrator.DocumentIndexer') as mock_indexer:
            mock_indexer.return_value.create_vectorstore.return_value = Mock()
            mock_indexer.return_value.get_retriever.return_value = Mock()
            
            pipeline = RAGPipeline(self.config)
            
            # Mock an error in query transformation
            pipeline.query_transformer.multi_query_generation.side_effect = Exception("Test error")
            
            result = pipeline.run_pipeline("test query", {"transformation_method": "multi_query"})
            
            assert "error" in result
            assert "Test error" in result["error"]
            assert result["final_answer"].startswith("Error processing query")
    
    @patch('src.orchestrator.ChatGroq')
    def test_routing_integration(self, mock_chatgroq):
        """Test routing integration."""
        mock_llm = Mock()
        mock_chatgroq.return_value = mock_llm
        
        with patch('src.orchestrator.DocumentIndexer') as mock_indexer:
            mock_indexer.return_value.create_vectorstore.return_value = Mock()
            mock_indexer.return_value.get_retriever.return_value = Mock()
            
            pipeline = RAGPipeline(self.config)
            
            # Mock logical routing
            mock_route_result = Mock()
            mock_route_result.file_name = "leave_policy.txt"
            pipeline.logical_router.route_query.return_value = mock_route_result
            
            # Mock semantic routing
            pipeline.semantic_router.route_query.return_value = {
                "template_name": "hr_template",
                "template": "HR template",
                "similarity_score": 0.8
            }
            
            # Mock retriever
            mock_doc = Mock()
            mock_doc.page_content = "Test content"
            pipeline.retriever = Mock()
            pipeline.retriever.retrieve_documents.return_value = [mock_doc]
            
            # Mock response generation
            pipeline.response_generator.generate_response_from_docs.return_value = "Routed response"
            
            result = pipeline.run_pipeline("What are the leave policies?")
            
            assert result["query"] == "What are the leave policies?"
            assert "routing" in result["pipeline_stages"]
            assert result["pipeline_stages"]["routing"]["logical_routing"]["file_name"] == "leave_policy.txt"
            assert result["pipeline_stages"]["routing"]["semantic_routing"]["template_name"] == "hr_template"


class TestAPIIntegration:
    """Integration tests for the FastAPI application."""
    
    def test_health_endpoint(self):
        """Test health check endpoint."""
        from app.main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "pipeline_ready" in data
        assert "timestamp" in data
    
    def test_query_endpoint_mock(self):
        """Test query endpoint with mocked pipeline."""
        from app.main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        
        # Mock the global pipeline
        with patch('app.main.pipeline') as mock_pipeline:
            mock_pipeline.run_pipeline.return_value = {
                "query": "test query",
                "final_answer": "test answer",
                "execution_time": 1.0,
                "pipeline_stages": {"query_transformation": {"method": "basic"}},
                "metadata": {}
            }
            
            response = client.post("/api/v1/query", json={
                "query": "test query",
                "method": "basic"
            })
            
            assert response.status_code == 200
            data = response.json()
            assert data["query"] == "test query"
            assert data["answer"] == "test answer"
            assert data["execution_time"] == 1.0
    
    def test_query_endpoint_no_pipeline(self):
        """Test query endpoint when pipeline is not initialized."""
        from app.main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        
        # Mock no pipeline
        with patch('app.main.pipeline', None):
            response = client.post("/api/v1/query", json={
                "query": "test query"
            })
            
            assert response.status_code == 503
            assert "Pipeline not initialized" in response.json()["detail"]


if __name__ == "__main__":
    pytest.main([__file__])

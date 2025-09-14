"""
Unit tests for RAG pipeline components.
"""

import pytest
import os
from unittest.mock import Mock, patch
from typing import List

from src.indexing import DocumentIndexer
from src.query_transform import QueryTransformer, DocumentReranker
from src.retrieval import DocumentRetriever
from src.routing import LogicalRouter, SemanticRouter
from src.generation import ResponseGenerator
from src.orchestrator import RAGPipeline, PipelineConfig


class TestDocumentIndexer:
    """Test cases for DocumentIndexer."""
    
    def test_init(self):
        """Test DocumentIndexer initialization."""
        indexer = DocumentIndexer("test_path", chunk_size=100, chunk_overlap=10)
        assert indexer.documents_path == "test_path"
        assert indexer.chunk_size == 100
        assert indexer.chunk_overlap == 10
        assert indexer.embedding_model == "all-MiniLM-L6-v2"
    
    @patch('src.indexing.DirectoryLoader')
    def test_load_documents_file_not_found(self, mock_loader):
        """Test load_documents with non-existent path."""
        indexer = DocumentIndexer("nonexistent_path")
        with pytest.raises(FileNotFoundError):
            indexer.load_documents()
    
    @patch('src.indexing.DirectoryLoader')
    def test_load_documents_success(self, mock_loader):
        """Test successful document loading."""
        mock_doc = Mock()
        mock_doc.metadata = {'source': '/path/to/test.txt'}
        mock_doc.page_content = "Test content"
        
        mock_loader_instance = Mock()
        mock_loader_instance.load.return_value = [mock_doc]
        mock_loader.return_value = mock_loader_instance
        
        indexer = DocumentIndexer("test_path")
        with patch('os.path.exists', return_value=True):
            docs = indexer.load_documents()
            assert len(docs) == 1
            assert docs[0].page_content == "Test content"


class TestQueryTransformer:
    """Test cases for QueryTransformer."""
    
    def test_init(self):
        """Test QueryTransformer initialization."""
        mock_llm = Mock()
        transformer = QueryTransformer(mock_llm)
        assert transformer.llm == mock_llm
    
    def test_multi_query_generation(self):
        """Test multi-query generation."""
        mock_llm = Mock()
        mock_llm.return_value = Mock()
        mock_llm.return_value.invoke.return_value = "Query 1\nQuery 2\nQuery 3"
        
        transformer = QueryTransformer(mock_llm)
        queries = transformer.multi_query_generation("test question")
        
        assert len(queries) == 3
        assert "Query 1" in queries


class TestDocumentReranker:
    """Test cases for DocumentReranker."""
    
    def test_reciprocal_rank_fusion(self):
        """Test Reciprocal Rank Fusion."""
        # Mock documents
        doc1 = Mock()
        doc2 = Mock()
        doc3 = Mock()
        
        # Mock results
        results = [
            [doc1, doc2],  # First query results
            [doc2, doc3],  # Second query results
        ]
        
        reranked = DocumentReranker.reciprocal_rank_fusion(results, k=60)
        
        # Should return tuples of (doc, score)
        assert len(reranked) >= 2
        assert all(isinstance(item, tuple) and len(item) == 2 for item in reranked)
    
    def test_get_unique_union(self):
        """Test unique union of documents."""
        doc1 = Mock()
        doc2 = Mock()
        doc3 = Mock()
        
        documents = [
            [doc1, doc2],
            [doc2, doc3],
        ]
        
        unique_docs = DocumentReranker.get_unique_union(documents)
        
        # Should have unique documents
        assert len(unique_docs) <= 3  # At most 3 unique docs


class TestDocumentRetriever:
    """Test cases for DocumentRetriever."""
    
    def test_init(self):
        """Test DocumentRetriever initialization."""
        mock_retriever = Mock()
        retriever = DocumentRetriever(mock_retriever)
        assert retriever.retriever == mock_retriever
    
    def test_retrieve_documents(self):
        """Test document retrieval."""
        mock_doc = Mock()
        mock_doc.page_content = "Test content"
        
        mock_retriever = Mock()
        mock_retriever.get_relevant_documents.return_value = [mock_doc]
        
        retriever = DocumentRetriever(mock_retriever)
        docs = retriever.retrieve_documents("test query")
        
        assert len(docs) == 1
        assert docs[0].page_content == "Test content"
    
    def test_format_documents(self):
        """Test document formatting."""
        mock_doc1 = Mock()
        mock_doc1.page_content = "Content 1"
        mock_doc2 = Mock()
        mock_doc2.page_content = "Content 2"
        
        retriever = DocumentRetriever(Mock())
        formatted = retriever.format_documents([mock_doc1, mock_doc2])
        
        assert "Content 1" in formatted
        assert "Content 2" in formatted


class TestLogicalRouter:
    """Test cases for LogicalRouter."""
    
    def test_init(self):
        """Test LogicalRouter initialization."""
        mock_llm = Mock()
        router = LogicalRouter(mock_llm)
        assert router.llm == mock_llm
    
    def test_route_query(self):
        """Test query routing."""
        mock_llm = Mock()
        mock_structured_llm = Mock()
        mock_structured_llm.invoke.return_value = Mock(file_name="leave_policy.txt")
        mock_llm.with_structured_output.return_value = mock_structured_llm
        
        router = LogicalRouter(mock_llm)
        result = router.route_query("test question")
        
        assert result.file_name == "leave_policy.txt"


class TestSemanticRouter:
    """Test cases for SemanticRouter."""
    
    def test_init(self):
        """Test SemanticRouter initialization."""
        router = SemanticRouter()
        assert router.embedding_model == "all-MiniLM-L6-v2"
        assert len(router.prompt_templates) == 3
    
    def test_route_query(self):
        """Test semantic routing."""
        router = SemanticRouter()
        result = router.route_query("test query")
        
        assert "template_name" in result
        assert "template" in result
        assert "similarity_score" in result
        assert result["template_name"] in ["hr_template", "it_template", "law_template"]


class TestResponseGenerator:
    """Test cases for ResponseGenerator."""
    
    def test_init(self):
        """Test ResponseGenerator initialization."""
        mock_llm = Mock()
        generator = ResponseGenerator(mock_llm)
        assert generator.llm == mock_llm
    
    def test_format_documents(self):
        """Test document formatting."""
        mock_doc1 = Mock()
        mock_doc1.page_content = "Content 1"
        mock_doc2 = Mock()
        mock_doc2.page_content = "Content 2"
        
        generator = ResponseGenerator(Mock())
        formatted = generator.format_documents([mock_doc1, mock_doc2])
        
        assert "Content 1" in formatted
        assert "Content 2" in formatted
    
    def test_format_qa_pairs(self):
        """Test Q&A pair formatting."""
        questions = ["Q1", "Q2"]
        answers = ["A1", "A2"]
        
        generator = ResponseGenerator(Mock())
        formatted = generator.format_qa_pairs(questions, answers)
        
        assert "Question 1: Q1" in formatted
        assert "Answer 1: A1" in formatted
        assert "Question 2: Q2" in formatted
        assert "Answer 2: A2" in formatted


class TestRAGPipeline:
    """Test cases for RAGPipeline."""
    
    def test_init(self):
        """Test RAGPipeline initialization."""
        config = PipelineConfig(
            groq_api_key="test_key",
            documents_path="test_path"
        )
        
        with patch('src.orchestrator.DocumentIndexer') as mock_indexer:
            mock_indexer.return_value.create_vectorstore.return_value = Mock()
            mock_indexer.return_value.get_retriever.return_value = Mock()
            
            pipeline = RAGPipeline(config)
            assert pipeline.config == config
            assert pipeline.llm is not None
    
    def test_run_pipeline_basic(self):
        """Test basic pipeline execution."""
        config = PipelineConfig(
            groq_api_key="test_key",
            documents_path="test_path"
        )
        
        with patch('src.orchestrator.DocumentIndexer') as mock_indexer:
            mock_indexer.return_value.create_vectorstore.return_value = Mock()
            mock_indexer.return_value.get_retriever.return_value = Mock()
            
            pipeline = RAGPipeline(config)
            
            # Mock the retriever
            mock_doc = Mock()
            mock_doc.page_content = "Test content"
            pipeline.retriever = Mock()
            pipeline.retriever.retrieve_documents.return_value = [mock_doc]
            
            result = pipeline.run_pipeline("test query")
            
            assert result["query"] == "test query"
            assert "final_answer" in result
            assert "execution_time" in result
            assert "pipeline_stages" in result


if __name__ == "__main__":
    pytest.main([__file__])

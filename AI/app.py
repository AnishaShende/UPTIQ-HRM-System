"""
FastAPI application for the RAG pipeline.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn
import os
import yaml
from pathlib import Path

from src.orchestrator import RAGPipeline, PipelineConfig

# Initialize FastAPI app
app = FastAPI(
    title="UPTIQ HR RAG Pipeline API",
    description="A production-ready RAG pipeline for HR document processing",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global pipeline instance
pipeline = None

class QueryRequest(BaseModel):
    query: str
    method: Optional[str] = "basic"
    config_override: Optional[Dict[str, Any]] = None

class QueryResponse(BaseModel):
    query: str
    final_answer: str
    execution_time: float
    pipeline_stages: Dict[str, Any]
    error: Optional[str] = None

def load_config(config_path: str = "config.yml") -> Dict[str, Any]:
    """Load configuration from YAML file."""
    try:
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)
    except FileNotFoundError:
        print(f"Config file {config_path} not found. Using default configuration.")
        return {}

def initialize_pipeline():
    """Initialize the RAG pipeline."""
    global pipeline
    try:
        config_dict = load_config()
        pipeline = RAGPipeline(PipelineConfig(**config_dict))
        print("RAG pipeline initialized successfully")
    except Exception as e:
        print(f"Failed to initialize RAG pipeline: {e}")
        pipeline = None

@app.on_event("startup")
async def startup_event():
    """Initialize the pipeline on startup."""
    initialize_pipeline()

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "UPTIQ HR RAG Pipeline API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "pipeline_initialized": pipeline is not None
    }

@app.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """Process a query through the RAG pipeline."""
    if pipeline is None:
        raise HTTPException(
            status_code=500, 
            detail="RAG pipeline not initialized. Please check the configuration."
        )
    
    try:
        # Prepare configuration
        config_dict = load_config()
        if request.config_override:
            config_dict.update(request.config_override)
        
        # Override method if specified
        if request.method != "basic":
            config_dict["transformation_method"] = request.method
        
        # Run pipeline
        result = pipeline.run_pipeline(request.query, config_dict)
        
        return QueryResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing query: {str(e)}"
        )

@app.get("/methods")
async def get_available_methods():
    """Get available query transformation methods."""
    return {
        "methods": [
            "basic",
            "multi_query", 
            "rag_fusion",
            "decomposition",
            "step_back",
            "hyde"
        ]
    }

@app.get("/config")
async def get_config():
    """Get current pipeline configuration."""
    if pipeline is None:
        raise HTTPException(
            status_code=500,
            detail="RAG pipeline not initialized"
        )
    
    return {
        "config": pipeline.config.__dict__ if hasattr(pipeline, 'config') else {},
        "environment": {
            "documents_path": os.getenv("DOCUMENTS_PATH", "rag/uptiq_hr_policies"),
            "chunk_size": os.getenv("CHUNK_SIZE", "200"),
            "chunk_overlap": os.getenv("CHUNK_OVERLAP", "20"),
            "embedding_model": os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2"),
            "llm_model": os.getenv("LLM_MODEL", "deepseek-r1-distill-llama-70b"),
            "top_k": os.getenv("TOP_K", "4"),
            "rerank_threshold": os.getenv("RERANK_THRESHOLD", "0.7")
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

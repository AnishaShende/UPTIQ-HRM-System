# RAG Pipeline Production System

A production-ready Retrieval-Augmented Generation (RAG) pipeline extracted from the original notebook implementation, featuring advanced query transformations, intelligent routing, and comprehensive API endpoints.

## 🚀 Features

- **Advanced Query Transformations**: Multi-query generation, RAG-Fusion, decomposition, step-back prompting, and HyDE
- **Intelligent Routing**: Logical and semantic routing to appropriate data sources
- **Production API**: FastAPI-based REST API with OpenAPI documentation
- **Containerized Deployment**: Docker and Docker Compose support
- **Comprehensive Testing**: Unit and integration tests
- **CI/CD Pipeline**: GitHub Actions workflow for automated testing and deployment

## 📋 Prerequisites

- Python 3.10+
- Docker and Docker Compose (for containerized deployment)
- GROQ API key (for LLM access)
- GEMINI API key (optional, for additional models)

## 🛠️ Installation

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd rag-pipeline
   ```

2. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   # Edit .env with your API keys
   ```

4. **Prepare documents**
   ```bash
   # Ensure HR policy documents are in the correct directory
   mkdir -p rag/uptiq_hr_policies
   # Add your .txt policy files to this directory
   ```

### Docker Deployment

1. **Build and run with Docker Compose**

   ```bash
   docker-compose up --build
   ```

2. **Or build Docker image manually**
   ```bash
   docker build -t rag-pipeline .
   docker run -p 8000:8000 --env-file .env rag-pipeline
   ```

## 🎯 Usage

### CLI Interface

```bash
# Basic query
python -m src --query "What are the leave policies?" --config config.yml

# Using different transformation methods
python -m src --query "What are the leave policies?" --method multi_query
python -m src --query "What are the leave policies?" --method rag_fusion
python -m src --query "What are the leave policies?" --method decomposition
python -m src --query "What are the leave policies?" --method step_back
python -m src --query "What are the leave policies?" --method hyde

# Save output to file
python -m src --query "What are the leave policies?" --output results.json
```

### API Usage

Start the API server:

```bash
# Local development
uvicorn app.main:app --reload

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### API Endpoints

- **POST /api/v1/query** - Process queries through the RAG pipeline
- **GET /health** - Health check endpoint
- **GET /metrics** - System metrics
- **GET /docs** - Interactive API documentation

#### Example API Request

```bash
curl -X POST "http://localhost:8000/api/v1/query" \
     -H "Content-Type: application/json" \
     -d '{
       "query": "What are the leave policies?",
       "method": "multi_query",
       "top_k": 5,
       "rerank": true
     }'
```

#### Example API Response

```json
{
  "query": "What are the leave policies?",
  "method": "multi_query",
  "answer": "Based on the HR policies, employees are entitled to 18 annual leave days, 10 sick leave days, and 7 casual leave days per year...",
  "execution_time": 2.34,
  "pipeline_stages": {
    "query_transformation": {
      "method": "multi_query",
      "transformed_queries": [
        "What are the leave policies?",
        "How does leave work?",
        "What is the leave policy?"
      ]
    },
    "retrieval": {
      "num_documents": 3,
      "documents": [
        "Annual leave policy...",
        "Sick leave policy...",
        "Casual leave policy..."
      ]
    },
    "routing": {
      "logical_routing": {
        "file_name": "leave_policy.txt"
      },
      "semantic_routing": {
        "template_name": "hr_template",
        "similarity_score": 0.85
      }
    }
  },
  "metadata": {}
}
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
pytest

# Run unit tests only
pytest tests/test_components.py -v

# Run integration tests only
pytest tests/test_integration.py -v

# Run with coverage
pytest --cov=src --cov-report=html
```

### Test Categories

- **Unit Tests**: Individual component testing
- **Integration Tests**: End-to-end pipeline testing
- **API Tests**: FastAPI endpoint testing

## 🚀 Deployment

### Railway Deployment

1. **Install Railway CLI**

   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**

   ```bash
   railway login
   ```

3. **Deploy**

   ```bash
   railway up
   ```

4. **Set environment variables**
   ```bash
   railway variables set GROQ_API_KEY=your_key_here
   railway variables set GEMINI_API_KEY=your_key_here
   ```

### Docker Hub Deployment

1. **Build and tag image**

   ```bash
   docker build -t your-username/rag-pipeline .
   ```

2. **Push to Docker Hub**

   ```bash
   docker push your-username/rag-pipeline
   ```

3. **Deploy to any container platform**
   ```bash
   docker run -p 8000:8000 --env-file .env your-username/rag-pipeline
   ```

### Manual Deployment

1. **Build Docker image**

   ```bash
   docker build -t rag-pipeline .
   ```

2. **Run container**
   ```bash
   docker run -d -p 8000:8000 \
     -e GROQ_API_KEY=your_key \
     -e GEMINI_API_KEY=your_key \
     -v $(pwd)/rag/uptiq_hr_policies:/app/rag/uptiq_hr_policies:ro \
     rag-pipeline
   ```

## 📊 Monitoring

### Health Checks

```bash
# Check API health
curl http://localhost:8000/health

# Get metrics
curl http://localhost:8000/metrics
```

### Logs

```bash
# Docker logs
docker logs <container-id>

# Docker Compose logs
docker-compose logs -f rag-api
```

## 🔧 Configuration

### Environment Variables

| Variable           | Description                     | Default                         |
| ------------------ | ------------------------------- | ------------------------------- |
| `GROQ_API_KEY`     | GROQ API key for LLM access     | Required                        |
| `GEMINI_API_KEY`   | GEMINI API key                  | Optional                        |
| `DOCUMENTS_PATH`   | Path to HR policy documents     | `rag/uptiq_hr_policies`         |
| `CHUNK_SIZE`       | Document chunk size             | `200`                           |
| `CHUNK_OVERLAP`    | Chunk overlap size              | `20`                            |
| `EMBEDDING_MODEL`  | HuggingFace embedding model     | `all-MiniLM-L6-v2`              |
| `LLM_MODEL`        | LLM model name                  | `deepseek-r1-distill-llama-70b` |
| `TOP_K`            | Number of documents to retrieve | `4`                             |
| `RERANK_THRESHOLD` | Reranking threshold             | `0.7`                           |

### Feature Flags

| Flag                      | Description                   | Default |
| ------------------------- | ----------------------------- | ------- |
| `ENABLE_MULTI_QUERY`      | Enable multi-query generation | `true`  |
| `ENABLE_RAG_FUSION`       | Enable RAG-Fusion             | `true`  |
| `ENABLE_DECOMPOSITION`    | Enable query decomposition    | `true`  |
| `ENABLE_STEP_BACK`        | Enable step-back prompting    | `true`  |
| `ENABLE_HYDE`             | Enable HyDE                   | `true`  |
| `ENABLE_LOGICAL_ROUTING`  | Enable logical routing        | `true`  |
| `ENABLE_SEMANTIC_ROUTING` | Enable semantic routing       | `true`  |

## 🏗️ Architecture

### Pipeline Components

1. **Indexing**: Document loading, chunking, and vector store creation
2. **Query Transformation**: Multi-query, RAG-Fusion, decomposition, step-back, HyDE
3. **Retrieval**: Document similarity search and ranking
4. **Routing**: Logical and semantic query routing
5. **Generation**: Response generation using LLMs

### API Architecture

- **FastAPI**: Modern, fast web framework
- **Pydantic**: Data validation and serialization
- **Uvicorn**: ASGI server
- **OpenAPI**: Automatic API documentation

## 🐛 Troubleshooting

### Common Issues

1. **API Key Errors**

   - Ensure GROQ_API_KEY is set correctly
   - Check API key permissions and quotas

2. **Document Loading Errors**

   - Verify documents_path exists and contains .txt files
   - Check file permissions

3. **Memory Issues**

   - Reduce chunk_size and top_k parameters
   - Use smaller embedding models

4. **Slow Performance**
   - Enable caching for embeddings
   - Use faster embedding models
   - Optimize chunk sizes

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
python -m src --query "test query" --config config.yml
```

## 📚 API Documentation

Once the API is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Original RAG ecosystem implementation by Fareed Khan
- LangChain community for excellent documentation and tools
- HuggingFace for open-source embedding models
- GROQ for fast LLM inference

# DIAGNOSTICS.md

## Missing External Resources

This document lists the external resources that need to be provided for the RAG pipeline to function properly.

### Required API Keys

1. **GROQ_API_KEY**

   - **Purpose**: Access to GROQ's LLM API for response generation
   - **How to obtain**: Sign up at https://console.groq.com/
   - **Environment variable**: `GROQ_API_KEY`
   - **Status**: ⚠️ **REQUIRED** - Pipeline will fail without this

2. **GEMINI_API_KEY**
   - **Purpose**: Access to Google's Gemini API (alternative LLM)
   - **How to obtain**: Sign up at https://makersuite.google.com/
   - **Environment variable**: `GEMINI_API_KEY`
   - **Status**: ✅ **OPTIONAL** - Used as fallback if available

### Required Document Files

1. **HR Policy Documents**
   - **Location**: `rag/uptiq_hr_policies/`
   - **Format**: `.txt` files
   - **Expected files**:
     - `employee_code_of_conduct.txt`
     - `leave_policy.txt`
     - `work_from_home_policy.txt`
     - `payroll_and_compensation_policy.txt`
     - `performance_review_policy.txt`
     - `it_and_security_policy.txt`
   - **Status**: ⚠️ **REQUIRED** - Pipeline will use mock responses without these

### Model Downloads (Automatic)

1. **HuggingFace Embedding Models**
   - **Model**: `all-MiniLM-L6-v2` (default)
   - **Alternative**: `all-mpnet-base-v2` (better quality, slower)
   - **Download**: Automatic on first use
   - **Size**: ~80MB
   - **Status**: ✅ **AUTOMATIC** - Downloads on first run

### External Dependencies

1. **LangChain Hub**

   - **Purpose**: Pre-built prompt templates
   - **Access**: Public, no API key required
   - **Status**: ✅ **PUBLIC** - No authentication needed

2. **ChromaDB**
   - **Purpose**: Vector database for embeddings
   - **Mode**: In-memory (no external DB required)
   - **Status**: ✅ **SELF-CONTAINED** - No external setup needed

## Setup Instructions

### 1. API Keys Setup

Create a `.env` file in the project root:

```bash
# Copy the example file
cp env.example .env

# Edit with your actual API keys
GROQ_API_KEY=your_actual_groq_api_key_here
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 2. Document Setup

Ensure your HR policy documents are in the correct location:

```bash
# Create the directory if it doesn't exist
mkdir -p rag/uptiq_hr_policies

# Add your policy files (example)
echo "This is a sample leave policy document..." > rag/uptiq_hr_policies/leave_policy.txt
echo "This is a sample code of conduct document..." > rag/uptiq_hr_policies/employee_code_of_conduct.txt
# ... add other policy files
```

### 3. Verify Setup

Test the setup with a simple query:

```bash
# Test CLI
python -m src --query "What are the leave policies?" --config config.yml

# Test API
curl -X POST "http://localhost:8000/api/v1/query" \
     -H "Content-Type: application/json" \
     -d '{"query": "What are the leave policies?"}'
```

## Troubleshooting

### Common Issues

1. **"Pipeline not initialized" error**

   - Check that GROQ_API_KEY is set correctly
   - Verify API key has sufficient quota

2. **"Documents path not found" error**

   - Ensure `rag/uptiq_hr_policies/` directory exists
   - Check that it contains `.txt` files

3. **Slow first startup**

   - Normal behavior - downloading embedding models
   - Subsequent startups will be faster

4. **Memory issues**
   - Reduce `CHUNK_SIZE` and `TOP_K` in configuration
   - Use smaller embedding model (`all-MiniLM-L6-v2`)

### Mock Mode

If external resources are unavailable, the pipeline will run in "mock mode":

- Returns placeholder responses
- Logs warnings about missing resources
- Useful for testing the pipeline structure

### Alternative Configurations

For development/testing without external APIs:

```yaml
# config-dev.yml
groq_api_key: "mock_key"
gemini_api_key: "mock_key"
documents_path: "test_documents"
enable_multi_query: false
enable_rag_fusion: false
# ... other settings
```

## Resource Requirements

### Minimum System Requirements

- **RAM**: 2GB (4GB recommended)
- **Storage**: 1GB free space
- **CPU**: 2 cores (4 cores recommended)
- **Network**: Internet connection for API calls and model downloads

### Production Recommendations

- **RAM**: 8GB+
- **Storage**: 10GB+ SSD
- **CPU**: 4+ cores
- **Network**: Stable internet with low latency to API providers

## Security Considerations

1. **API Key Security**

   - Never commit API keys to version control
   - Use environment variables or secure secret management
   - Rotate keys regularly

2. **Document Security**

   - Ensure policy documents don't contain sensitive information
   - Use appropriate file permissions
   - Consider document encryption for highly sensitive content

3. **Network Security**
   - Use HTTPS in production
   - Implement rate limiting
   - Monitor API usage for anomalies

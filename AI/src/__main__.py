"""
CLI interface for the RAG pipeline.
"""

import argparse
import yaml
import json
from pathlib import Path
from typing import Dict, Any

from .orchestrator import RAGPipeline, PipelineConfig


def load_config(config_path: str) -> Dict[str, Any]:
    """Load configuration from YAML file."""
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(description="RAG Pipeline CLI")
    parser.add_argument("--query", required=True, help="Query to process")
    parser.add_argument("--config", default="config.yml", help="Configuration file path")
    parser.add_argument("--output", help="Output file path (JSON)")
    parser.add_argument("--method", choices=[
        "basic", "multi_query", "rag_fusion", "decomposition", "step_back", "hyde"
    ], default="basic", help="Query transformation method")
    
    args = parser.parse_args()
    
    # Load configuration
    try:
        config_dict = load_config(args.config)
    except FileNotFoundError:
        print(f"Config file {args.config} not found. Using default configuration.")
        config_dict = {}
    
    # Override method if specified
    if args.method != "basic":
        config_dict["transformation_method"] = args.method
    
    # Create pipeline
    pipeline = RAGPipeline(PipelineConfig(**config_dict))
    
    # Run pipeline
    result = pipeline.run_pipeline(args.query, config_dict)
    
    # Output results
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"Results saved to {args.output}")
    else:
        print("=" * 50)
        print("RAG Pipeline Results")
        print("=" * 50)
        print(f"Query: {result['query']}")
        print(f"Method: {result['pipeline_stages'].get('query_transformation', {}).get('method', 'basic')}")
        print(f"Execution Time: {result['execution_time']:.2f}s")
        print("\nFinal Answer:")
        print("-" * 30)
        print(result['final_answer'])
        
        if 'error' in result:
            print(f"\nError: {result['error']}")


if __name__ == "__main__":
    main()

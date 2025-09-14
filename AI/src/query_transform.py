"""
Query transformation module for RAG pipeline.

Implements various query transformation techniques including multi-query generation,
RAG-Fusion, decomposition, step-back prompting, and HyDE.
"""

from typing import List, Dict, Any
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import FewShotChatMessagePromptTemplate
from langchain.load import dumps, loads
from langchain_core.runnables import RunnablePassthrough
from langchain_core.documents import Document


class QueryTransformer:
    """Handles various query transformation techniques."""
    
    def __init__(self, llm):
        """Initialize with an LLM instance."""
        self.llm = llm
    
    def multi_query_generation(self, question: str, num_queries: int = 5) -> List[str]:
        """Generate multiple versions of a query."""
        template = """You are an AI language model assistant. Your task is to generate five 
different versions of the given user question to retrieve relevant documents from a vector 
database. By generating multiple perspectives on the user question, your goal is to help
the user overcome some of the limitations of the distance-based similarity search. 
Provide these alternative questions separated by newlines. Original question: {question}"""
        
        prompt = ChatPromptTemplate.from_template(template)
        
        generate_queries = (
            prompt 
            | self.llm
            | StrOutputParser() 
            | (lambda x: x.split("\n"))
        )
        
        return generate_queries.invoke({"question": question})
    
    def rag_fusion_generation(self, question: str, num_queries: int = 4) -> List[str]:
        """Generate queries for RAG-Fusion approach."""
        template = """You are a helpful assistant that generates multiple search queries based on a single input query. \n
Generate multiple search queries related to: {question} \n
Output (4 queries):"""
        
        prompt = ChatPromptTemplate.from_template(template)
        
        generate_queries = (
            prompt 
            | self.llm
            | StrOutputParser() 
            | (lambda x: x.split("\n"))
        )
        
        return generate_queries.invoke({"question": question})
    
    def decomposition(self, question: str, num_subquestions: int = 3) -> List[str]:
        """Decompose complex questions into sub-questions."""
        template = """You are a helpful assistant that generates multiple sub-questions related to an input question. \n
The goal is to break down the input into a set of sub-problems / sub-questions that can be answers in isolation. \n
Generate multiple search queries related to: {question} \n
Output (3 queries):"""
        
        prompt = ChatPromptTemplate.from_template(template)
        
        generate_queries = (
            prompt 
            | self.llm
            | StrOutputParser() 
            | (lambda x: x.split("\n"))
        )
        
        return generate_queries.invoke({"question": question})
    
    def step_back_prompting(self, question: str) -> str:
        """Generate step-back questions using few-shot examples."""
        examples = [
            {
                "input": "Can I carry forward 8 unused annual leave days into the next year?",
                "output": "What is Uptiq's policy on carrying forward unused annual leave?",
            },
            {
                "input": "Do I get reimbursed if I buy my own Wi-Fi router while working from home?",
                "output": "What expenses are reimbursed under Uptiq's Work From Home policy?",
            },
        ]
        
        example_prompt = ChatPromptTemplate.from_messages([
            ("human", "{input}"),
            ("ai", "{output}")
        ])
        
        few_shot_prompt = FewShotChatMessagePromptTemplate(
            example_prompt=example_prompt,
            examples=examples,
        )
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", 
             "You are an AI assistant trained on HR policies of Uptiq. Your task is to step back and paraphrase a question "
             "to a more generic step-back question, which is easier to answer. Here are a few examples:"),
            few_shot_prompt,
            ("user", "{question}"),
        ])
        
        generate_step_back = prompt | self.llm | StrOutputParser()
        return generate_step_back.invoke({"question": question})
    
    def hyde_generation(self, question: str) -> str:
        """Generate hypothetical document for HyDE approach."""
        template = """Please write a scientific paper passage to answer the question
Question: {question}
Passage:"""
        
        prompt = ChatPromptTemplate.from_template(template)
        
        generate_docs = (
            prompt 
            | self.llm
            | StrOutputParser() 
        )
        
        return generate_docs.invoke({"question": question})


class DocumentReranker:
    """Handles document reranking using Reciprocal Rank Fusion."""
    
    @staticmethod
    def reciprocal_rank_fusion(results: List[List[Document]], k: int = 60) -> List[tuple]:
        """Apply Reciprocal Rank Fusion to combine multiple ranked lists."""
        fused_scores = {}
        
        for docs in results:
            for rank, doc in enumerate(docs):
                doc_str = dumps(doc)
                if doc_str not in fused_scores:
                    fused_scores[doc_str] = 0
                fused_scores[doc_str] += 1 / (rank + k)
        
        reranked_results = [
            (loads(doc), score)
            for doc, score in sorted(fused_scores.items(), key=lambda x: x[1], reverse=True)
        ]
        return reranked_results
    
    @staticmethod
    def get_unique_union(documents: List[List[Document]]) -> List[Document]:
        """Get unique union of retrieved documents."""
        flattened_docs = [dumps(doc) for sublist in documents for doc in sublist]
        unique_docs = list(set(flattened_docs))
        return [loads(doc) for doc in unique_docs]

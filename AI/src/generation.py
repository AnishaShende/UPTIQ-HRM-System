"""
Generation module for RAG pipeline.

Handles response generation using LLMs and prompt templates.
"""

from typing import Dict, Any, List
from langchain import hub
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.documents import Document


class ResponseGenerator:
    """Handles response generation for RAG pipeline."""
    
    def __init__(self, llm):
        """Initialize with an LLM instance."""
        self.llm = llm
        self.prompt_rag = hub.pull("rlm/rag-prompt")
    
    def generate_response(self, context: str, question: str) -> str:
        """Generate response using context and question."""
        chain = (
            {"context": RunnablePassthrough(), "question": RunnablePassthrough()}
            | self.prompt_rag
            | self.llm
            | StrOutputParser()
        )
        
        return chain.invoke({"context": context, "question": question})
    
    def generate_response_from_docs(self, docs: List[Document], question: str) -> str:
        """Generate response from retrieved documents."""
        context = self.format_documents(docs)
        return self.generate_response(context, question)
    
    def format_documents(self, docs: List[Document]) -> str:
        """Format documents for use in prompts."""
        return "\n\n".join(doc.page_content for doc in docs)
    
    def generate_decomposed_response(self, sub_questions: List[str], sub_answers: List[str], original_question: str) -> str:
        """Generate final response from decomposed Q&A pairs."""
        context = self.format_qa_pairs(sub_questions, sub_answers)
        
        template = """Here is a set of Q+A pairs:

{context}

Use these to synthesize an answer to the original question: {question}
"""
        prompt = ChatPromptTemplate.from_template(template)
        
        chain = (
            prompt
            | self.llm
            | StrOutputParser()
        )
        
        return chain.invoke({"context": context, "question": original_question})
    
    def format_qa_pairs(self, questions: List[str], answers: List[str]) -> str:
        """Format Q&A pairs into context string."""
        formatted_string = ""
        for i, (question, answer) in enumerate(zip(questions, answers), start=1):
            formatted_string += f"Question {i}: {question}\nAnswer {i}: {answer}\n\n"
        return formatted_string.strip()
    
    def generate_step_back_response(self, normal_context: List[Document], step_back_context: List[Document], question: str) -> str:
        """Generate response using both normal and step-back context."""
        normal_context_str = self.format_documents(normal_context)
        step_back_context_str = self.format_documents(step_back_context)
        
        template = """You are an AI assistant trained on HR policies of Uptiq. I am going to ask you a question. Your response should be comprehensive and not contradicted with the following context if they are relevant. Otherwise, ignore them if they are not relevant.

# Normal Context
{normal_context}

# Step-Back Context
{step_back_context}

# Original Question: {question}
# Answer:"""
        
        prompt = ChatPromptTemplate.from_template(template)
        
        chain = (
            prompt
            | self.llm
            | StrOutputParser()
        )
        
        return chain.invoke({
            "normal_context": normal_context_str,
            "step_back_context": step_back_context_str,
            "question": question
        })

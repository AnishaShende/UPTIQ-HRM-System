"""
Routing module for RAG pipeline.

Implements logical and semantic routing techniques.
"""

from typing import Literal, Dict, Any, List
# from langchain_core.pydantic_v1 import BaseModel, Field
from pydantic import BaseModel
from pydantic import Field
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate
from langchain.utils.math import cosine_similarity
from langchain_huggingface import HuggingFaceEmbeddings


class RouteQuery(BaseModel):
    """Data model for routing queries to HR policy files."""
    
    file_name: Literal[
        "employee_code_of_conduct.txt",
        "leave_policy.txt", 
        "work_from_home_policy.txt",
        "payroll_and_compensation_policy.txt",
        "performance_review_policy.txt",
        "it_and_security_policy.txt"
    ] = Field(
        ...,
        description=(
            "Given a user question, choose which HR policy file "
            "would be most relevant for answering their question."
        ),
    )


class LogicalRouter:
    """Handles logical routing using structured LLM output."""
    
    def __init__(self, llm):
        """Initialize with an LLM instance."""
        self.llm = llm
        self.structured_llm = llm.with_structured_output(RouteQuery)
        
        system = """You are an expert at routing a user question to the appropriate data source.
Given a user question, choose which HR policy file would be most relevant for answering their question."""
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", system),
            ("human", "{question}"),
        ])
        
        self.router = self.prompt | self.structured_llm
    
    def route_query(self, question: str) -> RouteQuery:
        """Route a query to the appropriate policy file."""
        return self.router.invoke({"question": question})


class SemanticRouter:
    """Handles semantic routing using embedding similarity."""
    
    def __init__(self, embedding_model: str = "all-MiniLM-L6-v2"):
        """Initialize with embedding model."""
        self.embeddings = HuggingFaceEmbeddings(model_name=embedding_model)
        
        # Define expert templates
        self.hr_template = """You are an HR policies assistant for the company Uptiq.
    You answer questions about leave policies, payroll, employee benefits, and workplace compliance.
    Always explain clearly and reference HR rules.

    Here is a question:
{query}"""

        self.it_template = """You are an IT helpdesk expert.
    You answer questions related to technical troubleshooting, software, hardware,
    network issues, and security guidelines in a simple and actionable way.

    Here is a question:
{query}"""

        self.law_template = """You are a legal advisor. 
    You explain laws, regulations, workplace compliance, contracts, and employee rights 
    in a clear and simple manner. 
    Always include a disclaimer that this is not professional legal advice.

    Here is a question:
{query}"""
        
        # Store templates and their embeddings
        self.prompt_templates = [self.hr_template, self.it_template, self.law_template]
        self.template_names = ["hr_template", "it_template", "law_template"]
        self.prompt_embeddings = self.embeddings.embed_documents(self.prompt_templates)
    
    def route_query(self, query: str) -> Dict[str, Any]:
        """Route query to the most similar prompt template."""
        # Embed the query
        query_embedding = self.embeddings.embed_query(query)
        
        # Compute cosine similarity
        similarity = cosine_similarity([query_embedding], self.prompt_embeddings)[0]
        
        # Find most similar template
        most_similar_index = similarity.argmax()
        chosen_name = self.template_names[most_similar_index]
        chosen_prompt = self.prompt_templates[most_similar_index]
        
        return {
            "template_name": chosen_name,
            "template": chosen_prompt,
            "similarity_score": float(similarity[most_similar_index])
        }
    
    def get_prompt_template(self, query: str) -> PromptTemplate:
        """Get the most appropriate prompt template for a query."""
        routing_result = self.route_query(query)
        return PromptTemplate.from_template(routing_result["template"])

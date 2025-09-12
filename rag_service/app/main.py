from fastapi import FastAPI
from pydantic import BaseModel
import os

from .rag_pipeline import RAGPipeline


class AskRequest(BaseModel):
    question: str
    k: int | None = 4


class AskResponse(BaseModel):
    answer: str
    sources: list[str]


def create_app() -> FastAPI:
    app = FastAPI(title="RAG Service", version="1.0.0")

    data_docs_path = os.environ.get("RAG_DATA_DIR", "/workspace/rag/uptiq_hr_policies")
    persist_dir = os.environ.get("RAG_PERSIST_DIR", "/data/chroma")
    openai_key = os.environ.get("OPENAI_API_KEY")

    pipeline = RAGPipeline(
        data_docs_path=data_docs_path,
        persist_dir=persist_dir,
        openai_api_key=openai_key,
    )

    @app.get("/health")
    def health():
        try:
            pipeline.ensure_ready()
            return {"status": "ok"}
        except Exception as e:
            return {"status": "error", "detail": str(e)}

    @app.post("/ask", response_model=AskResponse)
    def ask(req: AskRequest):
        answer, sources = pipeline.answer(req.question, k=req.k or 4)
        return AskResponse(answer=answer, sources=sources)

    return app


app = create_app()


from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
from dotenv import load_dotenv

from upload_handler import process_upload
from query_engine import query_documents, initialize_vectorstore

load_dotenv()

app = FastAPI(title="DocuMind API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],  # Added 5174
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize vector store on startup
@app.on_event("startup")
async def startup_event():
    initialize_vectorstore()
    os.makedirs("uploads", exist_ok=True)

# Request/Response models
class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    answer: str
    sources: List[dict]

class UploadResponse(BaseModel):
    filename: str
    status: str
    chunks_created: int


@app.get("/")
async def root():
    return {"message": "DocuMind API is running", "status": "healthy"}

@app.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    try:
        
        file_path = os.path.join("uploads", file.filename)
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
     
        chunks_created = process_upload(file_path, file.filename)
        
        return UploadResponse(
            filename=file.filename,
            status="success",
            chunks_created=chunks_created
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    try:
        answer, sources = query_documents(request.question)
        
        return QueryResponse(
            answer=answer,
            sources=sources
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")


@app.get("/documents")
async def get_documents():
    try:
        uploads_dir = "uploads"
        if not os.path.exists(uploads_dir):
            return {"documents": []}
        
        documents = []
        for filename in os.listdir(uploads_dir):
            file_path = os.path.join(uploads_dir, filename)
            file_size = os.path.getsize(file_path)
            documents.append({
                "name": filename,
                "size": file_size,
                "path": file_path
            })
        
        return {"documents": documents}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get documents: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
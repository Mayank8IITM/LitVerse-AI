from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, coach, stories, vocab

app = FastAPI(
    title="LitVerse AI Backend",
    description="FastAPI backend for the LitVerse AI literacy game.",
    version="1.0.0",
)

# Configure CORS for the Next.js frontend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(coach.router, prefix="/api/coach", tags=["AI Coach"])
app.include_router(stories.router, prefix="/api/stories", tags=["Stories"])
app.include_router(vocab.router, prefix="/api/vocab", tags=["Vocab"])

@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint to verify backend status."""
    return {"status": "ok", "message": "LitVerse AI backend is running"}

@app.get("/", tags=["System"])
async def root():
    """Root endpoint."""
    return {"message": "Welcome to LitVerse AI API. Go to /docs for Swagger UI."}

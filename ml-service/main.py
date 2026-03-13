"""
Supply Chain Disruption Early Warning System — ML Service
FastAPI application for Isolation Forest anomaly detection,
VADER/TextBlob NLP sentiment analysis, and risk scoring.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.predict import router as predict_router
from routes.whatif import router as whatif_router
from routes.sentiment import router as sentiment_router

app = FastAPI(
    title="Supply Chain EWS — ML Service",
    description="ML/NLP microservice for risk prediction & sentiment analysis",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(predict_router, prefix="/predict", tags=["Prediction"])
app.include_router(whatif_router, prefix="/whatif", tags=["What-If Simulation"])
app.include_router(sentiment_router, prefix="/sentiment", tags=["NLP Sentiment"])


@app.get("/")
async def root():
    return {"service": "Supply Chain EWS ML Service", "status": "running", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "models_loaded": True}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

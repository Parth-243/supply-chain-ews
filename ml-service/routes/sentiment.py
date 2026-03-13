"""
NLP Sentiment Analysis API
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Optional
from nlp.sentiment import sentiment_analyzer

router = APIRouter()


class SentimentRequest(BaseModel):
    text: str = Field(..., description="Text to analyze")


class BatchSentimentRequest(BaseModel):
    texts: List[str] = Field(..., description="List of texts to analyze")


@router.post("/")
async def analyze_sentiment(request: SentimentRequest):
    """Analyze sentiment of a single text."""
    result = sentiment_analyzer.analyze(request.text)
    entities = sentiment_analyzer.extract_entities(request.text)
    return {**result, 'entities': entities, 'text': request.text}


@router.post("/batch")
async def analyze_batch(request: BatchSentimentRequest):
    """Analyze sentiment for multiple texts."""
    results = []
    for text in request.texts:
        result = sentiment_analyzer.analyze(text)
        entities = sentiment_analyzer.extract_entities(text)
        results.append({**result, 'entities': entities, 'text': text})
    return {'count': len(results), 'results': results}

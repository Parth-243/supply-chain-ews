"""
Prediction API — Risk score prediction endpoint
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from models.isolation_forest import anomaly_detector
from models.risk_scorer import risk_scorer

router = APIRouter()


class PredictionRequest(BaseModel):
    delay_ratio: float = Field(0.1, ge=0, le=1)
    port_congestion: float = Field(0.3, ge=0, le=1)
    weather_severity: float = Field(0.2, ge=0, le=1)
    sentiment_score: float = Field(0.0, ge=-1, le=1)
    historical_reliability: float = Field(0.85, ge=0, le=1)
    volume_change: float = Field(0.0, ge=-1, le=1)
    weather_risk: Optional[float] = Field(20, ge=0, le=100)
    historical_delay: Optional[float] = Field(15, ge=0, le=100)


@router.post("/")
async def predict_risk(request: PredictionRequest):
    """
    Predict disruption risk score for given shipment features.
    Returns anomaly detection results and overall risk score.
    """
    # Step 1: Anomaly detection
    anomaly_result = anomaly_detector.predict({
        'delay_ratio': request.delay_ratio,
        'port_congestion': request.port_congestion,
        'weather_severity': request.weather_severity,
        'sentiment_score': request.sentiment_score,
        'historical_reliability': request.historical_reliability,
        'volume_change': request.volume_change,
    })

    # Step 2: Convert sentiment to risk (negative sentiment = higher risk)
    sentiment_risk = max(0, min(100, int((1 - request.sentiment_score) * 50)))

    # Step 3: Calculate overall risk score
    risk_result = risk_scorer.calculate(
        anomaly_score=anomaly_result['anomaly_score'],
        sentiment_risk=sentiment_risk,
        weather_risk=request.weather_risk or 20,
        historical_delay=request.historical_delay or 15,
    )

    return {
        'risk_score': risk_result['overall_score'],
        'risk_level': risk_result['risk_level'],
        'confidence': risk_result['confidence'],
        'anomaly_detection': anomaly_result,
        'components': risk_result['components'],
        'weights': risk_result['weights'],
        'disruption_probability': anomaly_detector.predict_proba({
            'delay_ratio': request.delay_ratio,
            'port_congestion': request.port_congestion,
            'weather_severity': request.weather_severity,
            'sentiment_score': request.sentiment_score,
            'historical_reliability': request.historical_reliability,
            'volume_change': request.volume_change,
        })
    }

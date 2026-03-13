"""
What-If Simulation API — Scenario testing endpoint
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from models.isolation_forest import anomaly_detector
from models.risk_scorer import risk_scorer

router = APIRouter()


class WhatIfRequest(BaseModel):
    portStatus: bool = Field(True, description="Is the port open? False = closed")
    weatherSeverity: float = Field(0.2, ge=0, le=1, description="Weather severity 0-1")
    strikeProbability: float = Field(0.0, ge=0, le=1, description="Strike probability 0-1")
    congestionLevel: float = Field(0.3, ge=0, le=1, description="Port congestion 0-1")
    region: Optional[str] = Field("Global", description="Region being simulated")


@router.post("/")
async def simulate_whatif(request: WhatIfRequest):
    """
    What-If simulation: test impact of closing ports, weather events, strikes etc.
    Returns simulated risk score and breakdown.
    """
    # Build feature vector from What-If inputs
    port_factor = 0.9 if not request.portStatus else 0.1
    weather_factor = request.weatherSeverity
    strike_factor = request.strikeProbability
    congestion_factor = request.congestionLevel

    # Run through anomaly detector
    anomaly_result = anomaly_detector.predict({
        'delay_ratio': port_factor * 0.8 + strike_factor * 0.2,
        'port_congestion': congestion_factor,
        'weather_severity': weather_factor,
        'sentiment_score': -(strike_factor * 0.5 + (1 - int(request.portStatus)) * 0.5),
        'historical_reliability': 1 - (port_factor * 0.3 + weather_factor * 0.3),
        'volume_change': congestion_factor * 0.5,
    })

    # Calculate component risks
    weather_risk = int(weather_factor * 100)
    sentiment_risk = int((strike_factor * 0.5 + (1 - int(request.portStatus)) * 0.5) * 100)
    historical = int(congestion_factor * 50)

    # Overall risk
    risk_result = risk_scorer.calculate(
        anomaly_score=anomaly_result['anomaly_score'],
        sentiment_risk=sentiment_risk,
        weather_risk=weather_risk,
        historical_delay=historical,
    )

    simulated_risk = risk_result['overall_score']

    return {
        'simulatedRiskScore': simulated_risk,
        'confidence': int(risk_result['confidence'] * 100),
        'breakdown': {
            'portClosure': int(port_factor * 100) if not request.portStatus else 0,
            'weatherImpact': weather_risk,
            'strikeRisk': int(strike_factor * 100),
            'congestion': int(congestion_factor * 100)
        },
        'components': risk_result['components'],
        'recommendation': (
            'HIGH RISK: Immediate rerouting recommended' if simulated_risk >= 80
            else 'MODERATE RISK: Monitor closely, prepare contingency' if simulated_risk >= 50
            else 'LOW RISK: Continue as planned'
        ),
        'risk_level': risk_result['risk_level'],
        'region': request.region,
        'isSimulation': True
    }

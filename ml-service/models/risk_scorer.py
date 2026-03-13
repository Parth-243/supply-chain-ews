"""
Risk Score Calculator
Combines anomaly detection, sentiment analysis, weather risk, and historical delay
into a single 0-100 disruption risk score.

Formula: 0.4 × anomaly_score + 0.3 × sentiment_risk + 0.2 × weather_risk + 0.1 × historical_delay
"""


class RiskScorer:
    WEIGHTS = {
        'anomaly': 0.4,
        'sentiment': 0.3,
        'weather': 0.2,
        'historical': 0.1
    }

    def calculate(self, anomaly_score: float, sentiment_risk: float,
                  weather_risk: float, historical_delay: float) -> dict:
        """
        Calculate overall risk score.

        All inputs should be 0-100 scale.
        Returns dict with overall score, components, and confidence.
        """
        overall = (
            self.WEIGHTS['anomaly'] * anomaly_score +
            self.WEIGHTS['sentiment'] * sentiment_risk +
            self.WEIGHTS['weather'] * weather_risk +
            self.WEIGHTS['historical'] * historical_delay
        )

        overall = max(0, min(100, round(overall)))

        # Confidence is higher when components agree
        scores = [anomaly_score, sentiment_risk, weather_risk, historical_delay]
        variance = sum((s - overall) ** 2 for s in scores) / len(scores)
        confidence = max(0.3, min(0.95, 1 - (variance / 5000)))

        return {
            'overall_score': overall,
            'components': {
                'anomaly_score': round(anomaly_score, 1),
                'sentiment_risk': round(sentiment_risk, 1),
                'weather_risk': round(weather_risk, 1),
                'historical_delay': round(historical_delay, 1)
            },
            'weights': self.WEIGHTS,
            'confidence': round(confidence, 3),
            'risk_level': self._classify_risk(overall)
        }

    def _classify_risk(self, score: float) -> str:
        if score >= 80:
            return 'critical'
        elif score >= 60:
            return 'high'
        elif score >= 40:
            return 'moderate'
        elif score >= 20:
            return 'low'
        return 'minimal'


risk_scorer = RiskScorer()

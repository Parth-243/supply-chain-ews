"""
NLP Sentiment Analyzer using VADER
Analyzes news headlines and text for supply chain risk sentiment.
"""

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


class SentimentAnalyzer:
    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()

        # Add supply-chain specific lexicon
        supply_chain_lexicon = {
            'disruption': -2.5,
            'blockage': -2.8,
            'strike': -2.0,
            'congestion': -1.5,
            'shortage': -2.0,
            'delay': -1.5,
            'tariff': -1.0,
            'sanctions': -2.0,
            'embargo': -2.5,
            'conflict': -2.0,
            'earthquake': -3.0,
            'tsunami': -3.5,
            'cyclone': -2.5,
            'hurricane': -2.5,
            'flood': -2.0,
            'drought': -1.5,
            'pandemic': -3.0,
            'closure': -2.0,
            'reroute': -1.0,
            'cyberattack': -2.5,
            'bankruptcy': -3.0,
            'efficient': 2.0,
            'expansion': 1.5,
            'record throughput': 2.5,
            'reopens': 2.0,
            'recovery': 1.5,
            'stabilized': 1.5,
            'growth': 1.0,
        }
        self.analyzer.lexicon.update(supply_chain_lexicon)

    def analyze(self, text: str) -> dict:
        """
        Analyze sentiment of text.

        Returns:
            dict with score (-1 to 1), label, confidence, and compound score
        """
        scores = self.analyzer.polarity_scores(text)

        compound = scores['compound']

        if compound >= 0.05:
            label = 'positive'
        elif compound <= -0.05:
            label = 'negative'
        else:
            label = 'neutral'

        # Convert to risk score (0-100, higher = more risky)
        risk_score = max(0, min(100, int((1 - compound) * 50)))

        return {
            'score': round(compound, 4),
            'label': label,
            'confidence': round(abs(compound), 4),
            'risk_score': risk_score,
            'details': {
                'positive': scores['pos'],
                'negative': scores['neg'],
                'neutral': scores['neu']
            }
        }

    def analyze_batch(self, texts: list) -> list:
        """Analyze sentiment for a list of texts."""
        return [self.analyze(text) for text in texts]

    def extract_entities(self, text: str) -> list:
        """Simple entity extraction for supply chain context."""
        entities = []
        # Port/location keywords
        locations = ['Shanghai', 'Singapore', 'Rotterdam', 'Los Angeles', 'Dubai',
                     'Hamburg', 'Busan', 'Mumbai', 'Santos', 'Mombasa', 'Suez',
                     'Panama', 'Yokohama', 'Piraeus', 'Colombo', 'Red Sea',
                     'Mediterranean', 'Baltic', 'China', 'India', 'Japan',
                     'Brazil', 'EU', 'US', 'UK']

        events = ['strike', 'cyclone', 'earthquake', 'flood', 'drought',
                  'blockage', 'closure', 'embargo', 'sanctions', 'tariff',
                  'cyber attack', 'pandemic', 'shortage', 'congestion']

        for loc in locations:
            if loc.lower() in text.lower():
                entities.append({'text': loc, 'type': 'location'})

        for event in events:
            if event.lower() in text.lower():
                entities.append({'text': event.title(), 'type': 'event'})

        return entities


sentiment_analyzer = SentimentAnalyzer()

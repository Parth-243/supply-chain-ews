# 📁 Data Directory

This folder is reserved for **custom datasets** used by the Supply Chain Disruption Early Warning System.

## Expected Datasets

| Dataset | Format | Description |
|---------|--------|-------------|
| `shipments.csv` | CSV | Historical shipment records (origin, destination, ETA, delays) |
| `news_articles.csv` | CSV | News headlines with sentiment labels for NLP training |
| `weather_events.csv` | CSV | Weather events mapped to shipping lanes |
| `port_congestion.csv` | CSV | Port congestion records with timestamps |
| `training_data/` | Directory | Processed features for ML model training |

## Data Guidelines

- **Do NOT commit** sensitive or proprietary data to Git
- Add large datasets to `.gitignore` if needed
- Use CSV or JSON format for maximum compatibility
- Include a data dictionary for each dataset

## Usage

- **Backend seed script** (`backend/seed/seedData.js`) uses synthetic data by default
- Replace with real data sources by updating the seed script or ingestion pipeline
- The ML service (`ml-service/`) expects feature vectors extracted from these datasets

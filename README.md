# 🚨 Supply Chain Disruption Early Warning System

> **Proactive Machine Learning Framework for Risk Detection**  
> Detect supply chain disruptions 48–72 hours in advance using AI/ML, NLP sentiment analysis, and real-time data fusion.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Stack](https://img.shields.io/badge/stack-MERN%20%2B%20Python-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│   Dashboard │ Heatmap │ What-If │ Alerts │ Notifications │
├─────────────────────────────────────────────────────────┤
│                 Backend (Node.js/Express)                │
│    REST APIs │ Alert Engine │ Mitigation │ Health Monitor │
├─────────────────────────────────────────────────────────┤
│              ML Service (Python/FastAPI)                 │
│  Isolation Forest │ VADER NLP │ Risk Scorer │ What-If    │
├─────────────────────────────────────────────────────────┤
│                   MongoDB Database                       │
│  shipments │ alerts │ news_articles │ risk_scores        │
└─────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
├── frontend/          # Next.js 14 app (React dashboard)
├── backend/           # Node.js/Express REST API server
├── ml-service/        # Python FastAPI ML/NLP service
├── data/              # Seed data & synthetic datasets
└── README.md
```

## 🚀 Key Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Disruption Index Gauge** | Real-time risk "speedometer" (0–100) powered by Isolation Forest |
| 2 | **Interactive Risk Heatmap** | Global Leaflet map with glowing risk zones |
| 3 | **What-If Simulator** | Toggle port closures, weather events to simulate impact |
| 4 | **Sentiment Feed (NLP)** | AI-classified news with Red/Green/Gray sentiment tags |
| 5 | **Mitigation Suggestions** | Auto-generated reroute and supplier recommendations |
| 6 | **System Health Monitor** | API latency, DB ingestion rate, model confidence |
| 7 | **Active Critical Alerts** | Real-time alerts for Risk Score > 80 with pulsing indicators |
| 8 | **Predictive Confidence** | Model certainty % via `predict_proba()` |
| 9 | **Model Performance Logs** | MAE/F1-Score tracking with trend charts |
| 10 | **Notification Center** | Email (Nodemailer), SMS (Twilio), Push toggle settings |

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 14, React, Leaflet, Recharts, react-gauge-chart |
| **Backend** | Node.js, Express, Mongoose, Nodemailer |
| **ML/NLP** | Python, FastAPI, scikit-learn, VADER, XGBoost |
| **Database** | MongoDB |
| **DevOps** | Git, GitHub |

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd supply-chain-disruption-ews

# Backend
cd backend
npm install
npm run dev

# ML Service (new terminal)
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Environment Variables

Create `.env` files in each service directory. See `.env.example` files for reference.

## 👥 Team

| Team Member | Role & Responsibilities |
|-------------|-------------------------|
| **Parth Shrivastava** | Frontend Developer (Dashboard UI, Leaflet maps, What-If interaction) |
| **Parth Singh** | Backend & Data Processing (REST APIs, MongoDB schemas, alert schedulers) |
| **Vedant Trivedi** | ML Engineer (ML Model, Isolation Forest, NLP sentiment, risk score) |

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

> Built with ❤️ for the Xebia internship program by Parth Singh, Vedant Trivedi & Parth Shrivastava (UPES)

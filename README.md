
# AegisGrid

Counter-Swarm Decision Intelligence Platform

AegisGrid is a real-time drone swarm defense simulation platform that combines deterministic decision-making with an AI intelligence layer to provide explainable, actionable insights for defense operators. Live at ( https://aegis-grid.vercel.app/ )

⸻

## Overview

AegisGrid simulates hostile drone swarm scenarios and demonstrates how intelligent resource allocation reduces breach risk compared to a baseline strategy.

The system is designed with real-world defense principles:

* Real-time decisions → deterministic and reliable
* AI → advisory, explainable, and asynchronous
* Full pipeline visibility → from detection → decision → outcome

⸻

## Core Concept

Deterministic System → makes decisions
AI Layer → explains and analyzes decisions

This ensures:

* No latency in critical operations
* No AI hallucination affecting decisions
* High trust and auditability

⸻

## System Architecture

Frontend (React + Vite)
        ↓
Backend (FastAPI)
        ↓
Simulation Pipeline
        ↓
AI Intelligence Layer (OpenRouter)

⸻

## Backend Pipeline

The backend runs a complete defense simulation pipeline:

Drone Simulation
→ Sensor Detection
→ Track Fusion
→ Clustering
→ Threat Scoring
→ Decision Allocation
→ Evaluation Metrics

⸻

## AI Intelligence Layer

AI is used in three controlled areas only:

1. Snapshot Analysis (Live)

* Trigger: Analyze Current Situation
* Uses OpenRouter
* Analyzes current system snapshot

Outputs:

* Situation summary
* Primary risk
* Recommended focus
* Evidence-based reasoning

⸻

2. After-Action Report (Outcome)

* Trigger: Generate AI Report
* Converts metrics into command-level insights

Outputs:

* Summary
* Key findings
* Limitations
* Verdict

⸻

3. Decision Explanation (Partially AI)

* Explains why resources are assigned
* Uses deterministic + optional AI enhancement

⸻

❗ Important Design Decision

AI is NOT used in the live /state loop

/state → deterministic only (fast)
AI → on-demand endpoints (controlled)

Why?

* Prevent latency
* Avoid API rate limits
* Maintain real-time reliability

⸻

📂 Project Structure

AegisGrid/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── simulation.py
│   │   ├── sensor.py
│   │   ├── fusion.py
│   │   ├── clustering.py
│   │   ├── threat_engine.py
│   │   ├── decision.py
│   │   ├── evaluation.py
│   │   ├── ai_intelligence.py
│   │   ├── ai_provider.py
│   │   ├── ai_contract.py
│   │   └── config.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── api.ts
│   │   ├── types.ts
│   │   └── App.tsx
│   └── package.json
│
└── README.md

⸻

## Setup Instructions

1. Clone the repo

git clone <your-repo-url>
cd AegisGrid

⸻

2. Backend Setup

cd backend
python -m venv .venv

Activate:

# Windows
.venv\Scripts\Activate.ps1
# Mac/Linux
source .venv/bin/activate

Install dependencies:

pip install -r requirements.txt

⸻

3. Run Backend

uvicorn app.main:app --reload

Check:

http://127.0.0.1:8000/docs

⸻

4. Frontend Setup

cd frontend
npm install
npm run dev

⸻

🧪 Testing AI Features

Snapshot Analysis

1. Go to Live page
2. Click:

Analyze Current Situation

Expected:

Dynamic AI-generated analysis
trust_status = ai_generated_validated

⸻

After-Action Report

1. Go to Outcome page
2. Click:

Generate AI Report

Expected:

Dynamic AI report based on metrics

⸻

## Key Features

* Real-time swarm simulation
* Multi-stage detection pipeline
* Threat-based clustering
* Baseline vs AegisGrid comparison
* AI-powered snapshot analysis
* AI-generated after-action reporting

⸻

## Demo Flow (Recommended)

1. Start Live simulation
2. Change scenario
3. Show metrics (Baseline vs AegisGrid)
4. Click Analyze Current Situation
5. Explain AI output
6. Go to Outcome page
7. Click Generate AI Report

⸻

## Final Notes

* AI is intentionally controlled and not overused
* System prioritizes reliability over complexity
* Designed for explainability and decision support


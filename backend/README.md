# Aggroso Backend

This is the FastAPI backend for the Aggroso AI Workflow Builder. It manages workflow definitions, sequential step execution via Google Gemini, and persistent storage of execution history.

## 🛠️ Technology Stack
- **Framework**: FastAPI
- **LLM SDK**: Google Generative AI (`genai`)
- **ORM**: SQLAlchemy
- **Database**: PostgreSQL (via Neon)
- **Validation**: Pydantic
- **Containerization**: Docker

## 🚀 Getting Started

### Environment Setup
Create a `.env` file in this directory:
```env
GOOGLE_API_KEY=your_key_here
NEON_DATABASE_URL=your_postgresql_url
GEMINI_MODEL_ID=gemini-2.0-flash-exp
CORS_ORIGINS=http://localhost:5173
```

### Development
```bash
# Using a virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

## 🔌 API Endpoints

### Workflows
- `GET /api/workflows`: List all workflow definitions.
- `POST /api/workflows`: Save a new multi-step workflow.
- `GET /api/workflows/{id}`: Get details of a specific workflow.
- `POST /api/workflows/run-step`: Execute a single AI step.

### History (User Isolated)
- `GET /api/recent-runs?user_id=...`: Fetch history for a specific user ID.
- `POST /api/recent-runs`: Record a completed workflow run (must include `user_id`).
- `DELETE /api/recent-runs?user_id=...`: Clear history for a specific user ID.

### Health
- `GET /health`: General API health check.
- `GET /health/db`: Database connection check.
- `GET /health/gemini`: AI service connectivity check.

## 🤖 AI Workflow Engine
The backend implements a sequential execution pattern in `runner.py`. Each step in a workflow (Summarize, Extract, etc.) is translated into a targeted prompt for Gemini. The engine ensures the output of one step becomes the input for the next, maintaining context across the pipeline.

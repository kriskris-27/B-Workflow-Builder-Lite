# AI Notes & Development Credits

This project was built with a "human-in-the-loop" AI-driven development approach.

## 🤖 AI Stack
- **Development Assistant**: Antigravity (Google DeepMind).
- **Core LLM Provider**: Google Gemini (via Requesty/LiteLLM proxy).
- **Model Used**: `gemini-2.0-flash-exp` (or `gemini-2.5-flash-lite` depending on config).
- **Why Gemini?**: High context window, extremely fast "Flash" performance for multi-step pipelines, and excellent JSON/Structured output capabilities.

## ⚙️ AI Usage in Development
- **Architectural Design**: AI assisted in designing the decoupled frontend-backend architecture and the sequential step execution logic.
- **Component Drafting**: UI components (Dashboard, Sidebar, Creator) were initially scaffolded by AI and refined by human oversight.
- **Database Schema**: AI generated the initial SQLAlchemy models and Pydantic schemas.
- **Debugging**: AI was instrumental in identifying Docker network issues and Neon DB connection strings.

## ✅ Human Verification (What was checked)
- **Database Connectivity**: Manually verified Neon DB sessions and table migrations.
- **UI Responsiveness**: Manually tested transitions and glassmorphism effects across different viewport sizes.
- **Pipeline Integrity**: Verified that the output of "Step 1" correctly flows as input to "Step 2".
- **Environment Security**: Ensured no API keys are hardcoded and all sensitive data is handled via `.env`.
- **Error States**: Verified that empty inputs and API timeouts are handled gracefully in the UI.

## ⚠️ Known AI Quirks
- Occasional linting warnings in TypeScript about missing module declarations (usually resolved by local `npm install`).
- Early versions of the workflow runner needed manual prompt refinement to ensure consistent output formats.

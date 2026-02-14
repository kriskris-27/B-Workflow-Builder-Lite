# System Prompts & Development Log

This document serves as distinct record for:
1.  **Runtime Prompts**: The templates used by the Aggrosso backend (`runner.py`) to instruct the Gemini Flash model.
2.  **Development Meta-Prompts**: The high-level instructions used to scaffold and build the application itself.
3.  **Session Activity**: Key user requests that shaped the V1.2.0 refinement.

---

## 1. Runtime System Prompts (`runner.py`)

These text templates are injected with user data and sent to the LLM during workflow execution.

### `clean`
> "Clean and normalize the following text. Remove any unnecessary formatting or noise. Keep it concise:
> 
> {input_data}"

### `summarize`
> "Providing a concise summary of the following text:
> 
> {input_data}"

### `extract`
> "Extract the key entities and structured information from the following text as a JSON-like string:
> 
> {input_data}"

### `tag`
> "Categorize the following text with relevant tags based on its content. Return only a comma-separated list of tags:
> 
> {input_data}"

### `insight`
> "Read the following text and produce 3 short insights and 2 actionable recommendations. Keep each insight to one sentence and each recommendation short and specific:
> 
> {input_data}"

---

## 2. Development Meta-Prompts (Project Plan)

These prompts outline the phased approach used to construct the Aggrosso Neural Orchestrator from scratch.

### Phase 1: Environment & Schema (The Foundation)
> "Initialize a project with a React (Vite/TS/Tailwind) frontend and a FastAPI backend. Use Neon PostgreSQL with SQLAlchemy for the DB. Create a docker-compose.yml for local dev. Define a Pydantic schema for a 'Workflow' that contains an array of 'Steps' (clean, summarize, extract, tag). Create the .env.example including placeholders for NEON_DATABASE_URL and GOOGLE_API_KEY."

### Phase 2: Core Logic & LLM Integration
> "Implement the backend logic in FastAPI to handle the 'Workflow Runner'. Integrate the google-genai library using gemini-2.5-flash. Create a service that loops through the workflow steps, sending the output of one step as the input to the next. Add a 'Health Check' endpoint that verifies connectivity to Neon and the Gemini API."

### Phase 3: Frontend UI Components
> "Build the React frontend. Components needed:
> *   A 'Workflow Creator' with 2-4 draggable or selectable steps.
> *   A 'Run' dashboard showing the real-time output of each step.
> *   A 'History' sidebar showing the last 5 runs from the DB.
> *   A 'Status Page' visualizing the health of the Backend, DB, and LLM."

### Phase 4: Documentation & Polish
> "Generate the documentation files:
> *   README.md with Docker instructions.
> *   AI_NOTES.md explaining that Gemini 2.5 Flash was used for cost/speed efficiency.
> *   ABOUTME.md using the resume info provided.
> *   PROMPTS_USED.md documenting this conversation."

---

## 3. Session Refinement Log (V1.2.0)

Key user instructions that shaped the final UI/UX and feature set.

*   *"Make the run page scrollable"* / *"also creator page too"*
*   *"screen is high contrast hard to view due to too black make it lil lighter and grey letters are less visible make it lighter too"* (Resulted in the 'Huamish' soft-dark theme update)
*   *"will it owkr propely in neon db"* (Triggered schema migration logic implementation)
*   *"V1.2.0... insteaad of this make it as a button... it need to coantin docs of this app detailed"* (Created DocumentationModal)
*   *"if it gets 429 error dont show that directlyin ui as results... make it smooth playful way"* (Implemented 'Neural Core Cooling Down' UI)

# Aggroso Frontend

This is the React + TypeScript frontend for the Aggroso AI Workflow Builder.

## 🛠️ Technology Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Vanilla CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 🚀 Getting Started

### Environment Setup
Create a `.env` file in this directory:
```env
VITE_API_URL=http://localhost:8000
```

### Development
```bash
npm install
npm run dev
```

## 🏗️ Architecture
- `src/components/`: Core UI components.
  - `WorkflowCreator`: Drag-and-drop style step builder.
  - `RunDashboard`: The "Execution Lab" for running and viewing workflows.
  - `HistorySidebar`: Persistent sidebar for session history.
  - `StatusPage`: Real-time health dashboard.
- `src/App.tsx`: Main application shell, routing, and User ID management.

## 🔐 User ID System
The frontend automatically generates a unique `crypto.randomUUID()` and stores it in `localStorage` as `aggrosso_user_id`. This ID is passed to all backend API calls to ensure your history remains private to your current browser session.

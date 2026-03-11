# claude.md

## Project
AI-Powered Requirement Clarifier — turns vague product ideas into structured specs.

## Stack
- Backend: Python + Flask + SQLAlchemy
- Frontend: React (JSX, no TypeScript)
- Database: SQLite (dev), PostgreSQL-ready
- AI: llama-3.1-8b-instant

## Folder Structure
- /backend — Flask API
- /frontend — React app
- All API routes are RESTful and prefixed with /api

## Coding Rules
- Python: snake_case, docstrings on all functions
- React: functional components only, camelCase
- No unnecessary dependencies
- Keep components small and single-purpose
- .env for all secrets, never hardcode API keys
- CORS enabled for localhost:5173

## What NOT to do
- No TypeScript
- No Redux (use useState/useContext only)
- No CSS frameworks except Tailwind
- No premature optimization
```


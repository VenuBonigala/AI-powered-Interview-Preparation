# Environment Setup

Configure each service once through its own `.env` file.

## Frontend (`frontend/.env`)
- `VITE_API_BASE_URL`: Public URL of your backend API.

## Backend (`backend/.env`)
- `PORT`: Port for the Node backend.
- `AI_SERVICE_BASE_URL`: URL of the FastAPI AI service.

## AI Service (`ai-service/.env`)
- `OPENAI_BASE_URL`: Base URL for your LLM provider.
- `OPENAI_API_KEY`: API key for the provider.
- `LLM_MODEL`: Model id used for completions.

## Quick Start
1. Copy each `.env.example` to `.env` in the same folder.
2. Update only the values inside these `.env` files when deploying to a new environment.
3. Restart services after changing env values.

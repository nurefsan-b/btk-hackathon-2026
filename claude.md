# Project Context & Developer Guidelines

## 1. Project Overview
**Event:** BTK Akademi Hackathon
**Project:** Micro-savings and AI-driven algorithmic trading platform.
**Core Flow:** 
1. Simulates bank transactions.
2. Rounds up transactions (e.g., 90 TL -> 100 TL) and extracts the 10 TL difference.
3. Accumulates the extracted funds weekly.
4. Uses an AI Agent to perform semantic analysis on financial news and executes trades (stocks, commodities) with the accumulated funds.

## 2. Tech Stack
*   **Backend:** Python, FastAPI (Strict async/await patterns, layered architecture)
*   **Frontend:** React, TypeScript, Tailwind CSS (Responsive, minimal bloat)
*   **Database & Cache:** PostgreSQL (Relational data), Redis (Cache & Background job broker)
*   **Background Jobs:** Celery (Email, SMS, scheduled tasks)
*   **AI/Agentic:** LangChain (LLM orchestration), Pydantic (Strict output parsing)
*   **DevOps & Infrastructure:** Docker, Docker Compose, Traefik (Reverse proxy/routing)
*   **Testing:** Pytest (Unit testing)

## 3. General Coding Philosophy & Architecture Rules
*   **Container-First:** Everything runs in Docker. Provide solutions and scripts that assume a containerized, headless, terminal-centric environment. 
*   **Performance & Optimization:** Write computationally efficient code. Avoid unnecessary high-level abstractions or framework bloat. Favor low-level optimization principles where applicable.
*   **Strict Typing:** Use Python type hints (`typing`) and TypeScript interfaces extensively. No `Any` types unless absolutely unavoidable.
*   **Modularity:** Keep routes, business logic (services), and data access (repositories) strictly separated in the FastAPI backend.

## 4. AI & LangChain Specific Rules
*   **No Hallucinations:** When generating code for the trading agent, always enforce strict JSON outputs.
*   **Pydantic Parsing:** Use LangChain's `PydanticOutputParser`. The agent must return structured decisions (e.g., `action`, `asset`, `confidence_score`, `reasoning`).
*   **Resilience:** Implement retry logic for external API calls (news APIs, mock trading APIs).

## 5. Background Jobs & Redis
*   Do not block the main FastAPI event loop. Any task taking longer than 200ms (semantic analysis, email sending) MUST be offloaded to Celery.
*   Use Redis for caching frequently accessed mock data to reduce database load.

## 6. Frontend Guidelines
*   Keep the React components functional and clean.
*   Use Tailwind strictly for utility-class styling. 
*   Ensure the UI is completely responsive (Mobile-first approach is preferred for the demo).
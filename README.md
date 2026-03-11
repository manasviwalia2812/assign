# ClarifyAI

ClarifyAI is an AI-powered requirement clarifier application that transforms vague product ideas into structured, buildable engineering specifications.
Demo video: https://drive.google.com/file/d/1NEUiCiTgkEVzrThuQtPNqThWVA5etpgT/view?usp=drive_link

## What It Does
When building software, vague requirements are the enemy of fast shipping. ClarifyAI solves this by having an AI act as a Senior Product Manager.
You simply paste a raw, unformed idea (e.g., "A social network for dogs"). The AI analyzes the idea and responds with exactly 5 critical clarifying questions. Once you answer those questions, the AI synthesizes your intent into a complete, structured Markdown specification including:
- Overview
- Concrete User Stories
- Edge Cases
- Frontend/Backend/Database Task Breakdowns
- Tech Stack Suggestions

## Tech Stack
- **Frontend**: React (JS), React Router, TailwindCSS v3, Vite, Lucide React (icons), React-Markdown
- **Backend**: Python 3, Flask, SQLAlchemy 
- **Database**: SQLite (Development)
- **AI Integration**: Groq API (running `llama-3.1-8b-instant`)

## How to Run Locally

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Set up a Python virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
5. **CRITICAL**: Add your real Groq API key to the `.env` file where `GROQ_API_KEY=` is.
6. Run the Flask server:
   ```bash
   python app.py
   ```
   *The server will run on `http://127.0.0.1:5000` and automatically create the SQLite database (`instance/specs.db`) on startup.*

### 2. Frontend Setup
1. Open a *new* terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the displayed local URL (typically `http://localhost:5173`) in your web browser.

### Key Environment Variables needed
- `GROQ_API_KEY`: Required in `/backend/.env`. Used to authenticate with the Groq inference endpoints.
- `DATABASE_URL`: Optional (defaults to `sqlite:///specs.db`). 

---

## Key Technical Decisions

**Why SQLite?**
For a rapid prototyping application, SQLite removes the heavy operational friction of provisioning external Postgres/MySQL servers during the MVP phase. It easily supports the relational data model we need (Specs containing titles, JSON-stringified QA, and timestamps). Utilizing SQLAlchemy as the ORM makes it incredibly simple to swap this exact schema over to PostgreSQL just by changing the `DATABASE_URL` environment variable later on.

**Why Groq & LLaMA 3.1 8B Instant?**
The core loop of this application requires real-time conversational interactivity. Groq's LPU inference engine delivers tokens instantly, making the "Generate Questions" and "Generate Spec" steps feel like zero-latency UI interactions rather than slow background processing tasks. LLaMA 3.1 8B was selected as it is exceptionally smart for structured formatting (Markdown/JSON) while remaining extremely lightweight and fast.

**Why the Multi-Step Wizard UX?**
Forcing users to stare at a blank white "Describe your app" box causes writer's block. The 3-step wizard breaks the cognitive load:
1. Brain dump a terrible, vague idea.
2. Low-friction structured thinking (answer 5 direct questions).
3. Experience the "Aha!" moment of seeing a complete spec generated instantly, with options to tweak the status and share it.

## AI Usage

**Within the Application**
The application uses AI to augment product management via system prompts natively tied to the Groq Python SDK:
1. **The Clarifier**: Uses a structured zero-shot prompt instructing the AI to act as a PM and output exactly a strict JSON array of 5 questions. This is handled natively in `backend/routes/ai.py`, which validates the JSON structure before passing it to the React frontend.
2. **The Synthesizer**: Injects the original idea along with the newly answered Q&A context loop into the prompt, forcing the AI to format its output exactly to predefined markdown headers (`## User Stories`, `## Edge Cases`, etc.). 

**Building the Application**
This application was rapidly generated iteratively utilizing an Autonomous AI Agent (Antigravity). The agent:
- Bootstrapped the Flask and SQLAlchemy database architectures.
- Built the Groq network interfaces natively natively natively utilizing the SDK.
- Constructed the multi-page React Router frontend and implemented styling via TailwindCSS.
- Auto-corrected CLI configurations (such as Vite/Tailwind v3 dependency downgrades).

## Known Limitations
- The `clarifying_questions` and `answers` are currently stored as stringified JSON arrays in SQLite. While fine for MVP storage, it makes querying specific questions difficult.
- The AI prompt asks for "exactly 5 questions" but the response format relies on the LLM adhering perfectly. Occasional malformed JSON from the LLM could theoretically break the parser despite the builtin fallback logic.
- React-Markdown is used purely for formatting in `ViewSpec`; there is no built-in rich text editor to manually fix AI hallucinations *before* saving.

## How I'd Extend This
1. **Authentication & Team Sharing**: Add user accounts (e.g. Clerk/Supabase) so PMs and Engineers can share public, read-only links to generated Specs contextually.
2. **Jira / Linear Export**: Add a one-click integration that parses the `## Task Breakdown` numbered lists and automatically creates engineering tickets in Linear or Jira via their APIs.
3. **Iterative Refinement**: Instead of a "one-shot" spec generation, allow users to highlight a specific section of the generated markdown and ask the AI "expand on the edge cases for the payment step".
4. **Rich Text Editing**: Swap the static markdown viewer with a block-editor (like Novel or TipTap) so the user can natively edit the AI's output before distributing it to the team.

# LitVerse AI 

**LitVerse AI** is an intelligent, highly personalized reading platform designed to solve the global literacy crisis. It uses a **"blended learning" approach**, where AI handles real-time assessment and personalized practice via interactive, branching stories, while parents receive actionable insights to support their child's emotional and critical thinking development.

---

## Research Insights & Our Solution

Our platform was built on the foundation of the latest educational and cognitive science research (2024-2025):

1. **The Zone of Proximal Development (ZPD)**: Research shows learning is maximized when material is *just beyond* current ability. Static reading levels are too coarse. _(**Vygotsky, L. S., "Mind in Society"** & **Educational Research Review, 2024**)_

   * **Our Solution**: An **Adaptive Difficulty Engine** that dynamically adjusts passage difficulty, vocabulary, and sentence structure in real-time based on multidimensional performance tracking.
3. **"Cognitive Offloading" & Over-reliance on AI**: APA studies show kids perform tasks without encoding knowledge if AI gives direct answers. _(**American Psychological Association Cognitive Offloading Studies, 2025**)_
   * **Our Solution**: **Pip**, our AI reading coach, acts as a scaffold. Pip NEVER gives the direct answer. Pip asks guiding questions and explains *why* an answer is right or wrong in simple, kid-friendly language.
4. **Intrinsic Motivation vs Extrinsic Rewards**: Self-Determination Theory proves intrinsic motivation produces 4x more durable engagement than extrinsic rewards (like digital coins). _(**Deci, E. L., & Ryan, R. M., "Self-Determination Theory"**)_
   * **Our Solution**: **AI-Generated Branching Stories**. The child's choices affect the narrative. Their reading literally brings the world to life.
5. **Parental Involvement**: The #1 predictor of reading success is parental involvement, but parents don't know *how* to help. _(**NIH & Dept of Education Longitudinal Literacy Studies**)_
   * **Our Solution**: **AI-Powered Parent Reports**. Our dashboard uses Gemini to generate actionable, natural-language weekly summaries and suggests some small activities based on the child's specific weaker areas.

---

## Key AI Features

* **Adaptive Branching Stories**: Uses AI to generate dynamic story nodes where user choices dictate the next passage, scaling in Lexile difficulty based on performance.
* **Pip, The Emotional Reading Coach**: A contextual AI tutor that helps children decode words, understand context, and gently corrects mistakes. 
* **Real-time Fluency & Frustration Tracking**: (In Progress) Monitors time-to-answer and click patterns to detect frustration and automatically lower difficulty.
* **Smart Dashboard & Reporting**: Aggregates vocabulary, inference, and literal comprehension scores into beautiful Recharts dashboards and generates professional AI parent assessments.
* **Robust AI Fallback Engine**: Employs a multi-model array rotation system (Gemini 2.5 Flash, Gemini 1.5, Groq models) to ensure 100% uptime even if a free API tier is exhausted.

---

## Architecture & Tech Stack

**Frontend**
* **Framework**: Next.js 16 (App Router) + React 19
* **Styling**: Vanilla CSS with full Light/Dark Theme CSS Variables
* **Auth**: Google OAuth (@react-oauth/google)
* **Visualization**: Recharts + Framer Motion

**Backend**
* **Framework**: FastAPI (Python 3.11)
* **Database**: PostgreSQL with SQLAlchemy ORM & Alembic (Migrations)
* **AI Integration**: Google Generative AI (Gemini) + Groq API
* **Engine**: Custom AdaptiveEngine and StoryEngine for ZPD calculations and prompt generation.

---

## Quick Start Guide

You can run LitVerse locally for development, or deploy it instantly using Docker.

### 1. Prerequisites
* Node.js (v20+)
* Python (3.11+) & `uv` (for fast package management)
* PostgreSQL
* API Keys for Gemini and Groq

### 2. Local Development

**Database Setup:**
Ensure PostgreSQL is running locally on port 5432 with user/pass `postgres:postgres`.

**Backend:**
```bash
cd backend
cp .env.example .env # Add your GEMINI_API_KEYS and GROQ_API_KEYS here
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt
alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## AWS Production Deployment

We use Docker to make AWS EC2 deployments incredibly simple.

1. Clone this repository onto your Ubuntu EC2 instance.
2. Create your `.env` file in the `backend/` directory with your API keys.
3. Make sure Docker and Docker Compose are installed on your server.
4. Run the following command from the root of the project:

```bash
docker compose up -d
```

This single command will:
1. Provision a secure PostgreSQL database.
2. Build and start the FastAPI backend on port 8000.
3. Build and start the Next.js frontend on port 3000.

*(Note: Don't forget to add your AWS public IP address to your Google Cloud Console Authorized Origins for OAuth to work!)*

# AI PR Agent - Intelligent PR Outreach Automation Platform

## Overview
This platform helps PR agencies automatically discover companies, analyze them with AI, generate marketing campaigns, create ad banners, score leads, and send personalized outreach emails.

It includes a modern SaaS-level UI/UX, smooth Framer Motion animations, Recharts analytics, and fully working backend APIs.

---
**Hackathon Team Repository:** [hackindia-team:hackindia-spark-3-south-india-region:code-champions]
---

## Technology Stack
- **Frontend:** React + Vite, TailwindCSS, Framer Motion, Recharts, Axios, React Router v6
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **AI Integration:** OpenAI API
- **Scraping:** Cheerio + Native Fetch
- **Emailing:** Nodemailer

## Setup Instructions

### Prerequisites
1. Ensure [Node.js](https://nodejs.org/) (v18+) is installed.
2. Ensure [MongoDB](https://www.mongodb.com/) is running locally on port `27017` or have a Mongo URI ready.

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory (optional defaults are provided):
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ai-pr-agent
   OPENAI_API_KEY=your_openai_api_key
   SMTP_HOST=smtp.ethereal.email
   SMTP_PORT=587
   SMTP_USER=your_user
   SMTP_PASS=your_pass
   ```
   *Note: If `OPENAI_API_KEY` is omitted, the backend will auto-mock the AI endpoints so you can still preview the UI animations.*
4. Start the server:
   ```bash
   node server.js
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the browser at `http://localhost:5173`.

## Features Built
- **Killer UI / UX:** Dark theme by default, global animated primary gradients, glassmorphism cards, Inter font.
- **AI Thinking Animation:** A custom modal simulating real-time AI reasoning (`Scanning... -> Understanding... -> Generating...`).
- **Campaign Preview Card:** Modern advertisement mockup component showcasing the generated AI headline, copy, and Call-To-Action.
- **Live Metrics Dashboard:** Animated counters counting up from 0 and Recharts displaying mock email performance.
- **Automated Outreach:** Generates personalized emails, queues them via Nodemailer, and dispatches them asynchronously.

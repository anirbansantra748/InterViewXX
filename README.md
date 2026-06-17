# InterViewXX

A full-stack recruitment platform that handles the entire hiring process in one place — job postings, candidate applications, coding rounds, aptitude tests, real-time chat, and video interviews.

**[Live Demo](https://your-interviewxx-link.com)** · **[Demo Video](https://youtube.com/your-video-link)** · **[GitHub](https://github.com/anirbansantra748/InterViewXX)**

---

## What it does

### For Recruiters
- Post and manage job listings with custom requirements
- View all applicants on a dashboard, shortlist candidates, track progress
- Create multi-round hiring pipelines (MCQ → DSA → Aptitude → General → Interview)
- Chat with candidates directly through the platform

### For Candidates
- Browse and apply for jobs with profile data and uploaded resume (PDF)
- Complete assigned rounds: MCQ, DSA coding, aptitude, grammar, general knowledge
- Get AI-powered resume analysis and feedback
- Join real-time video interviews directly in the browser

### Platform features
- AI job-to-candidate matching (Gemini + Pinecone vector search)
- Live chat between recruiters and candidates (Socket.IO)
- WebRTC video calls — no third-party service needed
- Collaborative whiteboard during interviews

---

## Tech Stack

| Layer | What's used |
|-------|-------------|
| Frontend | EJS templates, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | Passport.js (local strategy), session-based |
| Real-time | Socket.IO, WebRTC |
| AI | Google Gemini API |
| Vector Search | Pinecone + Xenova Transformers (local embeddings) |
| File Storage | Cloudinary |
| Session Store | connect-mongo |
| CI/CD | GitHub Actions |

---

## Routes / Modules

| Route | What it handles |
|-------|----------------|
| `/` | Home, landing |
| `/users` | Signup, login, profile |
| `/recruiter` | Recruiter dashboard, job management |
| `/jobs` | Job listings, applications |
| `/rounds` | Round creation and management |
| `/add-round/mcq` | MCQ round builder |
| `/add-round/dsa` | DSA coding round |
| `/add-round/aptitude` | Aptitude test round |
| `/add-round/grammar` | Grammar round |
| `/add-round/general` | General knowledge round |
| `/questions` | Question bank |
| `/chats` | Real-time messaging |
| `/video` | Video call rooms (WebRTC) |
| `/api/resume` | AI resume analysis endpoint |
| `/jobsearch` | AI-powered job search |

---

## Running locally

```bash
git clone https://github.com/anirbansantra748/InterViewXX.git
cd InterViewXX
npm install
```

Create a `.env` file:

```env
PORT=3000
MONGO_URL=mongodb://127.0.0.1:27017/InterviewApp
SESSION_SECRET=your_secret_here
GEMINI_API_KEY=your_gemini_key
PINECONE_API_KEY=your_pinecone_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

```bash
npm run dev   # starts with nodemon on http://localhost:3000
```

---

## Project structure

```
InterViewXX/
├── views/          # EJS templates (organized by feature)
│   ├── jobs/
│   ├── recruiter/
│   ├── rounds/
│   ├── users/
│   ├── chats/
│   └── questions/
├── routes/         # Route handlers (one file per feature)
├── controllers/    # Business logic
├── models/         # Mongoose schemas
├── middlewares/    # Auth, error handling
├── utils/          # Helper functions
├── public/         # Static assets
└── app.js          # Entry point
```

---

## How AI is used

- **Resume analysis** — Gemini reads the candidate's uploaded PDF resume and gives structured feedback
- **Job matching** — Resumes and job descriptions are embedded using Xenova Transformers locally, then stored and searched in Pinecone to surface the best candidate-job matches
- **Job search** — Semantic search over job listings powered by the same embedding pipeline

---

Made by [Anirban Santra](https://powerful-raven.static.domains/)

# InterViewXX - Tech Stack

> **Zero-Cost Stack**

---

## Current Stack

| Layer | Technology | Status |
|-------|------------|--------|
| Frontend | EJS Templates | ✅ Keep |
| Backend | Express.js (Node.js) | ✅ Keep |
| Database | MongoDB Atlas | ✅ Configured |
| File Storage | Cloudinary | ✅ Configured |
| Real-time | Socket.IO | ✅ Keep |
| Video | WebRTC | ✅ Keep |
| AI | Gemini Pro | ✅ Configured |

---

## New Additions (All FREE)

| Component | Technology | Cost |
|-----------|------------|------|
| PDF Parsing | `pdf-parse` | FREE |
| Vector DB | Pinecone (Free Tier) | FREE |
| Embeddings | Gemini `embedding-001` | FREE |
| Testing | Jest + Supertest | FREE |

---

## Environment Variables

```env
# Existing
MONGO_URL=mongodb+srv://...
GEMINI_API_KEY=AIzaSy...

# New (to add)
PINECONE_API_KEY=pcsk_7K3gQ9_...
CLOUDINARY_CLOUD_NAME=<needed>
CLOUDINARY_API_KEY=WamXRlW6KWkIb5q18KebzyqolrQ
CLOUDINARY_API_SECRET=<needed>
```

---

## New Dependencies

```json
{
  "pdf-parse": "^1.1.1",
  "@pinecone-database/pinecone": "^4.0.0",
  "@google/generative-ai": "^0.21.0",
  "jest": "^29.0.0",
  "supertest": "^6.3.0"
}
```

---

## API Endpoints (New)

### Resume APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resume/upload` | Upload PDF resume |
| POST | `/api/resume/parse/:userId` | Trigger AI extraction |
| GET | `/api/resume/data/:userId` | Get extracted data |
| PUT | `/api/resume/data/:userId` | Update extracted data |

### Search APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/search/candidates` | Semantic candidate search |
| POST | `/api/search/jobs` | Semantic job search |

### Recommendation APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recommendations/jobs/:userId` | Jobs for candidate |
| GET | `/api/recommendations/candidates/:jobId` | Candidates for job |

---

*Last Updated: 2026-01-18*

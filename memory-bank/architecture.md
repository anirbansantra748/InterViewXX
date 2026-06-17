# InterViewXX - System Architecture

> **Zero-Cost Resume-Heavy Platform**

---

## High-Level Architecture

```mermaid
flowchart TB
    subgraph Client["🖥️ Client Layer"]
        EJS["EJS Templates"]
    end

    subgraph Server["⚙️ Server Layer"]
        Express["Express.js"]
        
        subgraph Controllers["Controllers"]
            AuthC["Auth"]
            JobC["Jobs"]
            ResumeC["Resume ⭐ NEW"]
            SearchC["Search ⭐ NEW"]
            RecommendC["Recommendations ⭐ NEW"]
        end
        
        subgraph Utils["Services"]
            ResumeParser["Resume Parser ⭐"]
            ResumeExtractor["Resume Extractor ⭐"]
            EmbeddingService["Embedding Service ⭐"]
            PineconeService["Pinecone Service ⭐"]
            MatchingService["Matching Service ⭐"]
            GeminiService["Gemini AI"]
        end
    end

    subgraph Data["💾 Data Layer"]
        MongoDB["MongoDB Atlas"]
        Pinecone["Pinecone (Vectors)"]
        Cloudinary["Cloudinary (Files)"]
    end

    subgraph External["🌐 External APIs"]
        GeminiAPI["Gemini API (FREE)"]
    end

    Client --> Express
    Express --> Controllers
    Controllers --> Utils
    Utils --> Data
    Utils --> External
```

---

## Data Flow: Resume Upload & Processing

```mermaid
sequenceDiagram
    participant U as User
    participant E as Express
    participant C as Cloudinary
    participant P as PDF Parser
    participant G as Gemini AI
    participant M as MongoDB
    participant V as Pinecone

    U->>E: Upload Resume (PDF)
    E->>C: Store File
    C-->>E: File URL
    E->>P: Extract Text
    P-->>E: Raw Text
    E->>G: Extract Structured Data
    G-->>E: Skills, Experience, etc.
    E->>M: Save extractedData
    E->>G: Generate Embedding
    G-->>E: Vector [1536 dims]
    E->>V: Upsert Vector
    V-->>E: Success
    E-->>U: Resume Processed ✓
```

---

## Data Flow: Semantic Search

```mermaid
sequenceDiagram
    participant R as Recruiter
    participant E as Express
    participant G as Gemini AI
    participant V as Pinecone
    participant M as MongoDB

    R->>E: Search "React developer 3 years"
    E->>G: Generate Query Embedding
    G-->>E: Query Vector
    E->>V: Similarity Search (Top 10)
    V-->>E: Matching User IDs + Scores
    E->>M: Fetch User Details
    M-->>E: User Profiles
    E-->>R: Ranked Candidates
```

---

## Database Schema Updates

### MongoDB: User.extractedData

```javascript
{
  extractedData: {
    personalInfo: {
      name: String,
      email: String,
      phone: String,
      location: String,
      linkedIn: String,
      github: String
    },
    education: [{
      institution: String,
      degree: String,
      field: String,
      year: Number
    }],
    experience: [{
      company: String,
      title: String,
      duration: String,
      responsibilities: [String],
      technologies: [String]
    }],
    skills: [{
      name: String,
      category: String, // Technical, Soft, Language
      level: String     // Beginner, Intermediate, Advanced
    }],
    projects: [{
      name: String,
      description: String,
      technologies: [String]
    }]
  },
  vectorId: String  // Pinecone vector reference
}
```

### Pinecone: Vector Index

```javascript
{
  index: "interviewxx",
  namespace: "resumes",
  dimension: 768,  // Gemini embedding-001 dimension
  metric: "cosine",
  metadata: {
    userId: String,
    skills: [String],
    experienceYears: Number,
    location: String
  }
}
```

---

## Folder Structure (New Files)

```
InterViewXX/
├── controllers/
│   ├── resumeController.js    ⭐ NEW
│   ├── searchController.js    ⭐ NEW
│   └── recommendationController.js ⭐ NEW
├── routes/
│   ├── resumeRoutes.js        ⭐ NEW
│   ├── searchRoutes.js        ⭐ NEW
│   └── recommendationRoutes.js ⭐ NEW
├── utils/
│   ├── resumeParser.js        ⭐ NEW
│   ├── resumeExtractor.js     ⭐ NEW
│   ├── embeddingService.js    ⭐ NEW
│   ├── pineconeService.js     ⭐ NEW
│   └── matchingService.js     ⭐ NEW
├── models/
│   └── User.js                 (MODIFY - add extractedData)
└── tests/
    ├── resume.test.js          ⭐ NEW
    ├── search.test.js          ⭐ NEW
    └── matching.test.js        ⭐ NEW
```

---

*Last Updated: 2026-01-18*

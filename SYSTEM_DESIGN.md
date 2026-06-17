# InterViewXX - Complete System Design Document

> **All-in-One Interview & Recruitment Platform**  
> *Version 1.0 | January 2026*

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Requirements](#system-requirements)
3. [High-Level Architecture](#high-level-architecture)
4. [Detailed Component Design](#detailed-component-design)
5. [API Design](#api-design)
6. [Database Design](#database-design)
7. [Authentication & Authorization](#authentication--authorization)
8. [Real-Time Communication](#real-time-communication)
9. [AI Integration](#ai-integration)
10. [File Storage](#file-storage)
11. [Error Handling](#error-handling)
12. [Scalability & Performance](#scalability--performance)
13. [Security Design](#security-design)
14. [Deployment Strategy](#deployment-strategy)
15. [Monitoring & Logging](#monitoring--logging)

---

## 1. Executive Summary

### 1.1 Purpose
InterViewXX is a comprehensive recruitment platform that digitalizes the entire hiring process from job posting to candidate assessment and final selection.

### 1.2 Key Objectives
- **Streamline Recruitment**: End-to-end hiring workflow
- **Automated Assessment**: AI-powered code evaluation
- **Real-time Collaboration**: Video interviews & live chat
- **Scalable Architecture**: Handle thousands of concurrent users

### 1.3 Target Users

```mermaid
mindmap
  root((InterViewXX Users))
    Candidates
      Job Seekers
      Fresh Graduates
      Experienced Professionals
    Recruiters
      HR Managers
      Technical Recruiters
      Hiring Managers
    Administrators
      Platform Admins
      Super Users
```

---

## 2. System Requirements

### 2.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | User registration & authentication | Critical |
| FR-02 | Job posting & management | Critical |
| FR-03 | Job search & application | Critical |
| FR-04 | Multiple interview round types | Critical |
| FR-05 | Automated scoring for MCQ/Grammar/Aptitude | High |
| FR-06 | AI-based code evaluation (DSA) | High |
| FR-07 | Real-time video interviews | High |
| FR-08 | Chat system | Medium |
| FR-09 | Resume upload & management | Medium |
| FR-10 | Candidate progress tracking | Medium |

### 2.2 Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Response time | < 200ms (API) |
| NFR-02 | Availability | 99.9% uptime |
| NFR-03 | Concurrent users | 10,000+ |
| NFR-04 | Video call latency | < 100ms |
| NFR-05 | Data encryption | AES-256 |
| NFR-06 | Session timeout | 7 days |

---

## 3. High-Level Architecture

### 3.1 System Context Diagram

```mermaid
C4Context
    title System Context Diagram - InterViewXX

    Person(candidate, "Candidate", "Job seeker applying for positions")
    Person(recruiter, "Recruiter", "HR/Hiring manager")
    Person(admin, "Admin", "Platform administrator")

    System(interviewxx, "InterViewXX", "All-in-one recruitment platform")

    System_Ext(gemini, "Google Gemini", "AI code evaluation")
    System_Ext(cloudinary, "Cloudinary", "File storage CDN")
    System_Ext(email, "Email Service", "Notifications")

    Rel(candidate, interviewxx, "Applies, takes tests, interviews")
    Rel(recruiter, interviewxx, "Posts jobs, reviews candidates")
    Rel(admin, interviewxx, "Manages platform")
    
    Rel(interviewxx, gemini, "Evaluates code")
    Rel(interviewxx, cloudinary, "Stores files")
    Rel(interviewxx, email, "Sends notifications")
```

### 3.2 Container Diagram

```mermaid
flowchart TB
    subgraph Clients["Client Applications"]
        Web["🌐 Web Browser<br/>(EJS + Tailwind)"]
        Mobile["📱 Mobile Browser<br/>(Responsive)"]
    end

    subgraph Backend["Backend Services"]
        API["🖥️ Express.js API<br/>Port 3000"]
        Socket["📡 Socket.IO Server<br/>(Real-time)"]
    end

    subgraph Data["Data Storage"]
        MongoDB[(📦 MongoDB<br/>Primary Database)]
        Sessions[(🔐 MongoDB<br/>Session Store)]
        Uploads["📁 Cloudinary<br/>File Storage"]
    end

    subgraph External["External Services"]
        Gemini["🤖 Google Gemini<br/>AI API"]
    end

    Web --> API
    Mobile --> API
    Web --> Socket
    
    API --> MongoDB
    API --> Sessions
    API --> Uploads
    API --> Gemini
    
    Socket --> MongoDB
```

### 3.3 Component Diagram

```mermaid
flowchart LR
    subgraph Presentation["Presentation Layer"]
        EJS["EJS Templates"]
        CSS["Tailwind CSS"]
        JS["Client JS"]
    end

    subgraph Application["Application Layer"]
        Routes["Routes"]
        Controllers["Controllers"]
        Middlewares["Middlewares"]
        Utils["Utilities"]
    end

    subgraph Domain["Domain Layer"]
        UserDomain["User Domain"]
        JobDomain["Job Domain"]
        RoundDomain["Round Domain"]
        ChatDomain["Chat Domain"]
    end

    subgraph Infrastructure["Infrastructure Layer"]
        Database["MongoDB Driver"]
        FileStorage["Cloudinary SDK"]
        AIClient["Gemini Client"]
        SocketEngine["Socket.IO"]
    end

    Presentation --> Application
    Application --> Domain
    Domain --> Infrastructure
```

---

## 4. Detailed Component Design

### 4.1 Controllers Architecture

```mermaid
classDiagram
    class BaseController {
        +handleError(err, res)
        +sendSuccess(res, data)
        +sendError(res, message)
    }

    class UserController {
        +register(req, res)
        +login(req, res)
        +logout(req, res)
        +getProfile(req, res)
        +updateProfile(req, res)
    }

    class JobController {
        +createJob(req, res)
        +getAllJobs(req, res)
        +getJobById(req, res)
        +updateJob(req, res)
        +deleteJob(req, res)
        +applyForJob(req, res)
    }

    class RoundController {
        +createRound(req, res)
        +startRound(req, res)
        +submitRound(req, res)
        +evaluateWithAI(answers)
        +calculateScore(answers)
    }

    class ChatController {
        +getChats(req, res)
        +sendMessage(req, res)
        +getChatHistory(req, res)
    }

    BaseController <|-- UserController
    BaseController <|-- JobController
    BaseController <|-- RoundController
    BaseController <|-- ChatController
```

### 4.2 Model Architecture

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String username
        +String email
        +String password
        +String role
        +Object profile
        +Array appliedJobs
        +authenticate()
        +serializeUser()
    }

    class Job {
        +ObjectId _id
        +String title
        +String description
        +ObjectId recruiter
        +Array rounds
        +Number totalRounds
        +String status
        +Array applicants
    }

    class Round {
        +ObjectId _id
        +ObjectId job
        +String roundType
        +ObjectId roundContent
        +Number order
        +Number duration
        +Array isqualify
    }

    class MCQRound {
        +Array questions
        +Number timeLimit
        +Number totalMarks
        +Number passingMarks
    }

    class DSARound {
        +Array questions
        +String problemStatement
        +String solution
    }

    User "1" --> "*" Job : applies
    Job "1" --> "*" Round : contains
    Round "1" --> "1" MCQRound : references
    Round "1" --> "1" DSARound : references
```

### 4.3 Middleware Pipeline

```mermaid
flowchart LR
    Request["📨 Incoming<br/>Request"] --> Helmet["🛡️ Helmet<br/>Security Headers"]
    Helmet --> BodyParser["📝 Body Parser<br/>JSON/URL"]
    BodyParser --> Session["🔐 Session<br/>Middleware"]
    Session --> Passport["👤 Passport<br/>Auth"]
    Passport --> IsLoggedIn["✅ isLoggedIn<br/>Check"]
    IsLoggedIn --> IsAdmin["🔑 isAdmin<br/>Check"]
    IsAdmin --> Multer["📁 Multer<br/>File Upload"]
    Multer --> Route["🎯 Route<br/>Handler"]
    Route --> Response["📤 Response"]
```

---

## 5. API Design

### 5.1 RESTful API Endpoints

#### Authentication APIs
```
POST   /users/register       → Register new user
POST   /users/login          → User login
GET    /users/logout         → User logout
GET    /users/profile        → Get current user profile
PUT    /users/profile        → Update user profile
```

#### Job APIs
```
GET    /jobs                 → List all jobs
GET    /jobs/:id             → Get job details
POST   /jobs                 → Create new job (Recruiter)
PUT    /jobs/:id             → Update job (Recruiter)
DELETE /jobs/:id             → Delete job (Recruiter)
POST   /jobs/:id/apply       → Apply for job (Candidate)
GET    /jobs/:id/applicants  → View applicants (Recruiter)
```

#### Round APIs
```
GET    /rounds/select-round/:jobId    → Select round type
POST   /rounds/select-round/:jobId    → Create round
GET    /rounds/start/:roundId         → Start round
POST   /rounds/submit/:roundId        → Submit round answers
GET    /rounds/result/:roundId        → View round result
```

#### Chat APIs
```
GET    /chats                → List all chats
GET    /chats/:id            → Get chat messages
POST   /chats/:id/send       → Send message
```

### 5.2 API Response Format

```javascript
// Success Response
{
    "success": true,
    "data": { ... },
    "message": "Operation successful"
}

// Error Response
{
    "success": false,
    "error": {
        "code": "ERR_NOT_FOUND",
        "message": "Resource not found",
        "status": 404
    }
}
```

### 5.3 Request/Response Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Router
    participant M as Middleware
    participant Ctrl as Controller
    participant S as Service
    participant DB as MongoDB

    C->>R: HTTP Request
    R->>M: Route Matched
    M->>M: Auth Check
    M->>M: Validation
    M->>Ctrl: Validated Request
    Ctrl->>S: Business Logic
    S->>DB: Query
    DB-->>S: Result
    S-->>Ctrl: Processed Data
    Ctrl-->>C: JSON Response
```

---

## 6. Database Design

### 6.1 Schema Definitions

#### User Schema
```javascript
{
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed
    role: { type: String, enum: ['candidate', 'recruiter', 'admin'] },
    profile: {
        fullName: String,
        phone: String,
        resumeUrl: String,
        skills: [String],
        experience: Number
    },
    appliedJobs: [{ type: ObjectId, ref: 'Job' }],
    createdAt: { type: Date, default: Date.now }
}
```

#### Job Schema
```javascript
{
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: String,
    location: String,
    salary: { min: Number, max: Number },
    recruiter: { type: ObjectId, ref: 'Recruiter' },
    rounds: [{ type: ObjectId, ref: 'Round' }],
    totalRounds: Number,
    applicants: [{
        user: { type: ObjectId, ref: 'User' },
        status: { type: String, enum: ['applied', 'in-progress', 'selected', 'rejected'] },
        appliedAt: Date
    }],
    status: { type: String, enum: ['open', 'closed', 'draft'] },
    createdAt: { type: Date, default: Date.now }
}
```

#### Round Schema
```javascript
{
    job: { type: ObjectId, ref: 'Job' },
    roundType: { type: String, enum: ['MCQ', 'DSA', 'Grammar', 'Aptitude', 'Voice', 'Interview'] },
    roundContent: { type: ObjectId, refPath: 'roundContentType' },
    roundContentType: { type: String, enum: ['MCQRound', 'DSARound', 'GrammarRound', 'AptitudeRound'] },
    order: Number,
    title: String,
    duration: Number, // minutes
    instructions: String,
    isqualify: [{
        user: { type: ObjectId, ref: 'User' },
        qualified: Boolean,
        score: Number,
        submittedAt: Date
    }]
}
```

### 6.2 Indexes

```javascript
// Performance Indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 }, { unique: true })
db.jobs.createIndex({ status: 1, createdAt: -1 })
db.jobs.createIndex({ recruiter: 1 })
db.rounds.createIndex({ job: 1, order: 1 })
db.chats.createIndex({ participants: 1 })
```

### 6.3 Data Relationships

```mermaid
erDiagram
    USER ||--o{ APPLICATION : submits
    USER ||--o{ ROUND_ATTEMPT : takes
    USER ||--o{ CHAT : participates
    
    RECRUITER ||--o{ JOB : creates
    
    JOB ||--o{ APPLICATION : receives
    JOB ||--o{ ROUND : contains
    
    ROUND ||--|| ROUND_CONTENT : has
    ROUND ||--o{ ROUND_ATTEMPT : generates
    
    CHAT ||--o{ MESSAGE : contains

    USER {
        ObjectId _id PK
        String username UK
        String email UK
        String role
    }
    
    JOB {
        ObjectId _id PK
        ObjectId recruiter FK
        String title
        String status
    }
    
    ROUND {
        ObjectId _id PK
        ObjectId job FK
        String roundType
        Number order
    }
    
    ROUND_CONTENT {
        ObjectId _id PK
        Array questions
        Number passingMarks
    }
```

---

## 7. Authentication & Authorization

### 7.1 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant S as Server
    participant P as Passport
    participant DB as MongoDB

    U->>B: Enter credentials
    B->>S: POST /users/login
    S->>P: authenticate('local')
    P->>DB: Find user by username
    DB-->>P: User document
    P->>P: Verify password (bcrypt)
    
    alt Password Valid
        P->>S: User authenticated
        S->>S: Create session
        S->>DB: Store session (MongoStore)
        S-->>B: Set session cookie
        B-->>U: Redirect to dashboard
    else Password Invalid
        P-->>S: Authentication failed
        S-->>B: Error response
        B-->>U: Show error
    end
```

### 7.2 Session Management

```javascript
// Session Configuration
{
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        crypto: { secret: 'session-secret' },
        touchAfter: 24 * 3600  // 24 hours
    }),
    secret: 'session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7  // 7 days
    }
}
```

### 7.3 Role-Based Access Control

```mermaid
flowchart TD
    subgraph Roles["User Roles"]
        Candidate["👤 Candidate"]
        Recruiter["👔 Recruiter"]
        Admin["🔑 Admin"]
    end

    subgraph Permissions["Permissions"]
        ViewJobs["View Jobs"]
        ApplyJobs["Apply to Jobs"]
        CreateJobs["Create Jobs"]
        ManageRounds["Manage Rounds"]
        ViewApplicants["View Applicants"]
        ManageUsers["Manage Users"]
        SystemConfig["System Config"]
    end

    Candidate --> ViewJobs
    Candidate --> ApplyJobs
    
    Recruiter --> ViewJobs
    Recruiter --> CreateJobs
    Recruiter --> ManageRounds
    Recruiter --> ViewApplicants
    
    Admin --> ViewJobs
    Admin --> CreateJobs
    Admin --> ManageRounds
    Admin --> ViewApplicants
    Admin --> ManageUsers
    Admin --> SystemConfig
```

---

## 8. Real-Time Communication

### 8.1 Socket.IO Architecture

```mermaid
flowchart TB
    subgraph Clients["Connected Clients"]
        C1["Client 1<br/>(Interviewer)"]
        C2["Client 2<br/>(Candidate)"]
        C3["Client 3<br/>(Observer)"]
    end

    subgraph Server["Socket.IO Server"]
        IO["io (Server Instance)"]
        Rooms["Room Management"]
        Events["Event Handlers"]
    end

    subgraph Events_Detail["Events"]
        Join["join-room"]
        Offer["offer (SDP)"]
        Answer["answer (SDP)"]
        ICE["ice-candidate"]
        Disconnect["disconnect"]
    end

    C1 <--> IO
    C2 <--> IO
    C3 <--> IO
    
    IO --> Rooms
    IO --> Events
    Events --> Events_Detail
```

### 8.2 WebRTC Signaling Flow

```mermaid
sequenceDiagram
    participant I as Interviewer
    participant S as Signaling Server
    participant C as Candidate

    I->>S: join-room(roomId)
    C->>S: join-room(roomId)
    S->>I: user-connected(candidateId)
    
    I->>I: createOffer()
    I->>S: offer(SDP, roomId)
    S->>C: offer(SDP)
    
    C->>C: createAnswer()
    C->>S: answer(SDP, roomId)
    S->>I: answer(SDP)
    
    loop ICE Candidate Exchange
        I->>S: ice-candidate(data)
        S->>C: ice-candidate(data)
        C->>S: ice-candidate(data)
        S->>I: ice-candidate(data)
    end
    
    Note over I,C: P2P Connection Established
```

### 8.3 Event Handlers

```javascript
// Socket.IO Event Configuration
io.on('connection', (socket) => {
    // Join interview room
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', socket.id);
    });

    // WebRTC signaling
    socket.on('offer', (data) => {
        socket.to(data.roomId).emit('offer', data);
    });

    socket.on('answer', (data) => {
        socket.to(data.roomId).emit('answer', data);
    });

    socket.on('ice-candidate', (data) => {
        socket.to(data.roomId).emit('ice-candidate', data);
    });

    // Cleanup
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});
```

---

## 9. AI Integration

### 9.1 Google Gemini Integration

```mermaid
flowchart LR
    subgraph Application["Application"]
        RC["Round Controller"]
        Prompt["Prompt Builder"]
    end

    subgraph GeminiAPI["Google Gemini API"]
        Endpoint["API Endpoint"]
        Model["gemini-pro Model"]
    end

    subgraph Response["Response Processing"]
        Parse["Parse Response"]
        Score["Calculate Score"]
    end

    RC --> Prompt
    Prompt --> Endpoint
    Endpoint --> Model
    Model --> Parse
    Parse --> Score
    Score --> RC
```

### 9.2 DSA Code Evaluation Prompt

```javascript
const evaluationPrompt = `
### Problem:
${question.problemStatement}

### Input Format:
${question.inputFormat || 'N/A'}

### Output Format:
${question.outputFormat || 'N/A'}

### Constraints:
${question.constraints || 'N/A'}

### Sample Input:
${question.sampleInput || 'N/A'}

### Sample Output:
${question.sampleOutput || 'N/A'}

### User Code:
${userSubmittedCode}

### Expected Output Logic:
${question.solution}

### Evaluation Prompt:
Does the above code solve the given problem correctly?
Answer only 'Yes' or 'No' with a brief explanation.
`;
```

### 9.3 AI Response Processing

```mermaid
flowchart TD
    Submit["User Submits Code"] --> Build["Build Prompt"]
    Build --> Call["Call Gemini API"]
    Call --> Parse["Parse Response"]
    Parse --> Check{"Contains 'Yes'?"}
    Check -->|Yes| Pass["Score +1"]
    Check -->|No| Fail["Score +0"]
    Pass --> Next["Next Question"]
    Fail --> Next
    Next --> Done{"All Questions?"}
    Done -->|No| Build
    Done -->|Yes| Result["Calculate Final Score"]
```

---

## 10. File Storage

### 10.1 Cloudinary Integration

```mermaid
flowchart LR
    subgraph Upload["File Upload Flow"]
        Client["Client"]
        Multer["Multer<br/>Middleware"]
        Cloudinary["Cloudinary<br/>SDK"]
        CDN["Cloudinary<br/>CDN"]
    end

    subgraph Storage["Storage"]
        Resumes["📄 Resumes"]
        Profiles["🖼️ Profile Images"]
        Attachments["📎 Attachments"]
    end

    Client -->|"multipart/form-data"| Multer
    Multer -->|"Buffer"| Cloudinary
    Cloudinary -->|"Upload"| CDN
    CDN --> Storage
```

### 10.2 Cloudinary Configuration

```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload function
const uploadToCloudinary = async (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: folder, resource_type: 'auto' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        ).end(fileBuffer);
    });
};
```

---

## 11. Error Handling

### 11.1 Error Hierarchy

```mermaid
classDiagram
    class Error {
        +String message
        +String stack
    }

    class ExpressError {
        +Number status
        +String message
    }

    class ApiError {
        +Number statusCode
        +String message
        +Array errors
        +Boolean success
    }

    class ValidationError {
        +String field
        +String message
    }

    class AuthError {
        +String type
    }

    Error <|-- ExpressError
    Error <|-- ApiError
    ExpressError <|-- ValidationError
    ExpressError <|-- AuthError
```

### 11.2 Global Error Handler

```javascript
// Global Error Handler Middleware
app.use((err, req, res, next) => {
    const { status = 500, message = "Internal Server Error" } = err;
    
    console.error("🔥 ERROR:", err.stack || err);
    
    res.status(status).render('error', {
        error: {
            status,
            message,
            stack: process.env.NODE_ENV !== 'production' ? err.stack : null
        }
    });
});
```

### 11.3 Error Response Flow

```mermaid
flowchart TD
    Error["Error Occurs"] --> Type{"Error Type?"}
    
    Type -->|"Validation"| V400["400 Bad Request"]
    Type -->|"Auth"| A401["401 Unauthorized"]
    Type -->|"Permission"| P403["403 Forbidden"]
    Type -->|"Not Found"| N404["404 Not Found"]
    Type -->|"Server"| S500["500 Internal Error"]
    
    V400 --> Render["Render Error Page"]
    A401 --> Render
    P403 --> Render
    N404 --> Render
    S500 --> Render
    
    Render --> Log["Log Error"]
    Log --> Response["Send Response"]
```

---

## 12. Scalability & Performance

### 12.1 Vertical vs Horizontal Scaling

```mermaid
flowchart TB
    subgraph Current["Current (Vertical)"]
        Single["Single Server<br/>Node.js + MongoDB"]
    end

    subgraph Future["Future (Horizontal)"]
        LB["Load Balancer<br/>(Nginx/HAProxy)"]
        
        subgraph AppCluster["App Cluster"]
            N1["Node.js<br/>Instance 1"]
            N2["Node.js<br/>Instance 2"]
            N3["Node.js<br/>Instance 3"]
        end
        
        subgraph DataCluster["Data Cluster"]
            Primary["MongoDB<br/>Primary"]
            Secondary1["MongoDB<br/>Secondary 1"]
            Secondary2["MongoDB<br/>Secondary 2"]
        end
        
        Redis["Redis<br/>Session Store"]
    end

    Current -.->|"Scale"| Future
    LB --> AppCluster
    AppCluster --> Redis
    AppCluster --> DataCluster
```

### 12.2 Caching Strategy

```mermaid
flowchart LR
    Request["Request"] --> Cache{"In Cache?"}
    Cache -->|"Hit"| Return["Return Cached"]
    Cache -->|"Miss"| DB["Query Database"]
    DB --> Store["Store in Cache"]
    Store --> Return
```

### 12.3 Performance Optimizations

| Area | Optimization | Impact |
|------|--------------|--------|
| **Database** | Indexes on frequently queried fields | -50% query time |
| **API** | Response compression (gzip) | -70% payload size |
| **Sessions** | MongoDB session store with TTL | Reduced memory |
| **Static** | CDN for static assets | -80% load time |
| **Images** | Cloudinary CDN delivery | Global edge caching |

---

## 13. Security Design

### 13.1 Security Layers

```mermaid
flowchart TB
    subgraph Network["Network Layer"]
        HTTPS["HTTPS/TLS 1.3"]
        CORS["CORS Policy"]
    end

    subgraph Application["Application Layer"]
        Helmet["Helmet.js"]
        CSP["Content Security Policy"]
        RateLimit["Rate Limiting"]
    end

    subgraph Authentication["Auth Layer"]
        Passport["Passport.js"]
        Session["Secure Sessions"]
        RBAC["Role-Based Access"]
    end

    subgraph Data["Data Layer"]
        Encryption["Password Hashing<br/>(bcrypt)"]
        Sanitization["Input Sanitization"]
        Validation["Schema Validation"]
    end

    Network --> Application
    Application --> Authentication
    Authentication --> Data
```

### 13.2 Content Security Policy

```javascript
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
            "'self'",
            "https://cdn.tailwindcss.com",
            "https://unpkg.com",
            "'unsafe-inline'"
        ],
        styleSrc: [
            "'self'",
            "https://fonts.googleapis.com",
            "'unsafe-inline'"
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "https://img.freepik.com", "data:"]
    }
}));
```

### 13.3 Security Checklist

- [x] HTTPS enforcement
- [x] Helmet.js security headers
- [x] Content Security Policy
- [x] HTTP-only cookies
- [x] Password hashing (bcrypt)
- [x] Session security
- [x] Input validation
- [ ] Rate limiting (recommended)
- [ ] SQL/NoSQL injection prevention (Mongoose)
- [ ] XSS prevention (EJS escaping)

---

## 14. Deployment Strategy

### 14.1 Deployment Architecture

```mermaid
flowchart TB
    subgraph Dev["Development"]
        Local["Local Machine<br/>npm run dev"]
    end

    subgraph Staging["Staging"]
        StageServer["Staging Server<br/>Testing"]
    end

    subgraph Production["Production"]
        subgraph VPS["VPS / Cloud"]
            PM2["PM2<br/>Process Manager"]
            Nginx["Nginx<br/>Reverse Proxy"]
            App["Node.js App<br/>Port 3000"]
        end
        
        subgraph External["External Services"]
            MongoAtlas["MongoDB Atlas"]
            CloudinaryCDN["Cloudinary CDN"]
            GeminiCloud["Gemini API"]
        end
    end

    Dev -->|"git push"| Staging
    Staging -->|"approved"| Production
    
    Nginx --> App
    PM2 --> App
    App --> External
```

### 14.2 Environment Configuration

```bash
# .env (Production)
NODE_ENV=production
PORT=3000

# MongoDB
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/interviewxx

# Session
SESSION_SECRET=<strong-random-secret>

# AI
GEMINI_API_KEY=<your-gemini-api-key>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
```

### 14.3 PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
    apps: [{
        name: 'interviewxx',
        script: 'app.js',
        instances: 'max',
        exec_mode: 'cluster',
        env_production: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        time: true
    }]
};
```

---

## 15. Monitoring & Logging

### 15.1 Logging Strategy

```mermaid
flowchart LR
    subgraph Sources["Log Sources"]
        App["Application<br/>Logs"]
        Access["Access<br/>Logs"]
        Error["Error<br/>Logs"]
        Socket["Socket.IO<br/>Logs"]
    end

    subgraph Processing["Log Processing"]
        Console["Console<br/>(Development)"]
        Files["File System<br/>(Production)"]
    end

    subgraph Analysis["Analysis"]
        Aggregation["Log Aggregation"]
        Alerts["Alert System"]
        Dashboard["Dashboard"]
    end

    Sources --> Console
    Sources --> Files
    Files --> Aggregation
    Aggregation --> Alerts
    Aggregation --> Dashboard
```

### 15.2 Key Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| **Response Time** | API response latency | < 200ms |
| **Error Rate** | 5xx errors / total requests | < 0.1% |
| **Uptime** | Service availability | 99.9% |
| **Active Users** | Concurrent connections | Monitor |
| **DB Query Time** | MongoDB query latency | < 50ms |
| **Socket Connections** | Active WebSocket connections | Monitor |

### 15.3 Health Check Endpoint

```javascript
// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});
```

---

## 📈 Future Enhancements

1. **Microservices Architecture** - Split into independent services
2. **Message Queue** - RabbitMQ/Redis for async processing
3. **GraphQL API** - Flexible querying
4. **Mobile App** - React Native application
5. **AI Proctoring** - Anti-cheating during assessments
6. **Analytics Dashboard** - Recruitment insights
7. **Multi-language Support** - i18n implementation
8. **Automated Email Notifications** - SendGrid/Nodemailer

---

## 📝 Appendix

### A. Technology Versions

| Technology | Version |
|------------|---------|
| Node.js | 18.x LTS |
| Express | 5.1.0 |
| MongoDB | 6.x |
| Mongoose | 8.13.2 |
| Socket.IO | 4.8.1 |
| Passport | 0.7.0 |
| EJS | 3.1.10 |
| Tailwind CSS | 4.1.3 |

### B. References

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [Socket.IO Docs](https://socket.io/docs/)
- [Passport.js Guide](http://www.passportjs.org/)
- [Google Gemini API](https://ai.google.dev/)

---

*Document Version: 1.0*  
*Last Updated: January 2026*  
*Author: InterViewXX Development Team*

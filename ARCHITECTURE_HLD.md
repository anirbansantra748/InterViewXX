# InterViewXX - Architecture HLD (High-Level Design)

> **All-in-One Interview & Recruitment Platform**

---

## 📐 System Overview

```mermaid
flowchart TB
    subgraph Client["🖥️ Client Layer"]
        Browser["Browser<br/>(EJS + Tailwind CSS)"]
        WebRTC["WebRTC<br/>(Video Calls)"]
    end

    subgraph Gateway["🔐 Gateway Layer"]
        Express["Express.js<br/>Server"]
        Helmet["Helmet<br/>Security"]
        Session["Session<br/>Management"]
    end

    subgraph Auth["🔒 Authentication"]
        Passport["Passport.js<br/>Local Strategy"]
        MongoStore["MongoDB<br/>Session Store"]
    end

    subgraph Core["⚙️ Core Services"]
        JobService["Job<br/>Service"]
        RoundService["Round<br/>Service"]
        UserService["User<br/>Service"]
        RecruiterService["Recruiter<br/>Service"]
        ChatService["Chat<br/>Service"]
        QuestionService["Question<br/>Service"]
    end

    subgraph AI["🤖 AI Layer"]
        Gemini["Google Gemini<br/>AI API"]
    end

    subgraph RealTime["📡 Real-Time"]
        SocketIO["Socket.IO<br/>Server"]
    end

    subgraph Storage["💾 Storage Layer"]
        MongoDB[(MongoDB<br/>Database)]
        Cloudinary["☁️ Cloudinary<br/>File Storage"]
    end

    Browser --> Express
    WebRTC --> SocketIO
    Express --> Helmet
    Express --> Session
    Session --> Passport
    Passport --> MongoStore
    MongoStore --> MongoDB

    Express --> Core
    Core --> MongoDB
    Core --> Cloudinary
    RoundService --> Gemini

    SocketIO --> MongoDB
```

---

## 🏗️ Detailed Component Architecture

```mermaid
flowchart LR
    subgraph Frontend["Frontend (EJS Templates)"]
        direction TB
        Pages["Pages"]
        Components["Components"]
        Static["Static Assets"]
        
        Pages --> IndexViews["Index Views"]
        Pages --> JobViews["Job Views"]
        Pages --> RoundViews["Round Views"]
        Pages --> UserViews["User Views"]
        Pages --> ChatViews["Chat Views"]
    end

    subgraph Backend["Backend (Express.js)"]
        direction TB
        Routes["Routes Layer"]
        Controllers["Controllers Layer"]
        Models["Models Layer"]
        Utils["Utilities"]
        Middlewares["Middlewares"]
    end

    subgraph Database["MongoDB Collections"]
        direction TB
        Users[(Users)]
        Jobs[(Jobs)]
        Rounds[(Rounds)]
        Questions[(Questions)]
        Chats[(Chats)]
        Messages[(Messages)]
        Attempts[(Round Attempts)]
    end

    Frontend --> Backend
    Backend --> Database
```

---

## 📊 Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as 👤 User/Candidate
    participant B as 🌐 Browser
    participant S as 🖥️ Express Server
    participant A as 🔐 Auth (Passport)
    participant C as ⚙️ Controller
    participant AI as 🤖 Gemini AI
    participant DB as 💾 MongoDB
    participant CL as ☁️ Cloudinary

    U->>B: Access Platform
    B->>S: HTTP Request
    S->>A: Authenticate
    A->>DB: Verify Session
    DB-->>A: Session Valid
    A-->>S: User Authenticated
    S->>C: Route to Controller
    
    alt Job Application
        C->>DB: Fetch Job Details
        DB-->>C: Job Data
        C->>CL: Upload Resume
        CL-->>C: File URL
        C->>DB: Save Application
    else Round Submission
        C->>DB: Fetch Round Questions
        DB-->>C: Questions
        C->>AI: Evaluate DSA Code
        AI-->>C: Evaluation Result
        C->>DB: Save Score & Progress
    else Real-time Chat
        C->>DB: Fetch Chat History
        DB-->>C: Messages
    end
    
    C-->>S: Response Data
    S-->>B: Rendered View
    B-->>U: Display Result
```

---

## 🔄 Interview Round Flow

```mermaid
flowchart TD
    subgraph RoundTypes["📝 Interview Round Types"]
        MCQ["MCQ Round<br/>Multiple Choice"]
        DSA["DSA Round<br/>Coding Problems"]
        Grammar["Grammar Round<br/>English Test"]
        Aptitude["Aptitude Round<br/>Logical Reasoning"]
        Voice["Voice Round<br/>Speaking Test"]
        Interview["Interview Round<br/>Video Call"]
    end

    subgraph Evaluation["📊 Evaluation Engine"]
        AutoScore["Auto Scoring<br/>(MCQ/Grammar/Aptitude)"]
        AIEval["AI Evaluation<br/>(DSA via Gemini)"]
        ManualEval["Manual Evaluation<br/>(Voice/Interview)"]
    end

    subgraph Progression["📈 Candidate Progression"]
        Qualify["Qualification<br/>Check"]
        NextRound["Unlock<br/>Next Round"]
        Result["Final<br/>Result"]
    end

    MCQ --> AutoScore
    Grammar --> AutoScore
    Aptitude --> AutoScore
    DSA --> AIEval
    Voice --> ManualEval
    Interview --> ManualEval

    AutoScore --> Qualify
    AIEval --> Qualify
    ManualEval --> Qualify

    Qualify -->|Passed| NextRound
    Qualify -->|Failed| Result
    NextRound --> RoundTypes
```

---

## 🗃️ Database Schema Overview

```mermaid
erDiagram
    USER {
        ObjectId _id
        String username
        String email
        String password
        String role
        Object profile
        Array appliedJobs
    }

    RECRUITER {
        ObjectId _id
        String companyName
        String email
        Object details
    }

    JOB {
        ObjectId _id
        String title
        String description
        ObjectId recruiter
        Array rounds
        Number totalRounds
        String status
    }

    ROUND {
        ObjectId _id
        ObjectId job
        String roundType
        ObjectId roundContent
        Number order
        Number duration
        Array isqualify
    }

    MCQ_ROUND {
        ObjectId _id
        String title
        Array questions
        Number timeLimit
        Number passingMarks
    }

    DSA_ROUND {
        ObjectId _id
        String title
        Array questions
        Number timeLimit
    }

    CHAT {
        ObjectId _id
        Array participants
        Array messages
        Date createdAt
    }

    MESSAGE {
        ObjectId _id
        ObjectId sender
        String content
        Date timestamp
    }

    USER ||--o{ JOB : "applies to"
    RECRUITER ||--o{ JOB : "posts"
    JOB ||--o{ ROUND : "contains"
    ROUND ||--|| MCQ_ROUND : "references"
    ROUND ||--|| DSA_ROUND : "references"
    USER ||--o{ CHAT : "participates"
    CHAT ||--o{ MESSAGE : "contains"
```

---

## 🔌 Real-Time Communication (WebRTC + Socket.IO)

```mermaid
flowchart LR
    subgraph Client1["👤 User 1"]
        B1["Browser"]
        W1["WebRTC Peer"]
    end

    subgraph Server["🖥️ Server"]
        SIO["Socket.IO<br/>Signaling Server"]
    end

    subgraph Client2["👤 User 2"]
        B2["Browser"]
        W2["WebRTC Peer"]
    end

    B1 -->|"1. join-room"| SIO
    B2 -->|"2. join-room"| SIO
    SIO -->|"3. user-connected"| B1
    
    W1 -->|"4. offer (SDP)"| SIO
    SIO -->|"5. offer"| W2
    W2 -->|"6. answer (SDP)"| SIO
    SIO -->|"7. answer"| W1
    
    W1 <-->|"8. ICE candidates"| SIO
    SIO <-->|"9. ICE candidates"| W2
    
    W1 <-.->|"10. P2P Video Stream"| W2
```

---

## 🛡️ Security Architecture

```mermaid
flowchart TB
    subgraph Security["Security Layers"]
        Helmet["Helmet.js<br/>HTTP Headers"]
        CSP["Content Security<br/>Policy"]
        Session["Secure Sessions<br/>(HTTP-Only Cookies)"]
        Auth["Passport.js<br/>Authentication"]
        Middleware["isLoggedIn /<br/>isAdmin Middleware"]
    end

    subgraph Protected["Protected Resources"]
        Jobs["Job Management"]
        Rounds["Interview Rounds"]
        Chat["Chat System"]
        Video["Video Calls"]
        Profile["User Profiles"]
    end

    Request["Incoming<br/>Request"] --> Helmet
    Helmet --> CSP
    CSP --> Session
    Session --> Auth
    Auth --> Middleware
    Middleware --> Protected
```

---

## 📁 Project Structure

```
InterViewXX/
├── 📄 app.js                 # Main entry point
├── 📁 controllers/           # Business logic
│   ├── aptiController.js
│   ├── chatController.js
│   ├── dsaController.js
│   ├── grammerController.js
│   ├── indexController.js
│   ├── jobController.js
│   ├── mcqController.js
│   ├── questionController.js
│   ├── recruiterController.js
│   ├── roundController.js
│   └── userController.js
├── 📁 middlewares/           # Auth & file handling
│   ├── isAdmin.js
│   ├── isLoggedin.js
│   └── multer.middleware.js
├── 📁 models/                # MongoDB schemas
│   ├── UserSchema.js
│   ├── JobSchema.js
│   ├── RoundSchema.js
│   ├── MCQRound.js
│   ├── DSARound.js
│   ├── GrammarRound.js
│   ├── AptitudeRound.js
│   ├── VoiceRound.js
│   ├── InterviewRound.js
│   ├── ChatSchema.js
│   └── MessageSchema.js
├── 📁 routes/                # Express routes
│   ├── indexRoutes.js
│   ├── userRoutes.js
│   ├── jobRoutes.js
│   ├── roundRoutes.js
│   ├── mcqRoute.js
│   ├── dsaRoutes.js
│   ├── grammerRoutes.js
│   ├── aptiRoutes.js
│   ├── chatRoutes.js
│   └── recruiterRoutes.js
├── 📁 utils/                 # Helper utilities
│   ├── ExpressError.js
│   ├── catchAsync.js
│   ├── cloudinary.js
│   └── handlRound.js
├── 📁 views/                 # EJS templates
│   ├── 📁 includes/          # Partials
│   ├── 📁 jobs/              # Job pages
│   ├── 📁 rounds/            # Round pages
│   ├── 📁 users/             # User pages
│   └── 📁 chats/             # Chat pages
└── 📁 public/                # Static assets
    ├── 📁 css/
    ├── 📁 js/
    └── 📁 images/
```

---

## 🔧 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | EJS + Tailwind CSS | Server-side rendering & styling |
| **Backend** | Node.js + Express 5 | REST API & routing |
| **Database** | MongoDB + Mongoose | Data persistence |
| **Auth** | Passport.js (Local) | User authentication |
| **Sessions** | connect-mongo | Session persistence |
| **Real-time** | Socket.IO | WebRTC signaling & chat |
| **AI** | Google Gemini API | Code evaluation |
| **Storage** | Cloudinary | File/resume uploads |
| **Security** | Helmet.js | HTTP security headers |

---

## 🚀 Deployment Architecture

```mermaid
flowchart TB
    subgraph Cloud["☁️ Production Environment"]
        LB["Load Balancer"]
        
        subgraph AppServers["Application Servers"]
            App1["Node.js<br/>Instance 1"]
            App2["Node.js<br/>Instance 2"]
        end
        
        subgraph DataLayer["Data Layer"]
            MongoAtlas["MongoDB<br/>Atlas"]
            CloudinaryS["Cloudinary<br/>CDN"]
        end
        
        subgraph External["External APIs"]
            GeminiAPI["Google<br/>Gemini API"]
        end
    end

    Users["👥 Users"] --> LB
    LB --> App1
    LB --> App2
    App1 --> MongoAtlas
    App2 --> MongoAtlas
    App1 --> CloudinaryS
    App2 --> CloudinaryS
    App1 --> GeminiAPI
    App2 --> GeminiAPI
```

---

## 📝 Key Features Summary

- **👤 Multi-role System**: Candidates, Recruiters, Admins
- **📋 Job Management**: Post, apply, track applications
- **🎯 Interview Rounds**: MCQ, DSA, Grammar, Aptitude, Voice, Video
- **🤖 AI-Powered**: Gemini AI for code evaluation
- **📹 Video Interviews**: Real-time WebRTC calls
- **💬 Live Chat**: Socket.IO messaging
- **☁️ Cloud Storage**: Cloudinary for file uploads
- **🔒 Secure**: Helmet.js, session management, Passport auth

---

*Generated for InterViewXX - All-in-One Recruitment Platform*

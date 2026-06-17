# InterViewXX - Complete System Architecture

```mermaid
flowchart TB
    %% ===== CLIENT LAYER =====
    subgraph ClientLayer["🖥️ CLIENT LAYER"]
        direction LR
        Browser["🌐 Web Browser<br/>(EJS + Tailwind CSS)"]
        WebRTC["📹 WebRTC Client<br/>(Video Calls)"]
    end

    %% ===== CDN & EXTERNAL =====
    subgraph CDN["☁️ CDN & STATIC"]
        TailwindCDN["Tailwind CSS CDN"]
        FontsCDN["Google Fonts"]
        CloudinaryCDN["Cloudinary CDN<br/>(Images/Resumes)"]
    end

    %% ===== GATEWAY LAYER =====
    subgraph Gateway["🔐 GATEWAY LAYER"]
        direction TB
        Express["Express.js Server<br/>Port 3000"]
        
        subgraph Security["Security Middleware"]
            Helmet["Helmet.js<br/>(HTTP Headers)"]
            CSP["Content Security<br/>Policy"]
        end
        
        subgraph SessionMgmt["Session Management"]
            SessionMiddleware["express-session"]
            MongoStore["connect-mongo<br/>(Session Store)"]
        end
    end

    %% ===== AUTH LAYER =====
    subgraph Auth["🔒 AUTHENTICATION"]
        direction TB
        Passport["Passport.js"]
        LocalStrategy["Local Strategy"]
        
        subgraph AuthMiddleware["Auth Middleware"]
            IsLoggedIn["isLoggedIn"]
            IsAdmin["isAdmin"]
        end
    end

    %% ===== ROUTING LAYER =====
    subgraph Routes["🛤️ ROUTES"]
        direction LR
        IndexRoutes["/ Index"]
        UserRoutes["/users"]
        JobRoutes["/jobs"]
        RoundRoutes["/rounds"]
        ChatRoutes["/chats"]
        RecruiterRoutes["/recruiter"]
        VideoRoutes["/video"]
    end

    %% ===== CONTROLLER LAYER =====
    subgraph Controllers["⚙️ CONTROLLERS (Business Logic)"]
        direction TB
        
        subgraph UserDomain["User Domain"]
            UserController["userController"]
            IndexController["indexController"]
        end
        
        subgraph JobDomain["Job Domain"]
            JobController["jobController"]
            RecruiterController["recruiterController"]
        end
        
        subgraph RoundDomain["Round Domain"]
            RoundController["roundController"]
            MCQController["mcqController"]
            DSAController["dsaController"]
            GrammarController["grammerController"]
            AptiController["aptiController"]
        end
        
        subgraph CommDomain["Communication"]
            ChatController["chatController"]
            QuestionController["questionController"]
        end
    end

    %% ===== MODEL LAYER =====
    subgraph Models["📦 DATA MODELS (Mongoose)"]
        direction TB
        
        subgraph CoreModels["Core Models"]
            UserModel["User"]
            RecruiterModel["Recruiter"]
            JobModel["Job"]
        end
        
        subgraph RoundModels["Round Models"]
            RoundModel["Round"]
            MCQRound["MCQRound"]
            DSARound["DSARound"]
            GrammarRound["GrammarRound"]
            AptitudeRound["AptitudeRound"]
            VoiceRound["VoiceRound"]
        end
        
        subgraph ChatModels["Chat Models"]
            ChatModel["Chat"]
            MessageModel["Message"]
        end
    end

    %% ===== UTILITIES =====
    subgraph Utils["🔧 UTILITIES"]
        direction LR
        ExpressError["ExpressError"]
        CatchAsync["catchAsync"]
        CloudinaryUtil["cloudinary.js"]
        ApiResponse["ApiResponse"]
    end

    %% ===== REAL-TIME LAYER =====
    subgraph RealTime["📡 REAL-TIME (Socket.IO)"]
        direction TB
        SocketServer["Socket.IO Server"]
        
        subgraph Events["WebRTC Events"]
            JoinRoom["join-room"]
            Offer["offer (SDP)"]
            Answer["answer (SDP)"]
            ICE["ice-candidate"]
        end
    end

    %% ===== AI LAYER =====
    subgraph AI["🤖 AI LAYER"]
        direction TB
        GeminiAPI["Google Gemini API<br/>(gemini-pro)"]
        
        subgraph AIFeatures["AI Features"]
            CodeEval["DSA Code<br/>Evaluation"]
            Scoring["Auto Scoring"]
        end
    end

    %% ===== DATABASE LAYER =====
    subgraph Database["💾 DATABASE LAYER"]
        direction TB
        MongoDB[(MongoDB<br/>Primary Database)]
        
        subgraph Collections["Collections"]
            UsersCol["users"]
            JobsCol["jobs"]
            RoundsCol["rounds"]
            ChatsCol["chats"]
            SessionsCol["sessions"]
        end
    end

    %% ===== EXTERNAL SERVICES =====
    subgraph External["🌍 EXTERNAL SERVICES"]
        direction LR
        Cloudinary["Cloudinary<br/>(File Storage)"]
        GeminiCloud["Google Cloud<br/>(Gemini AI)"]
    end

    %% ===== CONNECTIONS =====
    
    %% Client to Gateway
    Browser --> Express
    Browser --> TailwindCDN
    Browser --> FontsCDN
    Browser --> CloudinaryCDN
    WebRTC --> SocketServer

    %% Gateway Internal
    Express --> Security
    Express --> SessionMgmt
    SessionMgmt --> MongoStore
    MongoStore --> MongoDB

    %% Gateway to Auth
    Express --> Passport
    Passport --> LocalStrategy
    Passport --> AuthMiddleware

    %% Auth to Routes
    AuthMiddleware --> Routes

    %% Routes to Controllers
    Routes --> Controllers

    %% Controllers to Models
    Controllers --> Models
    Controllers --> Utils

    %% Models to Database
    Models --> MongoDB
    MongoDB --> Collections

    %% AI Integration
    RoundDomain --> GeminiAPI
    GeminiAPI --> AIFeatures

    %% Real-time
    SocketServer --> Events
    SocketServer --> MongoDB

    %% External Services
    Utils --> Cloudinary
    Cloudinary --> CloudinaryCDN
    GeminiAPI --> GeminiCloud

    %% Styling
    classDef client fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef gateway fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef auth fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef controller fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef model fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef database fill:#e0f2f1,stroke:#00796b,stroke-width:2px
    classDef realtime fill:#fff8e1,stroke:#ffa000,stroke-width:2px
    classDef ai fill:#fbe9e7,stroke:#e64a19,stroke-width:2px
    classDef external fill:#eceff1,stroke:#546e7a,stroke-width:2px

    class ClientLayer client
    class Gateway gateway
    class Auth auth
    class Controllers controller
    class Models model
    class Database database
    class RealTime realtime
    class AI ai
    class External external
```

---

## 🔄 Request Flow Summary

```
👤 User → 🌐 Browser → 🛡️ Express + Helmet → 🔐 Session → 👤 Passport Auth
    ↓
🛤️ Routes → ⚙️ Controllers → 📦 Models → 💾 MongoDB
    ↓
🤖 Gemini AI (for DSA) ←→ ☁️ Cloudinary (for files)
    ↓
📡 Socket.IO (real-time) → 📹 WebRTC (video calls)
```

---

## 📊 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | EJS, Tailwind CSS, JavaScript |
| **Backend** | Node.js, Express 5.1 |
| **Database** | MongoDB, Mongoose 8 |
| **Auth** | Passport.js (Local Strategy) |
| **Sessions** | express-session + connect-mongo |
| **Real-time** | Socket.IO 4.8 |
| **Video** | WebRTC |
| **AI** | Google Gemini API |
| **Storage** | Cloudinary |
| **Security** | Helmet.js, bcrypt |

---

## 🎯 Key Data Flows

### 1️⃣ Job Application Flow
```
Candidate → Browse Jobs → Apply → Upload Resume (Cloudinary) → Save to MongoDB
```

### 2️⃣ Interview Round Flow
```
Start Round → Fetch Questions → Submit Answers → AI Evaluation (Gemini) → Score & Progress
```

### 3️⃣ Video Interview Flow
```
Join Room → Socket.IO Signaling → WebRTC P2P Connection → Live Video Stream
```

---

*InterViewXX - All-in-One Recruitment Platform*

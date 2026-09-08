
\documentclass[a4paper,10pt]{article}

% ================= Packages =================
\usepackage[utf8]{inputenc}
\usepackage[scale=0.9, top=0.34in, bottom=0.34in, left=0.6in, right=0.6in]{geometry}
\usepackage{parskip}
\usepackage{titlesec}
\usepackage{xcolor}
\usepackage{enumitem}
\usepackage{lmodern}
\usepackage{fontawesome5}
\definecolor{linkblue}{RGB}{0,0,180}
\usepackage[colorlinks=true, urlcolor=linkblue]{hyperref}

% ================= Layout =================
\setlength{\parindent}{0pt}
\setlength{\parskip}{0pt}
\linespread{0.93}

\setlist[itemize]{
    itemsep=0pt,
    topsep=0pt,
    parsep=0pt,
    leftmargin=*
}

\titlespacing{\section}{0pt}{2pt}{1pt}
\titleformat{\section}{\normalsize\bfseries}{}{0em}{}[\titlerule]

\begin{document}

% ================= Header =================
\begin{center}
{\Large \textbf{Anirban Santra}} \\[2pt]
{\small
\faEnvelope\ \href{mailto:anirbansantra748@gmail.com}{anirbansantra748@gmail.com}
\quad
\faPhone\ +91-79800-15159
\quad
\faMapMarker\ Kolkata, India
} \\[2pt]

{\small
\href{https://portfolioo-fawn-one.vercel.app/}{Portfolio}
$\vert$
\href{https://github.com/anirbansantra748}{GitHub}
$\vert$
\href{https://www.linkedin.com/in/anirban-santra-333074239/}{LinkedIn}
$\vert$
\href{https://leetcode.com/u/Anirbansantra/}{LeetCode}
}
\end{center}

% ================= Summary =================
\section*{Summary}
\vspace{2pt}
Backend-focused Software Engineer with \textbf{1+ year of professional experience} building production web platforms and backend systems using \textbf{Node.js, MongoDB, Redis, and asynchronous processing}. Experienced in backend architecture, real-time systems, event-driven workflows, and scalable system design.

% ================= Experience =================
\section*{Experience}
\vspace{3pt}

\textbf{Full Stack Developer --- \href{https://wondercreativestudios.com/}{Wonder Creative Studio}}
\hfill Nov 2025 -- Jul 2026

\begin{itemize}
\item Built and shipped \textbf{8 production platforms} including \href{https://www.mx-ix.com/}{MX-IX}, \href{https://app.lexireview.in/}{LexiReview}, \href{https://zenova-landing-beta.vercel.app/}{Zenova}, and \href{https://markix.livingstructures.co/}{Mark IX}; owned backend development and contributed across architecture, testing, deployment, and client delivery.
\item Designed backend architectures and replaced resource-heavy synchronous workflows with \textbf{BullMQ/Redis asynchronous processing}, improving reliability for long-running workloads.
\item Engineered a legal-document pipeline processing \textbf{500+ contracts}, including PDF/OCR extraction, section-aware chunking, embeddings, ChromaDB, and retrieval workflows for LexiReview.
\item Built a \textbf{content and product recommendation architecture} using user/item vectors and interaction signals for personalized feeds.
\end{itemize}

\textbf{Software Developer Intern --- \href{https://smaktech.com/}{SMAK Tech}}
\hfill Nov 2024 -- Apr 2025

\begin{itemize}
\item Optimized backend APIs through \textbf{query restructuring and Redis caching}; built authentication and backend services using Node.js, Express, and MongoDB.
\item Developed reusable \textbf{React/TypeScript} dashboard components and internal tooling.
\end{itemize}

% ================= Projects =================
\section*{Selected Projects}
\vspace{3pt}

\textbf{Peer --- AI-Powered Code Review Platform}
\hfill
\href{https://peer-uii.onrender.com/}{Live}
$\vert$
\href{https://github.com/anirbansantra748/peer}{GitHub}
$\vert$
\href{https://portfolioo-fawn-one.vercel.app/architecture}{Arch}
$\vert$
\href{https://www.youtube.com/watch?v=w7jWYkLUTHc}{Video}

\begin{itemize}
\item Architected an event-driven \textbf{7-service microservice platform} processing GitHub webhooks via horizontally scalable \textbf{BullMQ/Redis} worker nodes, maintaining a \textbf{p95 E2E analysis latency of $\sim$3.8s} during concurrent load tests.
\item Engineered a multi-model LLM routing pipeline with waterfall failover, circuit breakers, and \textbf{SHA-256 Redis caching}, reducing duplicate inference latency from 2.5s to \textbf{$<$5ms}.
\item Built \textbf{18 parallel code analyzers} executing concurrently via \texttt{Promise.all()}, integrating deduplication, severity ranking, and automated GitHub PR remediation.
\item \textbf{Stack:} Node.js, Express, MongoDB, Redis, BullMQ, LangChain
\end{itemize}

\vspace{2pt}

\textbf{Nebula --- Browser-Based AI IDE}
\hfill
\href{https://anti-gv-web.vercel.app/\#/ide}{Live}
$\vert$
\href{https://github.com/anirbansantra748/Anti_GV}{GitHub}
$\vert$
\href{https://portfolioo-fawn-one.vercel.app/architecture}{Arch}

\begin{itemize}
\item Engineered a scalable browser-based AI IDE, implementing \textbf{Redis pub/sub} state distribution to decouple WebSocket connections and enable horizontal backend scaling.
\item Implemented a 3-tier \textbf{RAM $\rightarrow$ IndexedDB $\rightarrow$ MongoDB} synchronization layer with a debounced flush mechanism, reducing database I/O write operations by \textbf{99.0\%} during active editing.
\item Designed a transactional shadow-workspace that intercepts and isolates AI edits, rolling back hallucinated file paths via \textbf{Merkle-tree integrity checks} hashing 10,000 files in \textbf{$<$1.0ms}.
\item \textbf{Stack:} Node.js, React, Socket.io, MongoDB, IndexedDB, Docker, WebContainers
\end{itemize}

\vspace{2pt}

\textbf{All-in-One Recruitment Platform}
\hfill
\href{https://interviewx-dgsc.onrender.com/home}{Live}
$\vert$
\href{https://github.com/anirbansantra748/InterViewXX}{GitHub}
$\vert$
\href{https://portfolioo-fawn-one.vercel.app/architecture}{Arch}

\begin{itemize}
\item Developed a full-stack recruitment platform featuring real-time \textbf{Socket.io/WebRTC} video interview rooms and synchronized code execution.
\item Engineered a custom JavaScript \textbf{execution sandbox} using memory-limited \texttt{child\_process} spawning, strictly blocking module access and successfully neutralizing \textbf{5/5 simulated host exploitation attempts} (OOM, infinite loops, LFI).
\item Built an AI resume extraction pipeline using Gemini LLM, integrating graceful degradation to \textbf{RegEx-based fallback parsers} during API timeouts to guarantee baseline data capture.
\item \textbf{Stack:} Node.js, Express, MongoDB, Socket.io, EJS, WebRTC
\end{itemize}

% ================= Architecture =================
\section*{Architecture \& System Design \hfill
{\small\normalfont \href{https://portfolioo-fawn-one.vercel.app/architecture}{[View All Designs]}}}
\vspace{3pt}

Designed and documented \textbf{14 scalable system architectures} with HLDs, component diagrams, capacity estimates, scalability analysis, and failure-handling strategies.

\begin{itemize}
\item \textbf{Infrastructure:} \href{https://portfolioo-fawn-one.vercel.app/architecture}{API Gateway}, \href{https://portfolioo-fawn-one.vercel.app/architecture}{Distributed Cache}, \href{https://portfolioo-fawn-one.vercel.app/architecture}{Rate Limiter}
\item \textbf{Data Systems:} \href{https://portfolioo-fawn-one.vercel.app/architecture}{Payment Gateway}, \href{https://portfolioo-fawn-one.vercel.app/architecture}{Notification System}, \href{https://portfolioo-fawn-one.vercel.app/architecture}{Video Streaming}
\item \textbf{Compute \& Storage:} \href{https://portfolioo-fawn-one.vercel.app/architecture}{Docker Execution Pool}, \href{https://portfolioo-fawn-one.vercel.app/architecture}{URL Shortener}, \href{https://portfolioo-fawn-one.vercel.app/architecture}{File Upload}, \href{https://portfolioo-fawn-one.vercel.app/architecture}{Face Recognition}
\end{itemize}

% ================= Skills =================
\section*{Skills}
\vspace{2pt}

\textbf{Languages:} JavaScript, TypeScript, Java, Python, SQL\\ \quad
\textbf{Backend:} Node.js, Express, REST APIs, WebSockets, Socket.io, BullMQ \\
\textbf{Databases \& Infrastructure:} MongoDB, Redis, ChromaDB, Docker, AWS S3, EC2, Git, Nginx \\
\textbf{Frontend:} React, HTML, CSS, EJS \quad
\textbf{Concepts:} System Design (HLD), Distributed Systems, Event-Driven Architecture, Async Processing, Caching

% ================= Achievements =================
\section*{Achievements}
\vspace{1pt}

\begin{itemize}
\item \textbf{Winner ---} \href{https://devpost.com/software/inclusivehorizon-web-app}{EduSands Hacks Hackathon} (1st / 50+ teams)\\
\quad
\textbf{Top-15 ---} \href{https://rebase01.devfolio.co/}{Rebase Hackathon} (200+ teams)
\item \textbf{500+ LeetCode problems solved}, including \textbf{250+ Medium/Hard}
\end{itemize}

% ================= Education =================
\section*{Education}
\vspace{1pt}

\textbf{B.Tech --- Computer Science}, Hooghly Engineering \& Technology College
\hfill 2022 -- 2026
\quad
CGPA: \textbf{8.06}

% ================= Interests =================
\section*{Interests}
\vspace{1pt}

Chess (1200+ rating), Astronomy, Poetry Writing, Competitive Programming

\end{document}
```

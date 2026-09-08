require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');

const ExpressError = require('./utils/ExpressError');

// Models
const User = require('./models/UserSchema');

// Env & App Setup
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/InterviewApp';
const app = express();
const server = http.createServer(app);
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000'];
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST']
  }
});
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(mongoUrl)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// EJS Setup
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(helmet());

// Helmet CSP
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "https://cdn.tailwindcss.com",
      "https://unpkg.com",
      "https://kit.fontawesome.com",
      "https://cdnjs.cloudflare.com",
      "'unsafe-inline'",
    ],
    styleSrc: [
      "'self'",
      "https://fonts.googleapis.com",
      "https://cdnjs.cloudflare.com",
      "'unsafe-inline'",
    ],
    fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
    imgSrc: ["'self'", "https://img.freepik.com", "data:"],
  },
}));

// Session store
if (!process.env.SESSION_SECRET) {
  console.warn('⚠️  SESSION_SECRET not set in .env — using insecure default. Set it before deploying.');
}
const sessionSecret = process.env.SESSION_SECRET || 'dev-only-change-me';
const store = MongoStore.create({
  mongoUrl,
  crypto: { secret: sessionSecret },
  touchAfter: 24 * 3600,
});
store.on('error', err => console.error("❌ MongoStore Error:", err));

app.use(session({
  store,
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  }
}));

// Rate limiting — protect sensitive routes from abuse
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
const codeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10, // 10 code executions per minute — prevent abuse
  message: { error: 'Code execution rate limit exceeded.' },
});

// Passport Config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Set user to all views
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Routes
const indexRoutes = require('./routes/indexRoutes');
const userRoutes = require('./routes/userRoutes');
const jobSearchRoutes = require('./routes/jobsearch');
const recruiterRoutes = require('./routes/recruiterRoutes');
const jobRoutes = require('./routes/jobRoutes');
const roundRoutes = require('./routes/roundRoutes');
const mcqRoutes = require('./routes/mcqRoute');
const dsaRoutes = require('./routes/dsaRoutes');
const grammarRoutes = require('./routes/grammarRoutes');
const aptiRoutes = require('./routes/aptiRoutes');
const generalRoutes = require('./routes/generalRoutes');
const chatRoutes = require('./routes/chatRoutes');
const videoRoutes = require('./routes/videoRoutes');
const questionRoutes = require('./routes/questionRoutes');
const resumeRoutes = require('./routes/resumeRoutes'); // ⭐ NEW

app.use('/', indexRoutes);
app.use('/users', userRoutes);
app.use('/jobsearch', jobSearchRoutes);
app.use('/recruiter', recruiterRoutes);
app.use('/jobs', jobRoutes);
app.use('/rounds', roundRoutes);
app.use('/add-round/mcq', mcqRoutes);
app.use('/add-round/dsa', dsaRoutes);
app.use('/add-round/grammar', grammarRoutes);
app.use('/add-round/aptitude', aptiRoutes);
app.use('/add-round/general', generalRoutes);
app.use('/chats', chatRoutes);
app.use('/video', videoRoutes);
app.use('/questions', questionRoutes);
app.use('/api/resume', apiLimiter, resumeRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(mongoStatus === 'connected' ? 200 : 503).json({
    ok: mongoStatus === 'connected',
    status: mongoStatus === 'connected' ? 'healthy' : 'unhealthy',
    uptime: process.uptime(),
    mongo: mongoStatus,
    timestamp: new Date().toISOString(),
  });
});

// 404 Catch-All
app.use((req, res, next) => {
  res.status(404).render('error', {
    error: {
      status: 404,
      message: "Page Not Found 🚫"
    }
  });
});

// 🔥 Global Error Handler
app.use((err, req, res, next) => {
  const { status = 500, message = "Internal Server Error 💥" } = err;
  console.error("🔥 ERROR:", err.stack || err);
  res.status(status).render('error', {
    error: {
      status,
      message,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : null,
    }
  });
});

// WebRTC + Socket.IO
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', socket.id);
  });

  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', data);
  });

  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', data);
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', data);
  });

  // Whiteboard synchronization
  socket.on('canvas-draw', (data) => {
    socket.to(data.roomId).emit('canvas-draw', data);
  });

  socket.on('canvas-text', (data) => {
    socket.to(data.roomId).emit('canvas-text', data);
  });

  socket.on('canvas-clear', (data) => {
    socket.to(data.roomId).emit('canvas-clear');
  });

  socket.on('canvas-shape', (data) => {
    socket.to(data.roomId).emit('canvas-shape', data);
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Start Server
server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

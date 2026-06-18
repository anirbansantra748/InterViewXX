require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/UserSchema');
const Job = require('./models/JobSchema');
const Round = require('./models/RoundSchema');
const MCQRound = require('./models/MCQRound');
const DSARound = require('./models/DSARound');
const AptitudeRound = require('./models/AptitudeRound');
const GrammarRound = require('./models/GrammarRound');

const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/InterviewApp';

async function seedDB() {
  try {
    console.log('🔄 Connecting to MongoDB for seeding...');
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected successfully!');

    // 1. Clear old data
    console.log('🧹 Clearing old collections...');
    await User.deleteMany({});
    await Job.deleteMany({});
    await Round.deleteMany({});
    await MCQRound.deleteMany({});
    await DSARound.deleteMany({});
    await AptitudeRound.deleteMany({});
    await GrammarRound.deleteMany({});
    console.log('✅ Collections cleared.');

    // 2. Create Recruiters & Candidates
    console.log('👤 Registering seed users...');
    
    // Seed Recruiter
    const recruiterUser = new User({
      username: 'recruiter',
      fullName: 'Jane Doe',
      email: 'recruiter@company.com',
      role: 'recruiter'
    });
    const recruiter = await User.register(recruiterUser, 'recruiter123');
    console.log(`👤 Recruiter created: ${recruiter.username}`);

    // Seed Honest Candidate (Alice)
    const aliceUser = new User({
      username: 'alice',
      fullName: 'Alice Smith',
      email: 'alice@gmail.com',
      role: 'user',
      resumeExtractedData: {
        skills: [{ name: 'React', category: 'Technical', level: 'Advanced' }, { name: 'Node.js', category: 'Technical', level: 'Advanced' }]
      }
    });
    const alice = await User.register(aliceUser, 'alice123');
    console.log(`👤 Honest candidate created: ${alice.username}`);

    // Seed Flagged Cheater Candidate (Bob)
    const bobUser = new User({
      username: 'cheater_bob',
      fullName: 'Bob Slippery',
      email: 'bob@gmail.com',
      role: 'user',
      resumeExtractedData: {
        skills: [{ name: 'React', category: 'Technical', level: 'Intermediate' }]
      }
    });
    const bob = await User.register(bobUser, 'bob123');
    console.log(`👤 Flagged candidate created: ${bob.username}`);

    // 3. Create Seed Jobs
    console.log('💼 Seeding jobs...');
    
    const job1 = new Job({
      title: 'Senior Full-Stack Engineer (React & Node.js)',
      description: 'We are seeking a Senior Full-Stack Developer to design and implement premium user interfaces and high-performance event-driven architectures. You will lead UI engineering and construct modular backend services.',
      company: 'Norden Tech Co.',
      location: 'Copenhagen, Denmark',
      salaryRange: '$120,000 - $145,000 DKK',
      jobType: 'Full-time',
      mode: 'Remote',
      skillsRequired: ['React', 'Node.js', 'Express', 'Socket.IO', 'Tailwind CSS'],
      experienceRequired: '5+ years',
      createdBy: recruiter._id,
      deadlineDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
      totalRounds: 3,
      roundsAdded: 0
    });

    const job2 = new Job({
      title: 'AI Platform Engineer',
      description: 'Join our generative AI squad to construct RAG pipelines, manage Pinecone vector indexes, and integrate Gemini models for semantic parsing and document screening automation.',
      company: 'FutureMind AI',
      location: 'San Francisco, CA',
      salaryRange: '$160,000 - $190,000',
      jobType: 'Full-time',
      mode: 'Remote',
      skillsRequired: ['Python', 'Pinecone', 'Gemini API', 'Node.js', 'Vector Search'],
      experienceRequired: '3+ years',
      createdBy: recruiter._id,
      deadlineDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
      totalRounds: 2,
      roundsAdded: 0
    });

    const savedJob1 = await job1.save();
    const savedJob2 = await job2.save();
    console.log('✅ Jobs seeded.');

    // 4. Create Assessment Rounds for Job 1
    console.log('📝 Seeding assessment rounds...');

    // Round 1: MCQ Assessment
    const mcqContent = new MCQRound({
      createdBy: recruiter._id,
      job: savedJob1._id,
      title: 'General Technical MCQ',
      timeLimit: 15,
      totalMarks: 30,
      passingMarks: 15,
      questions: [
        {
          questionText: 'Which lifecycle method in React is invoked immediately after a component is mounted?',
          options: [
            { text: 'componentWillMount', isCorrect: false },
            { text: 'componentDidMount', isCorrect: true },
            { text: 'componentDidUpdate', isCorrect: false },
            { text: 'render', isCorrect: false }
          ],
          explanation: 'componentDidMount is executed once after the initial render.',
          difficulty: 'Easy',
          tags: ['React', 'Frontend']
        },
        {
          questionText: 'What is the purpose of Node.js cluster module?',
          options: [
            { text: 'To encrypt session cookies', isCorrect: false },
            { text: 'To share state across socket processes', isCorrect: false },
            { text: 'To spawn child processes that share server ports', isCorrect: true },
            { text: 'To compress build assets', isCorrect: false }
          ],
          explanation: 'The cluster module lets you create child processes that all share server ports to scale across cores.',
          difficulty: 'Medium',
          tags: ['Node.js', 'Backend']
        }
      ]
    });
    const savedMcqContent = await mcqContent.save();

    const round1 = new Round({
      job: savedJob1._id,
      roundType: 'MCQ',
      title: 'Technical MCQ Check',
      duration: 15,
      order: 1,
      roundContentType: 'MCQRound',
      roundContent: savedMcqContent._id,
      // Seed Alice (Passed, 0 cheater activities) and Bob (Passed but Flagged)
      isqualify: [
        {
          user: alice._id,
          qualified: true,
          score: 30,
          tabSwitches: 0,
          copyPasteAttempts: 0,
          windowBlurs: 1,
          cheatingFlagged: false
        },
        {
          user: bob._id,
          qualified: true,
          score: 30,
          tabSwitches: 6,
          copyPasteAttempts: 4,
          windowBlurs: 5,
          cheatingFlagged: true
        }
      ]
    });
    await round1.save();
    savedJob1.rounds.push(round1._id);
    savedJob1.roundsAdded++;

    // Round 2: DSA Coding Round
    const dsaContent = new DSARound({
      createdBy: recruiter._id,
      job: savedJob1._id,
      title: 'DSA Code Challenge',
      timeLimit: 30,
      passingMarks: 10,
      questions: [
        {
          title: 'Sum of Two Numbers',
          problemStatement: 'Write a program that reads two space-separated integers from standard input and prints their sum to standard output. Example: Input "5 10" should output "15".',
          inputFormat: 'Two space-separated integers, a and b.',
          outputFormat: 'A single integer representing the sum.',
          constraints: '-10^9 <= a, b <= 10^9',
          sampleInput: '5 10',
          sampleOutput: '15',
          solution: 'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf-8").trim().split(" ");\nconst sum = parseInt(input[0]) + parseInt(input[1]);\nconsole.log(sum);'
        }
      ]
    });
    const savedDsaContent = await dsaContent.save();

    const round2 = new Round({
      job: savedJob1._id,
      roundType: 'DSA',
      title: 'DSA Programming Challenge',
      duration: 30,
      order: 2,
      roundContentType: 'DSARound',
      roundContent: savedDsaContent._id,
      isqualify: [
        {
          user: alice._id,
          qualified: true,
          score: 10,
          tabSwitches: 0,
          copyPasteAttempts: 0,
          windowBlurs: 0,
          cheatingFlagged: false
        },
        {
          user: bob._id,
          qualified: false,
          score: 0,
          tabSwitches: 8,
          copyPasteAttempts: 12,
          windowBlurs: 7,
          cheatingFlagged: true
        }
      ]
    });
    await round2.save();
    savedJob1.rounds.push(round2._id);
    savedJob1.roundsAdded++;

    // Round 3: Aptitude Round
    const aptiContent = new AptitudeRound({
      createdBy: recruiter._id,
      job: savedJob1._id,
      title: 'Logic & Aptitude Assessment',
      timeLimit: 20,
      totalMarks: 20,
      passingMarks: 10,
      questions: [
        {
          question: 'If a project is built by 4 developers in 12 days, how many days will it take for 8 developers to build the same project under identical conditions?',
          options: ['6 days', '8 days', '12 days', '24 days'],
          correctAnswer: '6 days',
          explanation: 'Double the developers, half the time. 12 / 2 = 6.',
          difficulty: 'Easy',
          category: 'Logical Reasoning'
        }
      ]
    });
    const savedAptiContent = await aptiContent.save();

    const round3 = new Round({
      job: savedJob1._id,
      roundType: 'Aptitude',
      title: 'Logical Aptitude Check',
      duration: 20,
      order: 3,
      roundContentType: 'AptitudeRound',
      roundContent: savedAptiContent._id,
      isqualify: [
        {
          user: alice._id,
          qualified: true,
          score: 20,
          tabSwitches: 1,
          copyPasteAttempts: 0,
          windowBlurs: 1,
          cheatingFlagged: false
        }
      ]
    });
    await round3.save();
    savedJob1.rounds.push(round3._id);
    savedJob1.roundsAdded++;

    await savedJob1.save();
    console.log('✅ Rounds and qualifications seeded successfully for Norden Tech Job.');

    console.log('\n🌟 Database seeding completed successfully! Ready for verification.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedDB();

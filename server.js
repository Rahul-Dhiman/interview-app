const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = process.env.EXPO_PUBLIC_MONGODB_URI;
const client = new MongoClient(uri);

const sampleQuestions = [
  {
    question: "What is closure in JavaScript?",
    answer: "A closure is the combination of a function and the lexical environment within which that function was declared. It allows a function to access variables in its outer scope even after the outer function has returned.",
    createdAt: new Date()
  },
  {
    question: "Explain the difference between let, const, and var.",
    answer: "var is function-scoped and can be redeclared, let is block-scoped and can be reassigned but not redeclared, const is block-scoped and cannot be reassigned or redeclared. Both let and const are hoisted but not initialized, creating a temporal dead zone.",
    createdAt: new Date()
  },
  {
    question: "What is event delegation in JavaScript?",
    answer: "Event delegation is a technique where you attach an event listener to a parent element to handle events on its children, even those added dynamically. It's based on event bubbling and can improve performance by reducing the number of event listeners.",
    createdAt: new Date()
  },
  {
    question: "Explain Promise and async/await in JavaScript.",
    answer: "Promises are objects representing the eventual completion or failure of an asynchronous operation. async/await is syntactic sugar over promises that makes asynchronous code look and behave more like synchronous code. An async function always returns a promise, and await can only be used inside async functions.",
    createdAt: new Date()
  },
  {
    question: "What is prototypal inheritance in JavaScript?",
    answer: "Prototypal inheritance is JavaScript's mechanism for sharing properties and methods between objects. Each object has a private property that holds a link to another object called its prototype. That prototype object has its own prototype, forming a chain until reaching an object with null as its prototype.",
    createdAt: new Date()
  }
];

async function initializeDB() {
  try {
    await client.connect();
    const db = client.db('interview-app');
    const collection = db.collection('questions');
    
    const count = await collection.countDocuments();
    if (count === 0) {
      await collection.insertMany(sampleQuestions);
      console.log('Sample questions inserted successfully');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Initialize database with sample questions
initializeDB();

app.get('/questions', async (req, res) => {
  try {
    const db = client.db('interview-app');
    const collection = db.collection('questions');
    const questions = await collection.find().sort({ createdAt: -1 }).toArray();
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

app.post('/questions', async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    const db = client.db('interview-app');
    const collection = db.collection('questions');
    const result = await collection.insertOne({
      question,
      answer,
      createdAt: new Date()
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ error: 'Failed to add question' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
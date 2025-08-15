const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRouter = require('./controllers/authController');
const userRouter = require('./controllers/userController');
const uploadRouter = require('./controllers/uploadController');
const queryRouter = require('./controllers/queryController');
const firebaseRouter = require('./controllers/firebaseController');
const chatRouter = require('./controllers/chatController');
const messageRouter = require('./controllers/messageController');
const flashCardRouter = require('./controllers/flashCardController');
const flashCardSetRouter = require('./controllers/flashCardSetController');

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174','https://unidash-zense.onrender.com'], 
  credentials: true               
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api', firebaseRouter);
app.use('/api', uploadRouter);
app.use('/api', queryRouter);
app.use('/api', chatRouter);
app.use('/api', messageRouter);
app.use('/api/flashcards', flashCardRouter);
app.use('/api/flashcard-sets', flashCardSetRouter);

module.exports = app;

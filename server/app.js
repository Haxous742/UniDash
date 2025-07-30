const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRouter = require('./controllers/authController');
const userRouter = require('./controllers/userController');

app.use(cors({
  origin: 'http://localhost:5173', // 👈 frontend URL
  credentials: true               // 👈 allow cookies / auth headers
}));

app.use(cookieParser());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

module.exports = app;
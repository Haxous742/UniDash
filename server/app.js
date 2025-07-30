const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const authRouter = require('./controllers/authController');
const userRouter = require('./controllers/userController');

app.use(cookieParser());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

module.exports = app;
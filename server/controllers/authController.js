const router = require('express').Router();
const bcrypt = require('bcryptjs'); // For hashing passwords
const jwt = require('jsonwebtoken'); // For generating JWT tokens
const User = require('../models/user'); 

router.post('/signup', async (req,res) => {
    try{

       const user = await User.findOne({email: req.body.email})

       if (user){
        return res.status(400).send({
            message: 'User already exists',
            success: false
        })
       }

       const hashedPassword = await bcrypt.hash(req.body.password, 11);
       req.body.password = hashedPassword;

       const newUser = new User(req.body);
       await newUser.save()

       res.status(201).send({
           message: 'User created successfully',
           success: true
       })

    }  
    catch(err){
        res.status(400).send({
            message: err.message,
            success: false
        })
    }
})


router.post('/login', async (req, res) => {
    try{
        //find if user exists
        const user = await User.findOne({email: req.body.email}).select('+password');

        if (!user){
            return res.send({
                message: 'User does not exist',
                success: false
            })
        }

        // check if passsword is correct
        const isvalid = await bcrypt.compare(req.body.password, user.password);

        if (!isvalid){
            return res.send({
                message: 'Invalid credentials',
                success: false
            })
        }

        //generate JWT token
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'});
        
        res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
        });

        res.send({
            message: 'Login successful',
            success: true,
            data: {
                user: {
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    profilePic: user.profilePic
                },  
            }
        })

    } catch(err){
        res.status(400).send({
            message: err.message,
            success: false
        })
    }
})

router.post('/logout', (req, res) => {
    try{
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });
        res.send({
            message: 'Logout successful',
            success: true
        })
    } catch(err){
        res.status(400).send({
            message: err.message,
            success: false
        })
    }
})

module.exports = router;
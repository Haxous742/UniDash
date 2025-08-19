const express = require("express");
const jwt = require("jsonwebtoken");
const admin = require("../config/firebaseAdmin");
const Users = require("../models/user");
const router = express.Router();

router.post("/firebase-login", async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    let user = await Users.findOne({ email : email});

    if (!user) {
      const nameParts = name ? name.split(' ') : [];
      const firstname = nameParts[0] || '';
      const lastname = nameParts.slice(1).join(' ') || '';
      
      user = await Users.create({ 
        email,
        firstname,
        lastname,
        profilePic: picture || ''
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ 
      message: "Login successful",
      success: true,
      data: {
        user: {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          profilePic: user.profilePic
        }
      }
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid Firebase ID token" });
  }
});

module.exports = router;

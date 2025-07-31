const express = require("express");
const jwt = require("jsonwebtoken");
const admin = require("../config/firebaseAdmin");
const Users = require("../models/user");
const router = express.Router();

router.post("/firebase-login", async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    let user = await Users.findOne({ email : email});

    if (!user) {
      user = await Users.create({ email });
    }

    const token = jwt.sign({ uid, email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(401).json({ message: "Invalid Firebase ID token" });
  }
});

module.exports = router;

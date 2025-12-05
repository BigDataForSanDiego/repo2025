const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const Client = require("../models/Client");
const Coordinator = require("../models/Coordinator")
const {store_answer} = require("../crud");
const router = express.Router();
dotenv.config();


/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Log in to account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - accountType
 *             properties:
 *               username:
 *                 type: string
 *                 example: JohnDoe
 *               password:
 *                 type: string
 *                 example: 123password123
 *               accountType:
 *                 type: String
 *                 example: Client
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: client1234token
 *       500:
 *         description: Login Failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: error  
 */
router.post("/api/login", async (req, res) => {
  try {
    const {username, password, accountType} = req.body;
    let token = null;
    if(accountType == "Client"){
      const client = await Client.findOne({username: username});
      if(!client) return res.status(400).json({message: "Invalid username"});
      //console.log(password);
      //console.log(client.password);
      const isMatch = await bcrypt.compare(password, client.password);
      if(!isMatch) return res.status(400).json({message: "Incorrect password"});

      token = jwt.sign(
        {userId: client._id.toString(), username: client.username}, 
        process.env.JWT_SECRET, 
        {expiresIn: "24h"}
      );
    }
    else if (accountType == "Coordinator"){
      const coordinator = await Coordinator.findOne({username: username});
      if(!coordinator) return res.status(400).json({message: "Invalid username"});
      //console.log(password);
      //console.log(client.password);
      const isMatch = await bcrypt.compare(password, coordinator.password);
      if(!isMatch) return res.status(400).json({message: "Incorrect password"});
      token = jwt.sign(
        {userId: coordinator._id.toString(), username: coordinator.username}, 
        process.env.JWT_SECRET, 
        {expiresIn: "24h"}
      );
    }
    else{
      throw new Error("invalid account type");
    }
    res.status(200).json({ token: token});
  } catch (err){
    res.status(500).json({ error: err.message});
  }
});

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Log out of account
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Unauthorized
 */
router.post("/api/logout", async (req, res) => {
});

module.exports = router;

const express = require("express");
const router = express.Router();

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
 *             properties:
 *               username:
 *                 type: string
 *                 example: JohnDoe
 *               password:
 *                 type: string
 *                 example: 123password123
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
 */
router.post("/api/login", (req, res) => {
  res.json({ token: "client1234token" });
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
router.post("/api/logout", (req, res) => {
  res.sendStatus(200);
});

module.exports = router;

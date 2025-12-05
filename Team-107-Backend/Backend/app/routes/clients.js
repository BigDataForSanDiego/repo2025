const express = require("express");
const store_answer = require("../crud")
const router = express.Router();

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Register Client account
 *     tags: [Clients]
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
 *       201:
 *         description: Successfully created Client
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientId:
 *                   type: integer
 *                   example: 1234
 */
router.post("/api/clients", (req, res) => {
  res.status(201).json({ clientId: 1234 });
});

/**
 * @swagger
 * /api/clients/me:
 *   delete:
 *     summary: Delete Client account
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Successfully deleted Client
 *       401:
 *         description: Unauthorized
 */
router.delete("/api/clients/me", (req, res) => {
  res.sendStatus(204);
});

/**
 * @swagger
 * /api/clients/me:
 *   get:
 *     summary: Get Client's dashboard
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Got Client's dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dashboard:
 *                   type: string
 *                   example: placeholder for the dashboard object
 *       401:
 *         description: Unauthorized
 */
router.get("/api/clients/me", (req, res) => {
  res.json({ dashboard: "placeholder for the dashboard object" });
});

/**
 * @swagger
 * /api/clients/me/surveys:
 *   get:
 *     summary: Get Client's surveys
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Got Client's surveys
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 surveys:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [8, 9]
 *       401:
 *         description: Unauthorized
 */
router.get("/api/clients/me/surveys", (req, res) => {
  res.json({ surveys: [8, 9] });
});

/**
 * @swagger
 * /api/clients/me/surveys/{surveyId}:
 *   get:
 *     summary: Get Client's survey by ID
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: surveyId
 *         in: path
 *         required: true
 *         description: Numeric ID of the survey
 *         schema:
 *           type: integer
 *           example: 8
 *     responses:
 *       200:
 *         description: Got survey
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 submitted:
 *                   type: boolean
 *                   example: true
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Question1", "Question2", "Question3"]
 *                 response:
 *                   type: array
 *                   items:
 *                     oneOf:
 *                       - type: string
 *                       - type: integer
 *                   example: ["Answer1", 100, "Answer3"]
 *       401:
 *         description: Unauthorized
 */
router.get("/api/clients/me/surveys/:surveyId", (req, res) => {
  const { surveyId } = req.params;
  
  res.json({
    submitted: true,
    questions: ["Question1", "Question2", "Question3"],
    response: answers,
  });
});

/**
 * @swagger
 * /api/clients/me/surveys/{surveyId}/answers:
 *   post:
 *     summary: Send Client's answer to survey by ID
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: surveyId
 *         in: path
 *         required: true
 *         description: Numeric ID of the survey
 *         schema:
 *           type: integer
 *           example: 8
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answer
 *             properties:
 *               answer:
 *                 type: array
 *                 items:
 *                   oneOf:
 *                     - type: string
 *                     - type: integer
 *                 example: ["Answer1", 100, "Answer3"]
 *     responses:
 *       200:
 *         description: Successfully sent response
 *       401:
 *         description: Unauthorized
 */
router.post("/api/clients/me/surveys/:surveyId/answers", async (req, res) => {
  try{
    const savedAnswer = await store_answer(req);
    res.status(201).json({ message: 'Response saved successfully', response: savedAnswer });
  } catch(error){
    console.error("Save error:", error);
    res.status(500).json({error: 'Error fetching responses'})
  }
});

/**
 * @swagger
 * /api/coordinators/{coordinatorId}/contact:
 *   get:
 *     summary: Contact Client's Coordinator by ID
 *     tags: [Coordinators]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: coordinatorId
 *         in: path
 *         required: true
 *         description: Numeric ID of Coordinator
 *         schema:
 *           type: integer
 *           example: 5678
 *     responses:
 *       200:
 *         description: Contacted Client's coordinator
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 contact:
 *                   type: string
 *                   example: "123-456-7890"
 *       401:
 *         description: Unauthorized
 */
router.get("/api/coordinators/:coordinatorId/contact", (req, res) => {
  const { coordinatorId } = req.params;
  res.json({ contact: "123-456-7890" });
});

module.exports = router;

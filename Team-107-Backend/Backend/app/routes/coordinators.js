const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /api/coordinators:
 *   post:
 *     summary: Register Coordinator account
 *     tags: [Coordinators]
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
 *                 example: JaneDoe
 *               password:
 *                 type: string
 *                 example: 456password456
 *     responses:
 *       201:
 *         description: Successfully created Coordinator
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 coordinatorId:
 *                   type: integer
 *                   example: 5678
 */
router.post("/api/coordinators", (req, res) => {
  res.status(201).json({ coordinatorId: 5678 });
});

/**
 * @swagger
 * /api/coordinators/me:
 *   delete:
 *     summary: Delete Coordinator account
 *     tags: [Coordinators]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Successfully deleted Coordinator
 *       401:
 *         description: Unauthorized
 */
router.delete("/api/coordinators/me", (req, res) => {
  res.sendStatus(204);
});

/**
 * @swagger
 * /api/clients/{clientId}/contact:
 *   get:
 *     summary: Contact Coordinator's Client by ID
 *     tags: [Coordinators]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: clientId
 *         in: path
 *         required: true
 *         description: Numeric ID of Client
 *         schema:
 *           type: integer
 *           example: 1234
 *     responses:
 *       200:
 *         description: Contacted Coordinator's Client
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
router.get("/api/clients/:clientId/contact", (req, res) => {
  const { clientId } = req.params;
  res.json({ contact: "123-456-7890" });
});

/**
 * @swagger
 * /api/clients/{clientId}/surveys:
 *   post:
 *     summary: Manually assign extra survey
 *     tags: [Coordinators]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: clientId
 *         in: path
 *         required: true
 *         description: Numeric ID of the Client
 *         schema:
 *           type: integer
 *           example: 1234
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - surveyId
 *             properties:
 *               surveyId:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Successfully assigned survey
 *       401:
 *         description: Unauthorized
 */
router.post("/api/clients/:clientId/surveys", (req, res) => {
  res.sendStatus(201);
});

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: View all Clients
 *     tags: [Coordinators]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of clients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clients:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [1234, 5678]
 *       401:
 *         description: Unauthorized
 */
router.get("/api/clients", (req, res) => {
  res.json({ clients: [1234, 5678] });
});

/**
 * @swagger
 * /api/clients/{clientId}:
 *   get:
 *     summary: View Client profile
 *     tags: [Coordinators]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: clientId
 *         in: path
 *         required: true
 *         description: Numeric ID of the Client
 *         schema:
 *           type: integer
 *           example: 1234
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
router.get("/api/clients/:clientId", (req, res) => {
  res.json({ dashboard: "placeholder for the dashboard object" });
});

/**
 * @swagger
 * /api/clients/{clientId}/surveys:
 *   get:
 *     summary: View Client survey list
 *     tags: [Coordinators]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: clientId
 *         in: path
 *         required: true
 *         description: Numeric ID of the Client
 *         schema:
 *           type: integer
 *           example: 1234
 *     responses:
 *       200:
 *         description: A list of survey IDs for the client
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
router.get("/api/clients/:clientId/surveys", (req, res) => {
  res.json({ surveys: [8, 9] });
});

/**
 * @swagger
 * /api/clients/{clientId}/surveys/{surveyId}:
 *   get:
 *     summary: View Client survey
 *     tags: [Coordinators]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: clientId
 *         in: path
 *         required: true
 *         description: Numeric ID of the Client
 *         schema:
 *           type: integer
 *           example: 1234
 *       - name: surveyId
 *         in: path
 *         required: true
 *         description: Numeric ID of the survey
 *         schema:
 *           type: integer
 *           example: 8
 *     responses:
 *       200:
 *         description: The client's survey details
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
router.get("/api/clients/:clientId/surveys/:surveyId", (req, res) => {
  res.json({
    submitted: true,
    questions: ["Question1", "Question2", "Question3"],
    response: ["Answer1", 100, "Answer3"],
  });
});

/**
 * @swagger
 * /api/surveys:
 *   post:
 *     summary: Create Survey
 *     tags: [Coordinators]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questions
 *             properties:
 *               questions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Question1", "Question2", "Question3"]
 *     responses:
 *       201:
 *         description: Survey created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 surveyId:
 *                   type: integer
 *                   example: 10
 *       401:
 *         description: Unauthorized
 */
router.post("/api/surveys", (req, res) => {
  res.status(201).json({ surveyId: 10 });
});

module.exports = router;

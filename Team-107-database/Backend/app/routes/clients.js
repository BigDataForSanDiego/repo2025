const express = require("express");
const {store_answer, create_client, getClientIdFromToken, delete_client} = require("../crud");
const Dashboard = require("../models/Dashboard");
const Answer = require("../models/Answer");
const Client = require("../models/Client");
const Coordinator = require("../models/Coordinator");
const mongoose = require("mongoose");
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
 *                 user:
 *                   type: object
 *                   example: user1234
 *                 dashboard:
 *                   type: object
 *                   example: dashboard1234
 */
router.post("/api/clients", async (req, res) => {
  try {
    const {savedUser, clientDashboard} = await create_client(req);
    res.status(201).json({ message:"Client Created", user: savedUser, dashboard: clientDashboard });
  } catch(error){
    res.status(404).json({ error: error.message });
  }
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
 *         description: Deletion Failed
 */
router.delete("/api/clients/me", async (req, res) => {
  try {
    const deletedClient = await delete_client(req, res);
    res.status(204).json({ message:"Client Deleted", client: deletedClient});
  } catch (err){
    res.status(401).json({ message: "Deletion Failed", error: err.message});
  }
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
 *       500:
 *         description: Dashoboard not found
 */
router.get("/api/clients/me", async (req, res) => {
  try {
    const id = await getClientIdFromToken(req, res);
    const clientDashboard = await Dashboard.findOne({clientId: id});
    res.json({ dashboard: clientDashboard });
  } catch(err){
    res.status(500).json({ message: "Dashboard not found", error: err.message});
  }
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
router.get("/api/clients/me/surveys", async (req, res) => {
  try {
    const id = await getClientIdFromToken(req, res);
    const client = await Client.findById(id);
    const surveys = client.surveys;
    res.json({surveys: surveys});
  } catch(err){
    res.status(500).json({message: "Surveys not found", error: err.message});
  }
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
router.get("/api/clients/me/surveys/:surveyId", async (req, res) => {
  try {
    const { surveyId } = req.params;
    const survey = await Answer.findOne({surveyId: surveyId})
    res.json({
      submitted: true,
      questions: ["Question1", "Question2", "Question3"],
      response: survey.answers,
    });
  }catch(err){
    res.status(500).json({message: "Survey not found", error: err.message});
  }
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
 * /api/clients/me/contact:
 *   get:
 *     summary: Get own coordinator contact
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
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
router.get("/api/clients/me/contact", async (req, res) => {
  try {
    const clientId = await getClientIdFromToken(req, res);
    const client = await Client.findById(clientId);
    const coordinatorId = client.coordinator;
    const coordinator = await Coordinator.findById(coordinatorId);
    const contact = coordinator.contact;
    res.json({ message: "Fetched coordinator contact", contact: contact });
  } catch(error){
    res.status(500).json({message: "Failed to get coordinator contact", error: error})
  }
});

module.exports = router;

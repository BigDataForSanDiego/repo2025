const express = require("express");
const {create_coordinator, getClientIdFromToken, delete_coordinator} = require("../crud");
const Dashboard = require("../models/Dashboard");
const Answer = require("../models/Answer");
const Client = require("../models/Client");
const Coordinator = require("../models/Coordinator");
const mongoose = require("mongoose");
const Survey = require("../models/Survey");
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
 *                   type: object
 *                   example: coordinator5678
 */
router.post("/api/coordinators", async (req, res) => {
try {
    const coordinator = await create_coordinator(req);
    res.status(201).json({ message:"Client Created", user: coordinator });
  } catch(error){
    res.status(404).json({ error: error.message });
  }
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
router.delete("/api/coordinators/me", async (req, res) => {
  try {
    const deletedClient = await delete_coordinator(req, res);
    res.status(204).json({ message:"Coordinator Deleted", client: deletedClient});
  } catch (err){
    res.status(401).json({ message: "Deletion Failed", error: err.message});
  }
});

/**
 * @swagger
 * /api/clients/assign:
 *   post:
 *     summary: Assign client to coordinator
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
 *               - clientName
 *             properties:
 *               clientName:
 *                 type: string
 *                 example: "JohnDoe"
 *     responses:
 *       204:
 *         description: Successfully assigned client
 *       401: 
 *         description: unauthorized
 */
router.post("/api/clients/assign", async (req, res) => {
  try{
    const coordinatorId = await getClientIdFromToken(req, res);
    const clientName = req.body.clientName;
    const updatedClient = await Client.findOneAndUpdate(
      {username: clientName},
      {coordinator: coordinatorId}
    );
    res.status(204).json({message: "coordinator assigned", client: updatedClient});
  }catch(err){
    res.status(401).json({message: "error assignging client", error: err});
  }
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
 *         description: Object ID of Client
 *         schema:
 *           type: string
 *           example: 69169f834df755e5a6726f0c
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
router.get("/api/clients/:clientId/contact", async (req, res) => {
  const { clientId } = req.params;
  const client = await Client.findById(clientId);
  const contact = client.contact;
  res.json({ contact: contact });
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
router.get("/api/clients", async (req, res) => {
  try {  
    const coordinatorId = await getClientIdFromToken(req);
    const clients = await Client.find(
      { coordinator: coordinatorId }
    );
    const clientsWithNames = clients.map(client => ({
      username: client.username,
      id: client._id
    }));
    res.status(200).json({clients: clientsWithNames});
  } catch(error){
    res.status(401).json({message:"Failed to retrieve clients"});
  }
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
 *         description: Object ID of the client
 *         schema:
 *           type: String
 *           example: 6916d11dab082902b0db7801
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
router.get("/api/clients/:clientId", async (req, res) => {
  try {
    const {clientId} = req.params;
    const dashboard = await Dashboard.findOne({clientId: clientId});
    res.status(200).json({dashboard: dashboard});
  } catch(error){
    res.status(401).json({message:"Failed to retrieve clients"});
  }
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
 *         description: Numeric ID of the Client
 *         schema:
 *           type: string
 *           example: 6916d11dab082902b0db7801
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
router.get("/api/clients/:clientId/surveys", async (req, res) => {
  try {
    const {clientId} = req.params;
    const client = await Client.findById(clientId);
    const surveys = client.surveys;
    res.status(200).json({surveys: surveys});
  } catch(err){
    res.status(500).json({message: "Surveys not found", error: err.message});
  }
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
 *         description: Object ID of the Client
 *         schema:
 *           type: string
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
router.get("/api/clients/:clientId/surveys/:surveyId", async (req, res) => {
  try {
    const {clientId, surveyId} = req.params;
    const survey = await Answer.findOne({surveyId: surveyId});
    res.status(200).json({survey: survey});
  } catch(err){
    res.status(401).json({message: "Failed to fetch survey", error: err.message});
  }
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
 *               - surveyName
 *               - description
 *               - questions
 *             properties:
 *               surveyName:
 *                 type: string
 *                 example: "My Survey"
 *               description:
 *                 type: string
 *                 example: "Survey for me!"
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
 *                 survey:
 *                   type: object
 *                   example: idk a survey lol
 *       401:
 *         description: Unauthorized
 */
router.post("/api/surveys", (req, res) => {
  try{
    const body = req.body;
    const questions = body.questions;
    const surveyName = body.surveyName;
    const description = body.description;
    const survey = new Survey({surveyName, description, questions});
    const newSurvey = survey.save();
    res.status(201).json({message: "Survey created", survey: survey});
  }catch(error){
    res.status(401).json({message: "Failed to create survey"});
  }
});

module.exports = router;

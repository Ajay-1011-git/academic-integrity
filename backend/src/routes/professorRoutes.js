const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const rubricController = require('../controllers/rubricController');
const evaluationController = require('../controllers/evaluationController');
const ollamaEvaluationController = require('../controllers/ollamaEvaluationController');
const { verifyToken, checkVITEmail, checkRole } = require('../middleware/auth');

// Assignment routes
router.post('/assignments', verifyToken, checkVITEmail, checkRole(['professor']), assignmentController.createAssignment);
router.get('/assignments', verifyToken, checkVITEmail, checkRole(['professor']), assignmentController.getAssignmentsByProfessor);
router.get('/assignments/:assignmentId', verifyToken, checkVITEmail, checkRole(['professor']), assignmentController.getAssignmentById);
router.put('/assignments/:assignmentId', verifyToken, checkVITEmail, checkRole(['professor']), assignmentController.updateAssignment);
router.delete('/assignments/:assignmentId', verifyToken, checkVITEmail, checkRole(['professor']), assignmentController.deleteAssignment);
router.patch('/assignments/:assignmentId/close', verifyToken, checkVITEmail, checkRole(['professor']), assignmentController.closeAssignment);

// Rubric routes
router.post('/rubrics', verifyToken, checkVITEmail, checkRole(['professor']), rubricController.createRubric);
router.get('/rubrics/assignment/:assignmentId', verifyToken, checkVITEmail, checkRole(['professor']), rubricController.getRubricByAssignment);
router.put('/rubrics/:rubricId', verifyToken, checkVITEmail, checkRole(['professor']), rubricController.updateRubric);

// Submission and evaluation routes
router.get('/submissions/assignment/:assignmentId', verifyToken, checkVITEmail, checkRole(['professor']), evaluationController.getSubmissionsByAssignment);
router.post('/evaluate', verifyToken, checkVITEmail, checkRole(['professor']), evaluationController.evaluateSubmission);
router.patch('/scores/:scoreId/override', verifyToken, checkVITEmail, checkRole(['professor']), evaluationController.overrideScore);
router.get('/scores/assignment/:assignmentId', verifyToken, checkVITEmail, checkRole(['professor']), evaluationController.getScoresByAssignment);

// ==================== OLLAMA AI EVALUATION ROUTES (100% FREE) ====================

// Auto-evaluate submission using Ollama (FREE!)
router.post('/ollama-evaluate', 
  verifyToken, 
  checkVITEmail, 
  checkRole(['professor']), 
  ollamaEvaluationController.autoEvaluateWithOllama
);

// Check Ollama health status
router.get('/ollama-health', 
  verifyToken, 
  checkVITEmail, 
  checkRole(['professor']), 
  ollamaEvaluationController.checkOllamaHealth
);

module.exports = router;

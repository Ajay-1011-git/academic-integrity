const { evaluateSubmissionWithOllama } = require('../services/ollamaEvaluationService');
const { getDocument, collections, queryDocuments } = require('../services/databaseService');

/**
 * Ollama AI Evaluation Controller
 * 100% FREE - No API keys needed!
 */

async function autoEvaluateWithOllama(req, res) {
  try {
    const professorId = req.user.uid;
    const { submissionId } = req.body;

    console.log(`Starting Ollama evaluation for submission: ${submissionId}`);

    // Get submission
    const submission = await getDocument(collections.SUBMISSIONS, submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Get assignment
    const assignment = await getDocument(collections.ASSIGNMENTS, submission.assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Verify professor owns this assignment
    if (assignment.professorId !== professorId) {
      return res.status(403).json({ 
        error: 'You can only evaluate submissions for your own assignments' 
      });
    }

    // Get rubric
    const rubrics = await queryDocuments(collections.RUBRICS, [
      { field: 'assignmentId', operator: '==', value: assignment.id }
    ]);

    if (rubrics.length === 0) {
      return res.status(404).json({ 
        error: 'No rubric found for this assignment. Please create a rubric first.' 
      });
    }

    const rubric = rubrics[0];

    // Prepare data for evaluation
    const submissionData = {
      text: submission.fileContent,
      criteria: rubric.criteria.map(c => ({
        name: c.name,
        description: c.description || '',
        maxPoints: c.maxPoints
      })),
      plagiarismWeightage: assignment.plagiarismWeightage,
      criteriaWeightage: assignment.criteriaWeightage
    };

    // Configuration
    const config = {
      ollamaModel: process.env.OLLAMA_MODEL || 'llama2' // Can use llama2, mistral, codellama, etc.
    };

    console.log(`Using Ollama model: ${config.ollamaModel}`);

    // Run Ollama evaluation
    const results = await evaluateSubmissionWithOllama(submissionData, config);

    // Format response
    const response = {
      success: true,
      submissionId,
      evaluation: {
        plagiarismScore: results.breakdown.plagiarismScore,
        criteriaScores: rubric.criteria.map((criterion, index) => {
          const aiScore = results.contentAnalysis?.criteriaScores[index];
          return {
            criterionId: criterion.criterionId,
            name: criterion.name,
            points: Math.round((aiScore?.score / 100) * criterion.maxPoints),
            maxPoints: criterion.maxPoints,
            aiScore: aiScore?.score,
            reasoning: aiScore?.reasoning
          };
        }),
        finalScore: results.finalScore,
        breakdown: results.breakdown,
        feedback: results.feedback
      },
      metadata: {
        plagiarismDetails: results.plagiarism?.details,
        plagiarismAnalysis: results.plagiarism?.analysis,
        strengths: results.contentAnalysis?.strengths || [],
        improvements: results.contentAnalysis?.improvements || [],
        evaluatedAt: results.timestamp,
        usingOllama: true,
        model: config.ollamaModel
      }
    };

    console.log('✅ Evaluation complete!');
    return res.status(200).json(response);

  } catch (error) {
    console.error('Ollama evaluation error:', error);
    
    // Provide helpful error messages
    let errorMessage = 'AI evaluation failed';
    let helpText = '';

    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      errorMessage = 'Ollama is not running';
      helpText = 'Please start Ollama: Run "ollama serve" in terminal';
    } else if (error.message.includes('model')) {
      errorMessage = 'Model not found';
      helpText = 'Please pull the model: Run "ollama pull llama2" in terminal';
    }

    return res.status(500).json({
      error: errorMessage,
      message: error.message,
      help: helpText,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Check if Ollama is running and which models are available
 */
async function checkOllamaHealth(req, res) {
  try {
    const { checkOllamaStatus } = require('../services/ollamaEvaluationService');
    const status = await checkOllamaStatus();

    return res.status(200).json({
      running: status.running,
      models: status.models.map(m => ({
        name: m.name,
        size: m.size,
        modified: m.modified_at
      })),
      message: status.running 
        ? 'Ollama is running and ready!' 
        : 'Ollama is not running. Start it with: ollama serve'
    });

  } catch (error) {
    return res.status(500).json({
      running: false,
      error: 'Failed to check Ollama status',
      message: error.message
    });
  }
}

module.exports = {
  autoEvaluateWithOllama,
  checkOllamaHealth
};

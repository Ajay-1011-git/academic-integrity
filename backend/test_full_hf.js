require('dotenv').config();
const { evaluateSubmissionWithHuggingFace } = require('./src/services/huggingFaceEvaluationService');

async function runFullTest() {
    console.log('Testing full evaluation...');
    const mockData = {
        text: 'This is a test submission demonstrating data structures like arrays and linked lists.',
        otherSubmissions: [],
        criteria: [
            { name: 'Content Quality', maxPoints: 10, description: 'Is the content accurate?' }
        ],
        plagiarismWeightage: 30,
        criteriaWeightage: 70
    };

    try {
        const result = await evaluateSubmissionWithHuggingFace(mockData);
        console.log('SUCCESS!');
        console.log(result.finalScore);
    } catch (error) {
        console.error('EVALUATION FAILED:');
        console.error(error.message);
    }
}

runFullTest();

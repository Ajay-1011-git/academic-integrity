require('dotenv').config();
const { checkHuggingFaceStatus } = require('./src/services/huggingFaceEvaluationService');

async function testMode() {
    console.log('Testing HuggingFace Connection...');
    const status = await checkHuggingFaceStatus();
    console.log(status);
}

testMode();

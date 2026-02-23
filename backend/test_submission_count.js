require('dotenv').config();
const { queryDocuments, collections } = require('./src/services/databaseService');

async function testQuery() {
    try {
        const professorId = "Ahm1w7b3b4g5d1r8"; // dummy just to see structure or grab everything

        // Let's just fetch all assignments first to get their IDs
        const assignments = await queryDocuments(collections.ASSIGNMENTS, []);
        console.log("Found assignments:", assignments.length);

        for (let i = 0; i < assignments.length; i++) {
            console.log(`\nAssignment [${assignments[i].id}] - ${assignments[i].title}:`);
            const subs = await queryDocuments(collections.SUBMISSIONS, [
                { field: 'assignmentId', operator: '==', value: assignments[i].id }
            ]);
            console.log(`  -> Submissions counted: ${subs.length}`);
        }
    } catch (e) {
        console.error(e);
    }
}

testQuery();

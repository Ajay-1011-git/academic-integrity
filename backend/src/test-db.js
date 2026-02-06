require('dotenv').config();
require('./config/firebase');

const { createDocument, getDocument, queryDocuments, collections } = require('./services/databaseService');

async function testDatabase() {
  console.log('Testing database operations...\n');
  
  try {
    console.log('1. Creating test assignment...');
    const assignment = await createDocument(collections.ASSIGNMENTS, {
      professorId: 'test_prof_123',
      professorName: 'Dr. Test',
      title: 'Test Assignment',
      description: 'This is a test',
      type: 'essay',
      allowedFileTypes: ['.txt', '.pdf'],
      dueDate: new Date('2025-02-15').toISOString(),
      maxScore: 10,
      plagiarismWeightage: 30,
      criteriaWeightage: 70,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log('✅ Assignment created:', assignment.id);
    
    console.log('\n2. Retrieving assignment...');
    const retrieved = await getDocument(collections.ASSIGNMENTS, assignment.id);
    console.log('✅ Assignment retrieved:', retrieved.title);
    
    console.log('\n3. Querying assignments by professor...');
    const results = await queryDocuments(collections.ASSIGNMENTS, [
      { field: 'professorId', operator: '==', value: 'test_prof_123' }
    ]);
    console.log(`✅ Found ${results.length} assignment(s)`);
    
    console.log('\n✅ All database tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testDatabase();
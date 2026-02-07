# Complete Workflow Test

## Scenario: Professor creates assignment, Student submits, Professor evaluates

### Step 1: Create Professor Account
POST /api/auth/signup
{
  "email": "prof@vit.ac.in",
  "password": "prof123",
  "fullName": "Dr. Kumar",
  "role": "professor"
}

### Step 2: Create Student Account
POST /api/auth/signup
{
  "email": "student@vitstudent.ac.in",
  "password": "student123",
  "fullName": "Rahul Sharma",
  "role": "student"
}

### Step 3: Professor Creates Assignment
POST /api/professor/assignments
Authorization: Bearer PROF_TOKEN
{
  "title": "Binary Trees Essay",
  "description": "Explain binary tree traversal",
  "type": "essay",
  "dueDate": "2025-12-31T23:59:59.000Z",
  "plagiarismWeightage": 30,
  "criteriaWeightage": 70
}
Save the assignmentId from response

### Step 4: Professor Creates Rubric
POST /api/professor/rubrics
Authorization: Bearer PROF_TOKEN
{
  "assignmentId": "YOUR_ASSIGNMENT_ID",
  "criteria": [
    { "name": "Content", "maxPoints": 50 },
    { "name": "Structure", "maxPoints": 30 },
    { "name": "Citations", "maxPoints": 20 }
  ]
}

### Step 5: Student Views Assignment
GET /api/student/assignments
Authorization: Bearer STUDENT_TOKEN

### Step 6: Student Saves Draft
POST /api/student/drafts
Authorization: Bearer STUDENT_TOKEN
{
  "assignmentId": "YOUR_ASSIGNMENT_ID",
  "content": "Draft: Binary trees are...",
  "autoSave": true
}

### Step 7: Student Submits Final
POST /api/student/submit
Authorization: Bearer STUDENT_TOKEN
{
  "assignmentId": "YOUR_ASSIGNMENT_ID",
  "fileName": "binary_trees.txt",
  "fileContent": "Binary trees are hierarchical structures...",
  "fileType": ".txt"
}
Save the submissionId from response

### Step 8: Professor Views Submissions
GET /api/professor/submissions/assignment/YOUR_ASSIGNMENT_ID
Authorization: Bearer PROF_TOKEN

### Step 9: Professor Evaluates
POST /api/professor/evaluate
Authorization: Bearer PROF_TOKEN
{
  "submissionId": "YOUR_SUBMISSION_ID",
  "plagiarismScore": 90,
  "criteriaScores": [
    { "criterionId": "crit_1", "name": "Content", "points": 45, "maxPoints": 50 },
    { "criterionId": "crit_2", "name": "Structure", "points": 28, "maxPoints": 30 },
    { "criterionId": "crit_3", "name": "Citations", "points": 18, "maxPoints": 20 }
  ],
  "feedback": "Great work!"
}

### Step 10: Student Views Score
GET /api/student/scores/assignment/YOUR_ASSIGNMENT_ID
Authorization: Bearer STUDENT_TOKEN

Expected Final Score:
- Plagiarism: 90% → 0.9 * 0.3 * 10 = 2.7
- Criteria: 91/100 → 0.91 * 0.7 * 10 = 6.37
- Total: 2.7 + 6.37 = 9.07/10
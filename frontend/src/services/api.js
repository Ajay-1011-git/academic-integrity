import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
};

export const professorAPI = {
  createAssignment: (data) => api.post('/api/professor/assignments', data),
  getAssignments: () => api.get('/api/professor/assignments'),
  getAssignmentById: (id) => api.get(`/api/professor/assignments/${id}`),
  updateAssignment: (id, data) => api.put(`/api/professor/assignments/${id}`, data),
  deleteAssignment: (id) => api.delete(`/api/professor/assignments/${id}`),
  closeAssignment: (id) => api.patch(`/api/professor/assignments/${id}/close`),
  
  createRubric: (data) => api.post('/api/professor/rubrics', data),
  getRubricByAssignment: (assignmentId) => api.get(`/api/professor/rubrics/assignment/${assignmentId}`),
  updateRubric: (id, data) => api.put(`/api/professor/rubrics/${id}`, data),
  
  getSubmissions: (assignmentId) => api.get(`/api/professor/submissions/assignment/${assignmentId}`),
  evaluateSubmission: (data) => api.post('/api/professor/evaluate', data),
  overrideScore: (scoreId, data) => api.patch(`/api/professor/scores/${scoreId}/override`, data),
  getScores: (assignmentId) => api.get(`/api/professor/scores/assignment/${assignmentId}`),

  // ==================== OLLAMA AI EVALUATION (100% FREE!) ====================
  
  /**
   * Auto-evaluate submission using Ollama (completely free!)
   * @param {string} submissionId - ID of the submission to evaluate
   * @returns {Promise} Evaluation results with scores and feedback
   */
  ollamaEvaluate: (submissionId) => api.post('/api/professor/ollama-evaluate', { submissionId }),

  /**
   * Check if Ollama is running and available
   * @returns {Promise} Ollama status and available models
   */
  checkOllamaHealth: () => api.get('/api/professor/ollama-health'),
};

export const studentAPI = {
  getAssignments: () => api.get('/api/student/assignments'),
  getAssignmentById: (id) => api.get(`/api/student/assignments/${id}`),
  
  submitAssignment: (data) => api.post('/api/student/submit', data),
  getSubmissions: () => api.get('/api/student/submissions'),
  getSubmissionById: (id) => api.get(`/api/student/submissions/${id}`),
  getSubmissionByAssignment: (assignmentId) => api.get(`/api/student/submissions/assignment/${assignmentId}`),
  
  saveDraft: (data) => api.post('/api/student/drafts', data),
  getAllDrafts: () => api.get('/api/student/drafts'),
  getDraftsByAssignment: (assignmentId) => api.get(`/api/student/drafts/assignment/${assignmentId}`),
  getLatestDraft: (assignmentId) => api.get(`/api/student/drafts/assignment/${assignmentId}/latest`),
  
  getScores: () => api.get('/api/student/scores'),
  getScoreByAssignment: (assignmentId) => api.get(`/api/student/scores/assignment/${assignmentId}`),
  getScoreById: (id) => api.get(`/api/student/scores/${id}`),
};

export default api;

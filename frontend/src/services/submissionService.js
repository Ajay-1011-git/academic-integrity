// frontend/src/services/submissionService.js
// Service for handling student submission operations

import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

/**
 * Get all submissions for a specific student
 * @param {string} studentId - The student's user ID
 * @returns {Promise<Array>} Array of submission objects
 */
export const getStudentSubmissions = async (studentId) => {
  try {
    if (!studentId) {
      throw new Error('Student ID is required');
    }

    const submissionsRef = collection(db, 'submissions');
    const q = query(
      submissionsRef, 
      where('studentId', '==', studentId),
      orderBy('submittedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    const submissions = await Promise.all(
      snapshot.docs.map(async (docSnapshot) => {
        const submissionData = docSnapshot.data();
        
        // Fetch related assignment details
        let assignmentTitle = 'Unknown Assignment';
        if (submissionData.assignmentId) {
          try {
            const assignmentDoc = await getDoc(doc(db, 'assignments', submissionData.assignmentId));
            if (assignmentDoc.exists()) {
              assignmentTitle = assignmentDoc.data().title;
            }
          } catch (err) {
            console.error('Error fetching assignment:', err);
          }
        }

        return {
          id: docSnapshot.id,
          ...submissionData,
          assignmentTitle,
          submittedAt: submissionData.submittedAt?.toDate?.() || new Date()
        };
      })
    );
    
    return submissions;
  } catch (error) {
    console.error('Error fetching student submissions:', error);
    throw new Error(`Failed to fetch submissions: ${error.message}`);
  }
};

/**
 * Get a specific submission by ID
 * @param {string} submissionId - The submission ID
 * @returns {Promise<Object>} Submission object with all details
 */
export const getSubmissionById = async (submissionId) => {
  try {
    if (!submissionId) {
      throw new Error('Submission ID is required');
    }

    const submissionRef = doc(db, 'submissions', submissionId);
    const snapshot = await getDoc(submissionRef);
    
    if (!snapshot.exists()) {
      throw new Error('Submission not found');
    }
    
    const submissionData = snapshot.data();
    
    // Fetch assignment details
    let assignment = null;
    if (submissionData.assignmentId) {
      const assignmentDoc = await getDoc(doc(db, 'assignments', submissionData.assignmentId));
      if (assignmentDoc.exists()) {
        assignment = {
          id: assignmentDoc.id,
          ...assignmentDoc.data()
        };
      }
    }

    // Fetch evaluation if exists
    let evaluation = null;
    if (submissionData.evaluationId) {
      const evaluationDoc = await getDoc(doc(db, 'evaluations', submissionData.evaluationId));
      if (evaluationDoc.exists()) {
        evaluation = {
          id: evaluationDoc.id,
          ...evaluationDoc.data()
        };
      }
    }
    
    return {
      id: snapshot.id,
      ...submissionData,
      assignment,
      evaluation,
      submittedAt: submissionData.submittedAt?.toDate?.() || new Date(),
      updatedAt: submissionData.updatedAt?.toDate?.()
    };
  } catch (error) {
    console.error('Error fetching submission:', error);
    throw new Error(`Failed to fetch submission: ${error.message}`);
  }
};

/**
 * Submit an assignment (create new submission)
 * @param {Object} submissionData - Submission data
 * @returns {Promise<string>} Created submission ID
 */
export const submitAssignment = async (submissionData) => {
  try {
    const {
      assignmentId,
      studentId,
      content,
      files = [],
      isDraft = false
    } = submissionData;

    if (!assignmentId || !studentId || !content) {
      throw new Error('Missing required fields');
    }

    const submissionsRef = collection(db, 'submissions');
    
    const docRef = await addDoc(submissionsRef, {
      assignmentId,
      studentId,
      content,
      files,
      status: isDraft ? 'draft' : 'submitted',
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      version: 1,
      previousDrafts: []
    });
    
    console.log('Submission created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting assignment:', error);
    throw new Error(`Failed to submit assignment: ${error.message}`);
  }
};

/**
 * Update a submission (for drafts or resubmission)
 * @param {string} submissionId - Submission ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateSubmission = async (submissionId, updates) => {
  try {
    if (!submissionId) {
      throw new Error('Submission ID is required');
    }

    const submissionRef = doc(db, 'submissions', submissionId);
    
    // Get current submission to preserve previous drafts
    const currentDoc = await getDoc(submissionRef);
    if (!currentDoc.exists()) {
      throw new Error('Submission not found');
    }

    const currentData = currentDoc.data();
    const previousDrafts = currentData.previousDrafts || [];
    
    // If updating content, save previous version to drafts
    if (updates.content && updates.content !== currentData.content) {
      previousDrafts.push({
        content: currentData.content,
        savedAt: new Date(),
        version: currentData.version || 1
      });
    }

    await updateDoc(submissionRef, {
      ...updates,
      previousDrafts,
      version: (currentData.version || 1) + 1,
      updatedAt: serverTimestamp()
    });
    
    console.log('Submission updated:', submissionId);
  } catch (error) {
    console.error('Error updating submission:', error);
    throw new Error(`Failed to update submission: ${error.message}`);
  }
};

/**
 * Get submissions for a specific assignment
 * @param {string} assignmentId - The assignment ID
 * @returns {Promise<Array>} Array of submissions
 */
export const getAssignmentSubmissions = async (assignmentId) => {
  try {
    if (!assignmentId) {
      throw new Error('Assignment ID is required');
    }

    const submissionsRef = collection(db, 'submissions');
    const q = query(
      submissionsRef, 
      where('assignmentId', '==', assignmentId),
      where('status', '==', 'submitted'),
      orderBy('submittedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate?.() || new Date()
    }));
  } catch (error) {
    console.error('Error fetching assignment submissions:', error);
    throw new Error(`Failed to fetch submissions: ${error.message}`);
  }
};

/**
 * Check if student has already submitted an assignment
 * @param {string} studentId - Student user ID
 * @param {string} assignmentId - Assignment ID
 * @returns {Promise<Object|null>} Existing submission or null
 */
export const checkExistingSubmission = async (studentId, assignmentId) => {
  try {
    const submissionsRef = collection(db, 'submissions');
    const q = query(
      submissionsRef,
      where('studentId', '==', studentId),
      where('assignmentId', '==', assignmentId)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error checking existing submission:', error);
    return null;
  }
};

/**
 * Save draft to blockchain (integration point)
 * @param {string} submissionId - Submission ID
 * @param {string} draftContent - Draft content
 * @returns {Promise<Object>} Blockchain transaction details
 */
export const saveDraftToBlockchain = async (submissionId, draftContent) => {
  try {
    // Call your backend API that handles blockchain interaction
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/blockchain/save-draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        submissionId,
        content: draftContent,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save draft to blockchain');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving draft to blockchain:', error);
    throw error;
  }
};

export default {
  getStudentSubmissions,
  getSubmissionById,
  submitAssignment,
  updateSubmission,
  getAssignmentSubmissions,
  checkExistingSubmission,
  saveDraftToBlockchain
};
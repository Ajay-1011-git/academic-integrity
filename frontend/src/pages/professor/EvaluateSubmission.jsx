import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { professorAPI, studentAPI } from '../../services/api';

export default function EvaluateSubmission() {
  const [submission, setSubmission] = useState(null);
  const [rubric, setRubric] = useState(null);
  const [plagiarismScore, setPlagiarismScore] = useState(0);
  const [criteriaScores, setCriteriaScores] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { submissionId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [submissionId]);

async function fetchData() {
  try {
    const submissionRes = await professorAPI.getSubmissions(submissionId);
    const submissions = submissionRes.data.submissions || [];
    
    const sub = submissions.find(s => s.id === submissionId);
    
    if (!sub) {
      setError('Submission not found');
      setLoading(false);
      return;
    }
    
    setSubmission(sub);

    const rubricRes = await professorAPI.getRubricByAssignment(sub.assignmentId);
    
    if (!rubricRes.data.rubric) {
      setError('No rubric found for this assignment. Please create a rubric first.');
      setLoading(false);
      return;
    }
    
    setRubric(rubricRes.data.rubric);

    const initialScores = rubricRes.data.rubric.criteria.map(c => ({
      criterionId: c.criterionId,
      name: c.name,
      points: 0,
      maxPoints: c.maxPoints
    }));
    setCriteriaScores(initialScores);
  } catch (err) {
    console.error('Fetch error:', err);
    setError('Failed to load submission or rubric. Make sure a rubric exists.');
  } finally {
    setLoading(false);
  }
}

  function updateCriteriaScore(index, points) {
    const updated = [...criteriaScores];
    updated[index].points = parseInt(points) || 0;
    setCriteriaScores(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await professorAPI.evaluateSubmission({
        submissionId,
        plagiarismScore,
        criteriaScores,
        feedback
      });
      navigate(`/professor/submissions/${submission.assignmentId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to evaluate submission');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!submission || !rubric) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-500">Submission or rubric not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <button
            onClick={() => navigate(`/professor/submissions/${submission.assignmentId}`)}
            className="text-indigo-600 hover:text-indigo-800"
          >
            ← Back to Submissions
          </button>
        </div>

        <div className="bg-white rounded-lg shadow px-8 py-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Evaluate Submission</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Student</p>
              <p className="font-medium">{submission.studentName}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{submission.studentEmail}</p>
            </div>
            <div>
              <p className="text-gray-500">File Name</p>
              <p className="font-medium">{submission.fileName}</p>
            </div>
            <div>
              <p className="text-gray-500">Submitted At</p>
              <p className="font-medium">{new Date(submission.submittedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow px-8 py-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Submission Content</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <pre className="whitespace-pre-wrap text-sm font-mono">{submission.fileContent}</pre>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow px-8 py-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Evaluation</h3>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plagiarism Score (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={plagiarismScore}
              onChange={(e) => setPlagiarismScore(parseInt(e.target.value) || 0)}
            />
            <p className="mt-1 text-xs text-gray-500">Higher score = Less plagiarism</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Criteria Scores
            </label>
            <div className="space-y-4">
              {criteriaScores.map((criterion, index) => (
                <div key={index} className="border border-gray-300 rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{criterion.name}</p>
                      <p className="text-sm text-gray-500">Max: {criterion.maxPoints} points</p>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={criterion.maxPoints}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={criterion.points}
                    onChange={(e) => updateCriteriaScore(index, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback
            </label>
            <textarea
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Optional feedback for the student"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/professor/submissions/${submission.assignmentId}`)}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Evaluation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
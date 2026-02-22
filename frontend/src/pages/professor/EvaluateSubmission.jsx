import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { professorAPI } from '../../services/api';

export default function EvaluateSubmissionAI() {
  const [submission, setSubmission] = useState(null);
  const [rubric, setRubric] = useState(null);
  const [plagiarismScore, setPlagiarismScore] = useState(0);
  const [criteriaScores, setCriteriaScores] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [finalScore, setFinalScore] = useState(0);
  const [assignment, setAssignment] = useState(null);
  
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchData();
  }, [submissionId]);

  async function fetchData() {
    try {
      if (location.state?.submission) {
        const sub = location.state.submission;
        setSubmission(sub);

        const assignmentRes = await professorAPI.getAssignmentById(sub.assignmentId);
        setAssignment(assignmentRes.data.assignment);

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
        setLoading(false);
        return;
      }

      setError('Submission data not found. Please navigate from submissions page.');
      setLoading(false);
      
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load submission or rubric. ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  }

  function calculateFinalScore(plagScore, criteriaScoresList, plagWeightage, criteriaWeightage) {
    const totalCriteriaPoints = criteriaScoresList.reduce((sum, score) => sum + score.points, 0);
    const totalCriteriaMaxPoints = criteriaScoresList.reduce((sum, score) => sum + score.maxPoints, 0);
    const plagiarismPercentage = plagScore / 100;
    const criteriaPercentage = totalCriteriaPoints / totalCriteriaMaxPoints;
    const weightedPlagiarismScore = plagiarismPercentage * (plagWeightage / 100) * 10;
    const weightedCriteriaScore = criteriaPercentage * (criteriaWeightage / 100) * 10;
    const final = weightedPlagiarismScore + weightedCriteriaScore;
    return {
      totalCriteriaPoints,
      totalCriteriaMaxPoints,
      weightedPlagiarismScore: parseFloat(weightedPlagiarismScore.toFixed(2)),
      weightedCriteriaScore: parseFloat(weightedCriteriaScore.toFixed(2)),
      finalScore: parseFloat(final.toFixed(2))
    };
  }

  useEffect(() => {
    if (assignment && criteriaScores.length > 0) {
      const result = calculateFinalScore(
        plagiarismScore,
        criteriaScores,
        assignment.plagiarismWeightage || 30,
        assignment.criteriaWeightage || 70
      );
      setFinalScore(result.finalScore);
    }
  }, [plagiarismScore, criteriaScores, assignment]);

  // ── Changed: calls aiEvaluate (HuggingFace) instead of ollamaEvaluate ──
  async function handleAutoEvaluate() {
    setEvaluating(true);
    setError('');

    try {
      console.log('🤖 Starting HuggingFace AI evaluation...');
      
      const response = await professorAPI.aiEvaluate(submissionId);
      
      if (response.data.success) {
        const { evaluation, metadata } = response.data;
        
        setPlagiarismScore(evaluation.plagiarismScore);
        setCriteriaScores(evaluation.criteriaScores);
        setFeedback(evaluation.feedback);
        
        setAiAnalysis({
          finalScore: evaluation.finalScore,
          breakdown: evaluation.breakdown,
          plagiarismDetails: metadata.plagiarismDetails,
          plagiarismAnalysis: metadata.plagiarismAnalysis,
          strengths: metadata.strengths,
          improvements: metadata.improvements,
          evaluatedAt: metadata.evaluatedAt,
          usingHuggingFace: metadata.usingHuggingFace,
          model: metadata.model
        });

        console.log('✅ HuggingFace evaluation complete!');
      } else {
        throw new Error('AI evaluation failed');
      }

    } catch (err) {
      console.error('HuggingFace evaluation error:', err);

      let errorMsg = 'AI evaluation failed';
      if (err.response?.data?.error === 'HuggingFace token not configured') {
        errorMsg = '🔴 HuggingFace token missing.\n\nAdd HUGGINGFACE_API_TOKEN to backend/.env and restart the server.';
      } else if (err.response?.data?.error === 'AI model is loading') {
        errorMsg = '⏳ Model is warming up. Wait 20 seconds and try again.';
      } else if (err.response?.data?.help) {
        errorMsg = `${err.response.data.error}\n\n${err.response.data.help}`;
      } else {
        errorMsg = err.response?.data?.message || err.message;
      }
      
      setError(errorMsg);
    } finally {
      setEvaluating(false);
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

  if (error && !submission) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/professor/dashboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go to Dashboard
          </button>
        </div>
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

        {/* Submission Header */}
        <div className="bg-white rounded-lg shadow px-8 py-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Evaluation</h2>
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

        {/* Submission Content with AI Button */}
        <div className="bg-white rounded-lg shadow px-8 py-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Submission Content</h3>

            {/* ── Changed: button text and colours (indigo instead of green) ── */}
            <button
              onClick={handleAutoEvaluate}
              disabled={evaluating}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2 shadow-lg transform transition hover:scale-105"
            >
              {evaluating ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing with HuggingFace AI...
                </>
              ) : (
                <>
                  <span className="text-xl">🤗</span>
                  Auto-Evaluate with HuggingFace AI
                </>
              )}
            </button>
          </div>
          <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto border border-gray-200">
            <pre className="whitespace-pre-wrap text-sm font-mono">{submission.fileContent}</pre>
          </div>
        </div>

        {/* AI Analysis Summary — same structure, updated labels */}
        {aiAnalysis && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-6 mb-6">
            <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🤗</span>
              HuggingFace AI Analysis Complete
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600">Plagiarism Score</p>
                <p className="text-2xl font-bold text-indigo-900">{plagiarismScore}/100</p>
                <p className="text-xs text-gray-500 mt-1">100 = fully original</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600">Content Quality</p>
                <p className="text-2xl font-bold text-purple-900">
                  {aiAnalysis.breakdown?.avgCriteriaScore?.toFixed(1) || '0'}/100
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600">AI Model</p>
                <p className="text-sm font-bold text-blue-900 break-all">{aiAnalysis.model || MODEL}</p>
                <p className="text-xs text-gray-500 mt-1">HuggingFace cloud</p>
              </div>
            </div>
            
            {aiAnalysis.plagiarismDetails && (
              <div className="mt-4 bg-blue-50 rounded p-3">
                <p className="font-semibold text-blue-900 mb-2">🔍 Plagiarism Analysis:</p>
                <p className="text-sm text-blue-800">{aiAnalysis.plagiarismDetails}</p>
              </div>
            )}
            
            {aiAnalysis.strengths?.length > 0 && (
              <div className="mt-4 bg-green-50 rounded p-3">
                <p className="font-semibold text-green-900 mb-2">✅ Strengths:</p>
                <ul className="text-sm text-green-800 space-y-1">
                  {aiAnalysis.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
            )}
            
            {aiAnalysis.improvements?.length > 0 && (
              <div className="mt-3 bg-yellow-50 rounded p-3">
                <p className="font-semibold text-yellow-900 mb-2">📈 Areas for Improvement:</p>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {aiAnalysis.improvements.map((item, idx) => <li key={idx}>• {item}</li>)}
                </ul>
              </div>
            )}

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              <span>Evaluated using HuggingFace cloud AI</span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-4 mb-4">
            <pre className="text-sm text-red-800 whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {/* Final score display — unchanged */}
        {assignment && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg px-8 py-6 mb-6 text-white">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Final Score</h3>
              <div className="flex items-center justify-center gap-4">
                <div className="text-6xl font-bold">{finalScore.toFixed(2)}</div>
                <div className="text-3xl font-light">/ 10</div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-white/80 text-xs">Plagiarism Component</p>
                  <p className="text-lg font-semibold">
                    {((plagiarismScore / 100) * (assignment.plagiarismWeightage / 100) * 10).toFixed(2)}
                  </p>
                  <p className="text-xs text-white/70">{assignment.plagiarismWeightage}% weight</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-white/80 text-xs">Criteria Component</p>
                  <p className="text-lg font-semibold">
                    {criteriaScores.length > 0
                      ? ((criteriaScores.reduce((sum, s) => sum + s.points, 0) /
                          criteriaScores.reduce((sum, s) => sum + s.maxPoints, 0)) *
                          (assignment.criteriaWeightage / 100) * 10).toFixed(2)
                      : '0.00'}
                  </p>
                  <p className="text-xs text-white/70">{assignment.criteriaWeightage}% weight</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-center items-center gap-2">
                  <span className="text-2xl">
                    {finalScore >= 9 ? '🌟' : finalScore >= 7 ? '✨' : finalScore >= 5 ? '👍' : finalScore >= 3 ? '📝' : '⚠️'}
                  </span>
                  <span className="font-semibold">
                    {finalScore >= 9 ? 'Excellent' : finalScore >= 7 ? 'Good' : finalScore >= 5 ? 'Satisfactory' : finalScore >= 3 ? 'Needs Improvement' : 'Poor'}
                  </span>
                </div>
                <div className="mt-3 w-full bg-white/30 rounded-full h-3">
                  <div
                    className="bg-white rounded-full h-3 transition-all duration-500"
                    style={{ width: `${(finalScore / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Evaluation form — unchanged */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow px-8 py-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Evaluation Scores</h3>
          <p className="text-sm text-gray-600 mb-4">
            AI has analyzed the submission. Review and adjust scores manually if needed.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plagiarism Score (0-100)
            </label>
            <input
              type="number" min="0" max="100" required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              value={plagiarismScore}
              onChange={(e) => setPlagiarismScore(parseInt(e.target.value) || 0)}
            />
            <p className="mt-1 text-xs text-gray-500">Higher = more original (100 = 0% plagiarism, 0 = 100% plagiarism)</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Criteria Scores</label>
            <div className="space-y-4">
              {criteriaScores.map((criterion, index) => (
                <div key={index} className="border border-gray-300 rounded-md p-4 hover:border-indigo-400 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{criterion.name}</p>
                      <p className="text-sm text-gray-500">Max: {criterion.maxPoints} points</p>
                    </div>
                    <span className="text-lg font-bold text-indigo-600">
                      {criterion.points}/{criterion.maxPoints}
                    </span>
                  </div>
                  <input
                    type="number" min="0" max={criterion.maxPoints} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    value={criterion.points}
                    onChange={(e) => updateCriteriaScore(index, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
            <textarea
              rows="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="AI-generated feedback (you can edit this)"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/professor/submissions/${submission.assignmentId}`)}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || plagiarismScore === 0}
              className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              {submitting ? 'Submitting...' : 'Submit Final Evaluation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

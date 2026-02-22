import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';

export default function ViewSubmission() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [score,      setScore]      = useState(null); // null = not yet evaluated
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  async function fetchData() {
    try {
      setLoading(true);
      setError('');

      const [assignmentRes, submissionRes] = await Promise.all([
        studentAPI.getAssignmentById(assignmentId),
        studentAPI.getSubmissionByAssignment(assignmentId),
      ]);

      // exact response shapes from your controllers:
      // getAssignmentById   → { assignment: {...} }
      // getSubmissionByAssignment → { submission: {...} }
      setAssignment(assignmentRes.data.assignment);
      setSubmission(submissionRes.data.submission);

      // getScoreByAssignment → { score: {...} } or 404 — catch silently
      try {
        const scoreRes = await studentAPI.getScoreByAssignment(assignmentId);
        setScore(scoreRes.data.score);
      } catch {
        setScore(null); // not evaluated yet — that's fine
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load submission details.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  // plagiarismScore: 100 = fully original, 0 = fully plagiarised
  // We show it as "X% plagiarism detected" = 100 - score
  function plagiarismBadge(ps) {
    if (ps == null) return <span className="text-gray-400 text-sm">Not checked</span>;
    const detected = 100 - Number(ps);
    if (detected <= 20) return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{detected}% detected</span>;
    if (detected <= 50) return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">{detected}% detected</span>;
    return                     <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">{detected}% detected</span>;
  }

  function finalScoreColor(s) {
    if (s >= 8) return 'text-green-600';
    if (s >= 6) return 'text-indigo-600';
    if (s >= 4) return 'text-yellow-600';
    return 'text-red-600';
  }

  function scoreLabel(s) {
    if (s >= 9) return '🌟 Excellent';
    if (s >= 7) return '✨ Good';
    if (s >= 5) return '👍 Satisfactory';
    if (s >= 3) return '📝 Needs Improvement';
    return '⚠️ Poor';
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ── Navbar — same structure as Dashboard.jsx and Scores.jsx ── */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">VIT Academic Integrity</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{userProfile?.fullName}</span>
              <button
                onClick={() => navigate('/student/scores')}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                My Scores
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">

          {/* Back button */}
          <button
            onClick={() => navigate('/student/dashboard')}
            className="mb-6 text-sm text-indigo-600 hover:text-indigo-800"
          >
            ← Back to Dashboard
          </button>

          {/* ── Loading ── */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading submission...</p>
            </div>
          )}

          {/* ── Error ── */}
          {!loading && error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={fetchData}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* ── Main content ── */}
          {!loading && !error && submission && (
            <div className="space-y-6">

              {/* ── Card 1: Assignment info ── */}
              <div className="bg-white rounded-lg shadow px-6 py-5">
                <h2 className="text-2xl font-bold text-gray-900">
                  {assignment?.title ?? 'Assignment'}
                </h2>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                  {assignment?.type && (
                    <span>Type: <strong className="text-gray-900">{assignment.type}</strong></span>
                  )}
                  {assignment?.dueDate && (
                    <span>
                      Due:{' '}
                      <strong className={new Date(assignment.dueDate) < new Date() ? 'text-red-600' : 'text-gray-900'}>
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </strong>
                    </span>
                  )}
                </div>
                {assignment?.description && (
                  <p className="mt-3 text-sm text-gray-600">{assignment.description}</p>
                )}
              </div>

              {/* ── Card 2: Submission details ── */}
              <div className="bg-white rounded-lg shadow px-6 py-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Submission</h3>

                <div className="grid grid-cols-2 gap-4 text-sm mb-5">
                  <div>
                    <p className="text-gray-500">File name</p>
                    <p className="font-medium text-gray-900">{submission.fileName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Submitted at</p>
                    <p className="font-medium text-gray-900">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Submission type</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {submission.submissionType ?? 'direct'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Blockchain verified</p>
                    {submission.blockchainVerified
                      ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">✓ Verified</span>
                      : <span className="text-gray-400 text-sm">No</span>
                    }
                  </div>
                </div>

                {/* Submitted content */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Content</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4 max-h-72 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
                      {submission.fileContent}
                    </pre>
                  </div>
                </div>
              </div>

              {/* ── Card 3a: Evaluated ── */}
              {score && (
                <div className="bg-white rounded-lg shadow px-6 py-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-5">Evaluation Results</h3>

                  {/* Top summary row */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 mb-6 text-white text-center">
                    <p className="text-sm text-white/80 mb-1">Final Score</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className={`text-6xl font-bold ${finalScoreColor(score.finalScore)} brightness-0 invert`}>
                        {score.finalScore}
                      </span>
                      <span className="text-3xl font-light">/ 10</span>
                    </div>
                    <p className="mt-2 text-lg">{scoreLabel(score.finalScore)}</p>
                    {/* Progress bar */}
                    <div className="mt-3 w-full bg-white/30 rounded-full h-3">
                      <div
                        className="bg-white rounded-full h-3 transition-all duration-500"
                        style={{ width: `${(score.finalScore / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                    <div className="border border-gray-200 rounded-md p-3 text-center">
                      <p className="text-gray-500 text-xs mb-1">Plagiarism</p>
                      {plagiarismBadge(score.plagiarismScore)}
                    </div>
                    <div className="border border-gray-200 rounded-md p-3 text-center">
                      <p className="text-gray-500 text-xs mb-1">Criteria score</p>
                      <p className="font-semibold text-gray-900">
                        {score.totalCriteriaPoints} / {score.totalCriteriaMaxPoints}
                      </p>
                    </div>
                    <div className="border border-gray-200 rounded-md p-3 text-center">
                      <p className="text-gray-500 text-xs mb-1">Evaluated by</p>
                      <p className="font-medium text-gray-900 text-xs">
                        {score.evaluatedByName ?? score.evaluatedBy ?? '—'}
                      </p>
                    </div>
                  </div>

                  {/* Per-criterion breakdown */}
                  {score.criteriaScores?.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-700 mb-3">Criteria Breakdown</p>
                      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criterion</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {score.criteriaScores.map((c, i) => (
                              <tr key={c.criterionId ?? i}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.name}</td>
                                <td className="px-4 py-3 text-sm text-indigo-600 font-semibold whitespace-nowrap">
                                  {c.points} / {c.maxPoints}
                                </td>
                                <td className="px-4 py-3 w-40">
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-indigo-600 h-2 rounded-full"
                                      style={{ width: `${Math.min(100, (c.points / c.maxPoints) * 100)}%` }}
                                    />
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {score.feedback && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Feedback</p>
                      <div className="rounded-md bg-gray-50 border border-gray-200 p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{score.feedback}</p>
                      </div>
                    </div>
                  )}

                  {/* Override notice */}
                  {score.overridden && (
                    <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Score was manually adjusted by the professor.
                        {score.overrideReason && <> Reason: <em>{score.overrideReason}</em></>}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Card 3b: Not yet evaluated ── */}
              {!score && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <p className="text-4xl mb-3">⏳</p>
                  <p className="text-lg font-semibold text-gray-900">Not Evaluated Yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Your submission is pending evaluation. Check back later.
                  </p>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

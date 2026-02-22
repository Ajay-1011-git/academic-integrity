import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';

export default function SubmitAssignment() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [fileName, setFileName] = useState('submission.txt');
  const [fileContent, setFileContent] = useState('');
  const [fileType, setFileType] = useState('.txt');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, [assignmentId]);

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      // Load assignment details
      const assignRes = await studentAPI.getAssignmentById(assignmentId);
      setAssignment(assignRes.data.assignment || assignRes.data);

      // Check if already submitted
      try {
        await studentAPI.getSubmissionByAssignment(assignmentId);
        setAlreadySubmitted(true);
      } catch {
        // No submission yet — good to go
      }

      // Load latest draft if exists
      try {
        const draftRes = await studentAPI.getLatestDraft(assignmentId);
        const draft = draftRes.data.draft;
        if (draft?.content) {
          setFileContent(draft.content);
          if (draft.fileName) setFileName(draft.fileName);
          setDraftSavedAt(draft.updatedAt || draft.createdAt);
        }
      } catch {
        // No draft yet — fine
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.substring(file.name.lastIndexOf('.'));
    setFileName(file.name);
    setFileType(ext);

    const reader = new FileReader();
    reader.onload = (ev) => setFileContent(ev.target.result);
    reader.readAsText(file);
  }

  async function handleSaveDraft() {
    if (!fileContent.trim()) {
      setError('Please enter some content before saving a draft');
      return;
    }
    try {
      setSavingDraft(true);
      setError('');
      await studentAPI.saveDraft({
        assignmentId,
        content: fileContent,
        fileName
      });
      setDraftSavedAt(new Date().toISOString());
      setSuccess('Draft saved!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save draft');
    } finally {
      setSavingDraft(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fileContent.trim()) {
      setError('Please enter your submission content or upload a file');
      return;
    }

    const confirmed = window.confirm(
      'Once submitted, you cannot change your submission. Are you sure?'
    );
    if (!confirmed) return;

    try {
      setSubmitting(true);
      setError('');

      await studentAPI.submitAssignment({
        assignmentId,
        fileName,
        fileContent,
        fileType,
        submissionType: 'direct'
      });

      navigate(`/student/assignments/${assignmentId}/view`);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit assignment');
      setSubmitting(false);
    }
  }

  function isOverdue() {
    if (!assignment?.dueDate) return false;
    return new Date() > new Date(assignment.dueDate);
  }

  function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading assignment...</p>
        </div>
      </div>
    );
  }

  // ── Already submitted ────────────────────────────────────────────────────────
  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Already Submitted</h2>
          <p className="text-gray-500 text-sm mb-6">
            You have already submitted this assignment. You cannot resubmit.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(`/student/assignments/${assignmentId}/view`)}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              View Submission
            </button>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate('/student/dashboard')}
          className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-5"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Assignment Info */}
        {assignment && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{assignment.title}</h1>
                {assignment.description && (
                  <p className="text-gray-500 text-sm mt-1">{assignment.description}</p>
                )}
              </div>
              <span className={`ml-4 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                isOverdue()
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {isOverdue() ? 'Overdue' : 'Open'}
              </span>
            </div>
            <div className="mt-3 flex gap-5 text-xs text-gray-500">
              <span>Due: <span className="font-medium text-gray-700">{formatDate(assignment.dueDate)}</span></span>
              {assignment.allowedFileTypes?.length > 0 && (
                <span>Allowed: <span className="font-medium text-gray-700">{assignment.allowedFileTypes.join(', ')}</span></span>
              )}
            </div>
          </div>
        )}

        {/* Overdue warning */}
        {isOverdue() && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm text-red-700">
            ⚠ The deadline for this assignment has passed. Submission may be rejected.
          </div>
        )}

        {/* Error / Success */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Submission Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Your Submission</h2>

            {/* Upload file OR type */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Upload File</label>
                <span className="text-xs text-gray-400">or type directly below</span>
              </div>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <svg className="w-7 h-7 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-500">
                  {fileName !== 'submission.txt' ? (
                    <span className="text-blue-600 font-medium">{fileName}</span>
                  ) : (
                    <>Click to upload <span className="text-blue-600">a file</span></>
                  )}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.doc,.docx,.py,.js,.java,.cpp,.c,.cs,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Text area */}
            <div className="mb-1">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Content
                {draftSavedAt && (
                  <span className="ml-2 text-xs text-gray-400 font-normal">
                    Draft saved {formatDate(draftSavedAt)}
                  </span>
                )}
              </label>
              <textarea
                value={fileContent}
                onChange={e => setFileContent(e.target.value)}
                placeholder="Type or paste your submission here..."
                rows={14}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
              <p className="text-xs text-gray-400 mt-1">
                {fileContent.trim().split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={savingDraft || submitting}
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {savingDraft ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="submit"
              disabled={submitting || savingDraft || isOverdue()}
              className="flex-2 py-2.5 px-8 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>

          {isOverdue() && (
            <p className="text-xs text-red-500 text-center mt-2">
              Submission is disabled — deadline has passed.
            </p>
          )}
        </form>

      </div>
    </div>
  );
}

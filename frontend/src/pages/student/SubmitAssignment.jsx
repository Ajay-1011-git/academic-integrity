import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';

export default function SubmitAssignment() {
  const [assignment, setAssignment] = useState(null);
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignment();
    fetchLatestDraft();
  }, [assignmentId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (content && !loading) {
        saveDraft(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [content]);

  async function fetchAssignment() {
    try {
      const response = await studentAPI.getAssignmentById(assignmentId);
      setAssignment(response.data.assignment);
    } catch (err) {
      setError('Failed to load assignment');
    }
  }

  async function fetchLatestDraft() {
    try {
      const response = await studentAPI.getLatestDraft(assignmentId);
      if (response.data.draft) {
        setContent(response.data.draft.content);
      }
    } catch (err) {
      console.log('No draft found');
    }
  }

  async function saveDraft(auto = false) {
    if (!content) return;

    setAutoSaving(true);
    try {
      await studentAPI.saveDraft({
        assignmentId,
        content,
        autoSave: auto
      });
    } catch (err) {
      console.error('Failed to save draft');
    } finally {
      setAutoSaving(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!fileName) {
      setError('Please enter a file name');
      return;
    }

    if (!content) {
      setError('Please enter content');
      return;
    }

    setLoading(true);

    try {
      await studentAPI.submitAssignment({
        assignmentId,
        fileName,
        fileContent: content,
        fileType: assignment?.type === 'code' ? '.txt' : '.txt'
      });
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit assignment');
    } finally {
      setLoading(false);
    }
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow px-8 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{assignment.title}</h2>
            <p className="mt-2 text-sm text-gray-600">{assignment.description}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Due: {new Date(assignment.dueDate).toLocaleString()}
              </span>
              {autoSaving && (
                <span className="text-green-600">Auto-saving draft...</span>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">File Name</label>
              <input
                type="text"
                required
                placeholder="e.g., assignment.txt"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                required
                rows="15"
                placeholder="Enter your assignment content here..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/student/dashboard')}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => saveDraft(false)}
                disabled={autoSaving || !content}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Final'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
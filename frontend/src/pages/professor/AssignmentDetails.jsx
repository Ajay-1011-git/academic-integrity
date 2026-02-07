import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { professorAPI } from '../../services/api';

export default function AssignmentDetails() {
  const [assignment, setAssignment] = useState(null);
  const [rubric, setRubric] = useState(null);
  const [showRubricForm, setShowRubricForm] = useState(false);
  const [criteria, setCriteria] = useState([{ name: '', description: '', maxPoints: 0 }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  async function fetchData() {
    try {
      const assignmentRes = await professorAPI.getAssignmentById(assignmentId);
      setAssignment(assignmentRes.data.assignment);

      try {
        const rubricRes = await professorAPI.getRubricByAssignment(assignmentId);
        setRubric(rubricRes.data.rubric);
      } catch (err) {
        console.log('No rubric found');
      }
    } catch (err) {
      setError('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  }

  function addCriterion() {
    setCriteria([...criteria, { name: '', description: '', maxPoints: 0 }]);
  }

  function updateCriterion(index, field, value) {
    const updated = [...criteria];
    updated[index][field] = field === 'maxPoints' ? parseInt(value) || 0 : value;
    setCriteria(updated);
  }

  function removeCriterion(index) {
    setCriteria(criteria.filter((_, i) => i !== index));
  }

  async function handleCreateRubric(e) {
    e.preventDefault();
    setError('');

    const totalPoints = criteria.reduce((sum, c) => sum + c.maxPoints, 0);
    if (totalPoints !== 100) {
      setError('Total criteria points must equal 100');
      return;
    }

    try {
      await professorAPI.createRubric({ assignmentId, criteria });
      await fetchData();
      setShowRubricForm(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create rubric');
    }
  }

  async function handleCloseAssignment() {
    if (window.confirm('Are you sure you want to close this assignment?')) {
      try {
        await professorAPI.closeAssignment(assignmentId);
        await fetchData();
      } catch (err) {
        setError('Failed to close assignment');
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-500">Assignment not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <button
            onClick={() => navigate('/professor/dashboard')}
            className="text-indigo-600 hover:text-indigo-800"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow px-8 py-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{assignment.title}</h2>
              <p className="mt-2 text-sm text-gray-600">{assignment.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${assignment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {assignment.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">{assignment.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="font-medium">{new Date(assignment.dueDate).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Plagiarism Weightage</p>
              <p className="font-medium">{assignment.plagiarismWeightage}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Criteria Weightage</p>
              <p className="font-medium">{assignment.criteriaWeightage}%</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => navigate(`/professor/submissions/${assignmentId}`)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              View Submissions
            </button>
            {assignment.status === 'active' && (
              <button
                onClick={handleCloseAssignment}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Close Assignment
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow px-8 py-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Evaluation Rubric</h3>

          {rubric ? (
            <div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criterion</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rubric.criteria.map((criterion, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{criterion.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{criterion.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{criterion.maxPoints}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="2" className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">{rubric.totalPoints}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : showRubricForm ? (
            <form onSubmit={handleCreateRubric} className="space-y-4">
              {criteria.map((criterion, index) => (
                <div key={index} className="border border-gray-300 rounded-md p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">Criterion {index + 1}</h4>
                    {criteria.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCriterion(index)}
                        className="text-red-600 text-sm hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={criterion.name}
                      onChange={(e) => updateCriterion(index, 'name', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={criterion.description}
                      onChange={(e) => updateCriterion(index, 'description', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Max Points"
                      required
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={criterion.maxPoints}
                      onChange={(e) => updateCriterion(index, 'maxPoints', e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={addCriterion}
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  + Add Criterion
                </button>
                <span className="text-sm text-gray-600">
                  Total: {criteria.reduce((sum, c) => sum + c.maxPoints, 0)}/100
                </span>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowRubricForm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Rubric
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">No rubric created yet</p>
              <button
                onClick={() => setShowRubricForm(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create Rubric
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
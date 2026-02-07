import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { professorAPI } from '../../services/api';

export default function ProfessorDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    try {
      const response = await professorAPI.getAssignments();
      setAssignments(response.data.assignments);
    } catch (err) {
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">VIT Academic Integrity</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Prof. {userProfile?.fullName}</span>
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

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Assignments</h2>
            <button
              onClick={() => navigate('/professor/assignments/create')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Create Assignment
            </button>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading assignments...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No assignments created yet</p>
              <button
                onClick={() => navigate('/professor/assignments/create')}
                className="mt-4 text-indigo-600 hover:text-indigo-800"
              >
                Create your first assignment
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {assignment.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {assignment.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-500">
                      Type: <span className="font-medium text-gray-900">{assignment.type}</span>
                    </p>
                    <p className="text-gray-500">
                      Due: <span className="font-medium text-gray-900">
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="text-gray-500">
                      Status: <span className={`font-medium ${assignment.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                        {assignment.status}
                      </span>
                    </p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => {
                        console.log('Navigating to:', `/professor/assignments/${assignment.id}`);
                        navigate(`/professor/assignments/${assignment.id}`);
                      }}
                      className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/professor/submissions/${assignment.id}`)}
                      className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                    >
                      Submissions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { professorAPI } from '../../services/api';

export default function CreateAssignment() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'essay',
    dueDate: '',
    plagiarismWeightage: 30,
    criteriaWeightage: 70
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Weightage') ? parseInt(value) : value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (formData.plagiarismWeightage + formData.criteriaWeightage !== 100) {
      setError('Weightages must sum to 100');
      return;
    }

    setLoading(true);

    try {
      await professorAPI.createAssignment(formData);
      navigate('/professor/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow px-8 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create Assignment</h2>
            <p className="mt-1 text-sm text-gray-600">Fill in the assignment details</p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                required
                rows="4"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                name="type"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="essay">Essay</option>
                <option value="code">Code</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="datetime-local"
                name="dueDate"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Plagiarism Weightage (%)
                </label>
                <input
                  type="number"
                  name="plagiarismWeightage"
                  min="0"
                  max="100"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.plagiarismWeightage}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Criteria Weightage (%)
                </label>
                <input
                  type="number"
                  name="criteriaWeightage"
                  min="0"
                  max="100"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.criteriaWeightage}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/professor/dashboard')}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Assignment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
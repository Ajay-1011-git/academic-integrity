import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { submitToBlockchain, connectWallet, getWalletAddress } from '../../services/blockchain';

export default function SubmitAssignment() {
  const [assignment, setAssignment] = useState(null);
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [submittingBlockchain, setSubmittingBlockchain] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignment();
    fetchLatestDraft();
    checkWalletConnection();
  }, [assignmentId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (content && !loading) {
        saveDraft(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [content]);

  async function checkWalletConnection() {
    const address = getWalletAddress();
    if (address) {
      setWalletConnected(true);
      setWalletAddress(address);
    }
  }

  async function fetchAssignment() {
    try {
      const response = await studentAPI.getAssignmentById(assignmentId);
      console.log('📋 Assignment loaded:', response.data.assignment);
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

  // ============================================================================
  // DIRECT SUBMISSION - No blockchain, no fees
  // ============================================================================
  async function handleDirectSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
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
      const submissionData = {
        assignmentId,
        fileName,
        fileContent: content,
        fileType: '.txt',
        submissionType: 'direct'
      };

      console.log('📤 Sending direct submission:', submissionData);

      const response = await studentAPI.submitAssignment(submissionData);
      
      console.log('✅ Submission successful:', response);
      
      alert('✅ Assignment submitted successfully (Direct mode - No blockchain fees)');
      navigate('/student/dashboard');
    } catch (err) {
      // DETAILED ERROR LOGGING
      console.error('❌ SUBMISSION ERROR - Full error:', err);
      console.error('❌ SUBMISSION ERROR - Response:', err.response);
      console.error('❌ SUBMISSION ERROR - Data:', err.response?.data);
      console.error('❌ SUBMISSION ERROR - Error message:', err.response?.data?.error);
      console.error('❌ SUBMISSION ERROR - Details:', err.response?.data?.details);
      console.error('❌ SUBMISSION ERROR - Message:', err.response?.data?.message);
      
      // Show detailed error to user
      const errorMessage = err.response?.data?.error 
        || err.response?.data?.message 
        || JSON.stringify(err.response?.data?.details)
        || err.message 
        || 'Failed to submit assignment';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // ============================================================================
  // BLOCKCHAIN SUBMISSION - Uses Web3
  // ============================================================================
  async function handleBlockchainSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    setError('');

    if (!fileName) {
      setError('Please enter a file name');
      return;
    }

    if (!content) {
      setError('Please enter content');
      return;
    }

    setSubmittingBlockchain(true);

    try {
      // Step 1: Connect wallet if not connected
      if (!walletConnected) {
        console.log('🔗 Connecting wallet...');
        const address = await connectWallet();
        setWalletAddress(address);
        setWalletConnected(true);
        console.log('✅ Wallet connected:', address);
      }

      // Step 2: Submit to blockchain
      console.log('⛓️ Submitting to blockchain...');
      const blockchainResult = await submitToBlockchain({
        assignmentId,
        fileName,
        fileContent: content,
        studentAddress: walletAddress
      });
      console.log('✅ Blockchain transaction:', blockchainResult);

      // Step 3: Submit to backend with blockchain hash
      const submissionData = {
        assignmentId,
        fileName,
        fileContent: content,
        fileType: '.txt',
        submissionType: 'blockchain',
        blockchainTxHash: blockchainResult.txHash
      };

      console.log('📤 Sending blockchain submission to backend:', submissionData);

      const response = await studentAPI.submitAssignment(submissionData);
      
      console.log('✅ Backend submission successful:', response);

      alert('✅ Assignment submitted successfully with blockchain verification!');
      navigate('/student/dashboard');
    } catch (err) {
      console.error('❌ BLOCKCHAIN ERROR:', err);
      console.error('❌ BLOCKCHAIN ERROR - Response:', err.response);
      console.error('❌ BLOCKCHAIN ERROR - Data:', err.response?.data);
      
      if (err.message.includes('MetaMask')) {
        setError('MetaMask not installed. Please use Direct Submit or install MetaMask.');
      } else if (err.message.includes('rejected')) {
        setError('Transaction rejected. You can use Direct Submit instead.');
      } else {
        const errorMessage = err.response?.data?.error 
          || err.response?.data?.message 
          || err.message 
          || 'Failed to submit to blockchain';
        setError(errorMessage);
      }
    } finally {
      setSubmittingBlockchain(false);
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

            {/* Wallet Status */}
            {walletConnected && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">
                  Wallet: {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4 border border-red-200">
              <p className="text-sm text-red-800 font-semibold">Error:</p>
              <p className="text-sm text-red-800 mt-1">{error}</p>
              <p className="text-xs text-red-600 mt-2">💡 Check browser console (F12) for detailed error logs</p>
            </div>
          )}

          <form className="space-y-6">
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

            {/* Submission Mode Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Choose Submission Method:</h4>
              <div className="text-xs text-blue-800 space-y-1">
                <p>✅ <strong>Direct Submit:</strong> Fast, free, no blockchain fees (Recommended for demo)</p>
                <p>🔗 <strong>Blockchain Submit:</strong> Permanent proof on blockchain (Requires MetaMask & gas fees)</p>
              </div>
            </div>

            <div className="flex space-x-3">
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
                {autoSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                type="button"
                onClick={handleDirectSubmit}
                disabled={loading || submittingBlockchain || !fileName || !content}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  '✅ Submit Direct (FREE)'
                )}
              </button>
              <button
                type="button"
                onClick={handleBlockchainSubmit}
                disabled={loading || submittingBlockchain || !fileName || !content}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingBlockchain ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Blockchain...
                  </span>
                ) : (
                  '🔗 Submit Blockchain'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

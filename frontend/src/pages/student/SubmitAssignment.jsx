import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import blockchainService from '../../services/blockchain';

export default function SubmitAssignment() {
  const [assignment, setAssignment] = useState(null);
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [blockchainStatus, setBlockchainStatus] = useState('');
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignment();
    fetchLatestDraft();
    checkWalletConnection();
  }, [assignmentId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (content && !loading && walletConnected) {
        saveDraft(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [content]);

  async function checkWalletConnection() {
    try {
      if (blockchainService.isConnected()) {
        setWalletConnected(true);
        setWalletAddress(blockchainService.getAddress());
      }
    } catch (error) {
      console.log('Wallet not connected');
    }
  }

  async function connectWallet() {
    try {
      setBlockchainStatus('Connecting wallet...');
      const address = await blockchainService.connectWallet();
      setWalletConnected(true);
      setWalletAddress(address);
      setBlockchainStatus('Wallet connected!');
      setTimeout(() => setBlockchainStatus(''), 2000);
    } catch (error) {
      setError(error.message);
      setBlockchainStatus('');
    }
  }

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
  let blockchainData = {};

  try {
    if (walletConnected) {
      setBlockchainStatus('Recording on blockchain...');
      
      // Browser-compatible SHA-256 hashing
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const txData = await blockchainService.recordSubmission(
        assignmentId,
        walletAddress,
        contentHash,
        false
      );

      blockchainData = {
        blockchainTxHash: txData.transactionHash,
        blockchainVersion: txData.version
      };

      setBlockchainStatus('✓ Recorded on blockchain');
      setTimeout(() => setBlockchainStatus(''), 2000);
    }

    await studentAPI.saveDraft({
      assignmentId,
      content,
      autoSave: auto,
      ...blockchainData
    });
  } catch (err) {
    console.error('Failed to save draft:', err);
    setBlockchainStatus('');
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

  if (!walletConnected) {
    setError('Please connect your wallet to submit');
    return;
  }

  setLoading(true);

  try {
    setBlockchainStatus('Recording final submission on blockchain...');
    
    // Browser-compatible SHA-256 hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    const txData = await blockchainService.recordSubmission(
      assignmentId,
      walletAddress,
      contentHash,
      true  // isFinal = true
    );

    await studentAPI.submitAssignment({
      assignmentId,
      fileName,
      fileContent: content,
      fileType: assignment?.type === 'code' ? '.txt' : '.txt',
      blockchainTxHash: txData.transactionHash,
      blockchainVersion: txData.version
    });

    navigate('/student/dashboard');
  } catch (err) {
    setError(err.response?.data?.error || err.message || 'Failed to submit assignment');
    setBlockchainStatus('');
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
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{assignment.title}</h2>
                <p className="mt-2 text-sm text-gray-600">{assignment.description}</p>
              </div>
              {walletConnected ? (
                <div className="text-right">
                  <div className="text-xs text-green-600 font-medium">✓ Wallet Connected</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </div>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
                >
                  Connect Wallet
                </button>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Due: {new Date(assignment.dueDate).toLocaleString()}
              </span>
              <div className="flex items-center space-x-4">
                {autoSaving && (
                  <span className="text-blue-600">Auto-saving draft...</span>
                )}
                {blockchainStatus && (
                  <span className="text-purple-600">{blockchainStatus}</span>
                )}
              </div>
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
                disabled={autoSaving || !content || !walletConnected}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Save Draft (Blockchain)
              </button>
              <button
                type="submit"
                disabled={loading || !walletConnected}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Final (Blockchain)'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
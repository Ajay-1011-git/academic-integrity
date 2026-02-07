// ============================================================================
// Blockchain service for Web3 integration
// IMPORTANT: This file must contain ONLY JavaScript functions (NO JSX!)
// ============================================================================

/**
 * Submit assignment to blockchain
 * @param {Object} data - Submission data
 * @returns {Promise<Object>} Transaction result with hash
 */
export async function submitToBlockchain(data) {
  try {
    // Check if MetaMask is installed
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not installed. Please install MetaMask or use Direct Submit.');
    }

    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    const account = accounts[0];
    
    // Create transaction data
    const submissionHash = await hashSubmission(data);
    
    // Prepare transaction
    const transactionParameters = {
      to: account, // Send to self (proof of submission)
      from: account,
      value: '0x0', // 0 ETH
      data: submissionHash, // Include submission hash in data
    };

    try {
      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      console.log('Blockchain transaction successful:', txHash);

      return {
        success: true,
        txHash: txHash,
        account: account,
        timestamp: new Date().toISOString(),
        message: 'Submitted to blockchain successfully'
      };
    } catch (txError) {
      // User rejected transaction
      if (txError.code === 4001) {
        throw new Error('Transaction rejected by user');
      }
      
      // Insufficient funds
      if (txError.code === -32000) {
        throw new Error('Insufficient funds for gas. Please use Direct Submit instead.');
      }
      
      throw txError;
    }

  } catch (error) {
    console.error('Blockchain submission error:', error);
    throw error;
  }
}

/**
 * Create a hash of the submission for blockchain storage
 * @param {Object} data - Submission data
 * @returns {Promise<string>} Hex-encoded hash
 */
async function hashSubmission(data) {
  const submissionString = JSON.stringify({
    assignmentId: data.assignmentId,
    fileName: data.fileName,
    contentHash: await simpleHash(data.fileContent),
    timestamp: Date.now()
  });

  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(submissionString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Simple hash function for content
 */
async function simpleHash(content) {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Connect to MetaMask wallet
 * @returns {Promise<string>} Connected wallet address
 */
export async function connectWallet() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    return accounts[0];
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('User rejected wallet connection');
    }
    throw new Error('Failed to connect wallet: ' + error.message);
  }
}

/**
 * Get currently connected wallet address
 * @returns {string|null} Wallet address or null
 */
export function getWalletAddress() {
  if (typeof window !== 'undefined' && window.ethereum) {
    return window.ethereum.selectedAddress;
  }
  return null;
}

/**
 * Verify a blockchain transaction
 * @param {string} txHash - Transaction hash to verify
 * @returns {Promise<Object>} Verification result
 */
export async function verifyBlockchainTransaction(txHash) {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not available');
    }

    const receipt = await window.ethereum.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash],
    });

    if (receipt) {
      return {
        verified: true,
        status: receipt.status === '0x1' ? 'success' : 'failed',
        blockNumber: receipt.blockNumber,
        timestamp: Date.now()
      };
    }

    return {
      verified: false,
      message: 'Transaction not found or still pending'
    };
  } catch (error) {
    console.error('Verification error:', error);
    return {
      verified: false,
      error: error.message
    };
  }
}

/**
 * Get current network information
 * @returns {Promise<Object>} Network info
 */
export async function getNetworkInfo() {
  if (typeof window === 'undefined' || !window.ethereum) {
    return { connected: false };
  }

  try {
    const chainId = await window.ethereum.request({ 
      method: 'eth_chainId' 
    });
    
    const networks = {
      '0x1': 'Ethereum Mainnet',
      '0x5': 'Goerli Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Mumbai Testnet',
      '0xaa36a7': 'Sepolia Testnet'
    };

    return {
      connected: true,
      chainId: chainId,
      networkName: networks[chainId] || 'Unknown Network'
    };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

/**
 * Listen for account changes
 * @param {Function} callback - Function to call when account changes
 */
export function onAccountChanged(callback) {
  if (typeof window !== 'undefined' && window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      callback(accounts[0]);
    });
  }
}

/**
 * Listen for network changes
 * @param {Function} callback - Function to call when network changes
 */
export function onNetworkChanged(callback) {
  if (typeof window !== 'undefined' && window.ethereum) {
    window.ethereum.on('chainChanged', (chainId) => {
      callback(chainId);
    });
  }
}

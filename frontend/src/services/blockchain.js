import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

const CONTRACT_ADDRESS = '0x0ff59967A01d6Fc600eC68Ae9d0a012379e9B5dD';
const AMOY_CHAIN_ID = 80002;

const CONTRACT_ABI = [
  "function recordSubmission(string assignmentId, string studentId, string contentHash, bool isFinal) public returns (uint256)",
  "function getSubmissionHistory(string assignmentId, string studentId) public view returns (tuple(string assignmentId, string studentId, string contentHash, uint256 timestamp, uint256 version, bool isFinal, address submittedBy)[])",
  "function getSubmissionCount(string assignmentId, string studentId) public view returns (uint256)",
  "function verifySubmission(string assignmentId, string studentId, string contentHash, uint256 version) public view returns (bool)",
  "event SubmissionRecorded(string indexed assignmentId, string indexed studentId, string contentHash, uint256 version, bool isFinal, uint256 timestamp, address submittedBy)"
];

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.userAddress = null;
  }

  async connectWallet() {
    try {
      const provider = await detectEthereumProvider();
      
      if (!provider) {
        throw new Error('Please install MetaMask browser extension');
      }

      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      
      await this.provider.send("eth_requestAccounts", []);
      
      this.signer = this.provider.getSigner();
      this.userAddress = await this.signer.getAddress();
      
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        this.signer
      );

      const network = await this.provider.getNetwork();
      if (network.chainId !== AMOY_CHAIN_ID) {
        await this.switchToAmoy();
      }

      console.log('✅ Wallet connected:', this.userAddress);
      return this.userAddress;
    } catch (error) {
      console.error('❌ Wallet connection error:', error);
      throw error;
    }
  }

  async switchToAmoy() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13882' }], // 80002 in hex
      });
    } catch (switchError) {
      // Network not added, let's add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x13882',
            chainName: 'Polygon Amoy Testnet',
            nativeCurrency: {
              name: 'MATIC',
              symbol: 'MATIC',
              decimals: 18
            },
            rpcUrls: ['https://rpc-amoy.polygon.technology'],
            blockExplorerUrls: ['https://www.oklink.com/amoy']
          }]
        });
      } else {
        throw switchError;
      }
    }
  }

  async recordSubmission(assignmentId, studentId, contentHash, isFinal = false) {
  try {
    if (!this.contract) {
      await this.connectWallet();
    }

    // CRITICAL: Re-verify network before every transaction
    const network = await this.provider.getNetwork();
    console.log('Current network:', network);
    
    if (network.chainId !== AMOY_CHAIN_ID) {
      console.log('Wrong network detected, switching...');
      await this.switchToAmoy();
      
      // Reconnect after network switch
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        this.signer
      );
    }

    console.log('⛓️ Sending transaction to blockchain...');
    console.log('Assignment ID:', assignmentId);
    console.log('Student ID:', studentId);
    console.log('Content Hash:', contentHash);
    console.log('Is Final:', isFinal);

    const tx = await this.contract.recordSubmission(
      assignmentId,
      studentId,
      contentHash,
      isFinal,
      {
        gasLimit: 300000
      }
    );

    console.log('📝 Transaction sent:', tx.hash);
    console.log('⏳ Waiting for confirmation...');

    const receipt = await tx.wait(1);
    
    console.log('✅ Transaction confirmed!');
    console.log('Receipt:', receipt);

    const event = receipt.events?.find(e => e.event === 'SubmissionRecorded');
    const version = event ? event.args.version.toNumber() : 1;

    return {
      transactionHash: receipt.transactionHash,
      version,
      blockNumber: receipt.blockNumber,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Blockchain record error:', error);
    
    if (error.code === 4001) {
      throw new Error('Transaction rejected by user');
    } else if (error.code === -32603) {
      throw new Error('Insufficient funds for gas');
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error('Network error - please make sure you are on Polygon Amoy');
    } else {
      throw error;
    }
  }
}

  async getSubmissionHistory(assignmentId, studentId) {
    try {
      if (!this.contract) {
        await this.connectWallet();
      }

      const history = await this.contract.getSubmissionHistory(assignmentId, studentId);
      
      return history.map(sub => ({
        assignmentId: sub.assignmentId,
        studentId: sub.studentId,
        contentHash: sub.contentHash,
        timestamp: new Date(sub.timestamp.toNumber() * 1000).toISOString(),
        version: sub.version.toNumber(),
        isFinal: sub.isFinal,
        submittedBy: sub.submittedBy
      }));
    } catch (error) {
      console.error('Get history error:', error);
      throw error;
    }
  }

  async verifySubmission(assignmentId, studentId, contentHash, version) {
    try {
      if (!this.contract) {
        await this.connectWallet();
      }

      return await this.contract.verifySubmission(
        assignmentId,
        studentId,
        contentHash,
        version
      );
    } catch (error) {
      console.error('Verification error:', error);
      throw error;
    }
  }

  isConnected() {
    return this.contract !== null && this.userAddress !== null;
  }

  getAddress() {
    return this.userAddress;
  }
}

export default new BlockchainService();
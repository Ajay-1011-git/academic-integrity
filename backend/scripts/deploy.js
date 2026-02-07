const hre = require("hardhat");

async function main() {
  console.log("\n🚀 Starting deployment to Polygon Amoy...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MATIC\n");

  if (balance === 0n) {
    console.log("⚠️  WARNING: No MATIC balance!");
    console.log("Get test MATIC from: https://faucet.polygon.technology/\n");
    return;
  }

  console.log("📦 Deploying SubmissionTracker contract...");
  
  const SubmissionTracker = await hre.ethers.getContractFactory("SubmissionTracker");
  const contract = await SubmissionTracker.deploy();
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("\n✅ Deployment successful!\n");
  console.log("========================================");
  console.log("📍 Contract Address:", address);
  console.log("🌐 Network: Polygon Amoy Testnet");
  console.log("🔗 Chain ID: 80002");
  console.log("========================================\n");
  console.log("🔍 View on Explorer:");
  console.log(`https://www.oklink.com/amoy/address/${address}\n`);
  console.log("📝 Update frontend/src/services/blockchain.js:");
  console.log(`const CONTRACT_ADDRESS = '${address}';\n`);
  console.log("========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
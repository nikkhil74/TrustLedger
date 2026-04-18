import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  const oracleAddress = process.env.ORACLE_ADDRESS || deployer.address;

  // 1. Deploy BehaviorToken
  console.log('\n1. Deploying BehaviorToken...');
  const BehaviorToken = await ethers.getContractFactory('BehaviorToken');
  const behaviorToken = await BehaviorToken.deploy(oracleAddress);
  await behaviorToken.waitForDeployment();
  const btAddress = await behaviorToken.getAddress();
  console.log('   BehaviorToken deployed to:', btAddress);

  // 2. Deploy TrustLedgerScore
  console.log('\n2. Deploying TrustLedgerScore...');
  const TrustLedgerScore = await ethers.getContractFactory('TrustLedgerScore');
  const trustLedgerScore = await TrustLedgerScore.deploy(oracleAddress);
  await trustLedgerScore.waitForDeployment();
  const tlsAddress = await trustLedgerScore.getAddress();
  console.log('   TrustLedgerScore deployed to:', tlsAddress);

  // 3. Deploy ScoreVerifier
  console.log('\n3. Deploying ScoreVerifier...');
  const ScoreVerifier = await ethers.getContractFactory('ScoreVerifier');
  const scoreVerifier = await ScoreVerifier.deploy(tlsAddress);
  await scoreVerifier.waitForDeployment();
  const svAddress = await scoreVerifier.getAddress();
  console.log('   ScoreVerifier deployed to:', svAddress);

  console.log('\n========================================');
  console.log('Deployment Summary:');
  console.log('========================================');
  console.log('BehaviorToken:    ', btAddress);
  console.log('TrustLedgerScore: ', tlsAddress);
  console.log('ScoreVerifier:    ', svAddress);
  console.log('Oracle:           ', oracleAddress);
  console.log('========================================');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';

export async function deployScoreFixture() {
  const [owner, oracle, user1, user2, nonOracle] = await ethers.getSigners();

  const TrustLedgerScore = await ethers.getContractFactory('TrustLedgerScore');
  const score = await TrustLedgerScore.deploy(oracle.address);

  return { score, owner, oracle, user1, user2, nonOracle };
}

export async function deployTokenFixture() {
  const [owner, oracle, user1, user2, nonOracle] = await ethers.getSigners();

  const BehaviorToken = await ethers.getContractFactory('BehaviorToken');
  const token = await BehaviorToken.deploy(oracle.address);

  return { token, owner, oracle, user1, user2, nonOracle };
}

export async function deployFullSuiteFixture() {
  const [owner, oracle, user1, user2, lender] = await ethers.getSigners();

  const BehaviorToken = await ethers.getContractFactory('BehaviorToken');
  const token = await BehaviorToken.deploy(oracle.address);

  const TrustLedgerScore = await ethers.getContractFactory('TrustLedgerScore');
  const score = await TrustLedgerScore.deploy(oracle.address);

  const ScoreVerifier = await ethers.getContractFactory('ScoreVerifier');
  const verifier = await ScoreVerifier.deploy(await score.getAddress());

  return { token, score, verifier, owner, oracle, user1, user2, lender };
}

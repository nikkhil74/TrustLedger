import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { deployScoreFixture } from './helpers/fixtures';

describe('TrustLedgerScore', function () {
  describe('Deployment', function () {
    it('should set the correct oracle', async function () {
      const { score, oracle } = await loadFixture(deployScoreFixture);
      expect(await score.oracle()).to.equal(oracle.address);
    });

    it('should set the correct owner', async function () {
      const { score, owner } = await loadFixture(deployScoreFixture);
      expect(await score.owner()).to.equal(owner.address);
    });

    it('should revert with zero address oracle', async function () {
      const TrustLedgerScore = await ethers.getContractFactory('TrustLedgerScore');
      await expect(
        TrustLedgerScore.deploy(ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(TrustLedgerScore, 'ZeroAddress');
    });
  });

  describe('updateScore', function () {
    it('should allow oracle to update a score', async function () {
      const { score, oracle, user1 } = await loadFixture(deployScoreFixture);
      const hash = ethers.keccak256(ethers.toUtf8Bytes('test'));

      await expect(score.connect(oracle).updateScore(user1.address, 742, hash))
        .to.emit(score, 'ScoreUpdated')
        .withArgs(user1.address, 742, (v: bigint) => v > 0n, hash);
    });

    it('should revert when non-oracle calls updateScore', async function () {
      const { score, nonOracle, user1 } = await loadFixture(deployScoreFixture);
      const hash = ethers.keccak256(ethers.toUtf8Bytes('test'));

      await expect(
        score.connect(nonOracle).updateScore(user1.address, 742, hash),
      ).to.be.revertedWithCustomError(score, 'OnlyOracle');
    });

    it('should revert with score below 300', async function () {
      const { score, oracle, user1 } = await loadFixture(deployScoreFixture);
      const hash = ethers.keccak256(ethers.toUtf8Bytes('test'));

      await expect(
        score.connect(oracle).updateScore(user1.address, 299, hash),
      ).to.be.revertedWithCustomError(score, 'InvalidScore');
    });

    it('should revert with score above 900', async function () {
      const { score, oracle, user1 } = await loadFixture(deployScoreFixture);
      const hash = ethers.keccak256(ethers.toUtf8Bytes('test'));

      await expect(
        score.connect(oracle).updateScore(user1.address, 901, hash),
      ).to.be.revertedWithCustomError(score, 'InvalidScore');
    });

    it('should accept score at boundaries (300 and 900)', async function () {
      const { score, oracle, user1, user2 } = await loadFixture(deployScoreFixture);
      const hash = ethers.keccak256(ethers.toUtf8Bytes('test'));

      await expect(score.connect(oracle).updateScore(user1.address, 300, hash)).to.not.be
        .reverted;
      await expect(score.connect(oracle).updateScore(user2.address, 900, hash)).to.not.be
        .reverted;
    });

    it('should revert with zero address user', async function () {
      const { score, oracle } = await loadFixture(deployScoreFixture);
      const hash = ethers.keccak256(ethers.toUtf8Bytes('test'));

      await expect(
        score.connect(oracle).updateScore(ethers.ZeroAddress, 742, hash),
      ).to.be.revertedWithCustomError(score, 'ZeroAddress');
    });
  });

  describe('getScore', function () {
    it('should return the stored score', async function () {
      const { score, oracle, user1 } = await loadFixture(deployScoreFixture);
      const hash = ethers.keccak256(ethers.toUtf8Bytes('test'));

      await score.connect(oracle).updateScore(user1.address, 742, hash);

      const [storedScore, timestamp, attestationHash] = await score.getScore(user1.address);
      expect(storedScore).to.equal(742);
      expect(timestamp).to.be.gt(0);
      expect(attestationHash).to.equal(hash);
    });

    it('should return zero for non-existent scores', async function () {
      const { score, user1 } = await loadFixture(deployScoreFixture);
      const [storedScore, timestamp] = await score.getScore(user1.address);
      expect(storedScore).to.equal(0);
      expect(timestamp).to.equal(0);
    });
  });

  describe('verifyScoreAbove', function () {
    it('should return true when score is above threshold', async function () {
      const { score, oracle, user1 } = await loadFixture(deployScoreFixture);
      const hash = ethers.keccak256(ethers.toUtf8Bytes('test'));

      await score.connect(oracle).updateScore(user1.address, 742, hash);
      expect(await score.verifyScoreAbove(user1.address, 700)).to.be.true;
    });

    it('should return true when score equals threshold', async function () {
      const { score, oracle, user1 } = await loadFixture(deployScoreFixture);
      const hash = ethers.keccak256(ethers.toUtf8Bytes('test'));

      await score.connect(oracle).updateScore(user1.address, 700, hash);
      expect(await score.verifyScoreAbove(user1.address, 700)).to.be.true;
    });

    it('should return false when score is below threshold', async function () {
      const { score, oracle, user1 } = await loadFixture(deployScoreFixture);
      const hash = ethers.keccak256(ethers.toUtf8Bytes('test'));

      await score.connect(oracle).updateScore(user1.address, 500, hash);
      expect(await score.verifyScoreAbove(user1.address, 700)).to.be.false;
    });

    it('should return false for non-existent score', async function () {
      const { score, user1 } = await loadFixture(deployScoreFixture);
      expect(await score.verifyScoreAbove(user1.address, 300)).to.be.false;
    });
  });

  describe('Oracle rotation', function () {
    it('should allow owner to update oracle', async function () {
      const { score, owner, user1 } = await loadFixture(deployScoreFixture);
      await expect(score.connect(owner).setOracle(user1.address))
        .to.emit(score, 'OracleUpdated');
      expect(await score.oracle()).to.equal(user1.address);
    });

    it('should revert when non-owner updates oracle', async function () {
      const { score, nonOracle, user1 } = await loadFixture(deployScoreFixture);
      await expect(
        score.connect(nonOracle).setOracle(user1.address),
      ).to.be.revertedWithCustomError(score, 'OwnableUnauthorizedAccount');
    });
  });
});

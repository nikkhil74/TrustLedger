import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { deployTokenFixture } from './helpers/fixtures';

describe('BehaviorToken', function () {
  describe('Deployment', function () {
    it('should have correct name and symbol', async function () {
      const { token } = await loadFixture(deployTokenFixture);
      expect(await token.name()).to.equal('TrustLedger Behavior Token');
      expect(await token.symbol()).to.equal('TBT');
    });

    it('should have 0 decimals', async function () {
      const { token } = await loadFixture(deployTokenFixture);
      expect(await token.decimals()).to.equal(0);
    });

    it('should set the correct oracle', async function () {
      const { token, oracle } = await loadFixture(deployTokenFixture);
      expect(await token.oracle()).to.equal(oracle.address);
    });
  });

  describe('Minting', function () {
    it('should allow oracle to mint tokens', async function () {
      const { token, oracle, user1 } = await loadFixture(deployTokenFixture);

      await expect(
        token.connect(oracle).mint(user1.address, 10, 'ONTIME_REPAYMENT'),
      )
        .to.emit(token, 'TokensMinted')
        .withArgs(user1.address, 10, 'ONTIME_REPAYMENT');

      expect(await token.balanceOf(user1.address)).to.equal(10);
    });

    it('should revert when non-oracle mints', async function () {
      const { token, nonOracle, user1 } = await loadFixture(deployTokenFixture);

      await expect(
        token.connect(nonOracle).mint(user1.address, 10, 'ONTIME_REPAYMENT'),
      ).to.be.revertedWithCustomError(token, 'OnlyOracle');
    });

    it('should revert when minting to zero address', async function () {
      const { token, oracle } = await loadFixture(deployTokenFixture);

      await expect(
        token.connect(oracle).mint(ethers.ZeroAddress, 10, 'ONTIME_REPAYMENT'),
      ).to.be.revertedWithCustomError(token, 'ZeroAddress');
    });

    it('should accumulate tokens on multiple mints', async function () {
      const { token, oracle, user1 } = await loadFixture(deployTokenFixture);

      await token.connect(oracle).mint(user1.address, 10, 'ONTIME_REPAYMENT');
      await token.connect(oracle).mint(user1.address, 5, 'CONSISTENT_SAVINGS');

      expect(await token.balanceOf(user1.address)).to.equal(15);
    });
  });

  describe('Soulbound (Non-Transferable)', function () {
    it('should revert on transfer', async function () {
      const { token, oracle, user1, user2 } = await loadFixture(deployTokenFixture);

      await token.connect(oracle).mint(user1.address, 10, 'ONTIME_REPAYMENT');

      await expect(
        token.connect(user1).transfer(user2.address, 5),
      ).to.be.revertedWithCustomError(token, 'SoulboundNonTransferable');
    });

    it('should revert on transferFrom', async function () {
      const { token, oracle, user1, user2 } = await loadFixture(deployTokenFixture);

      await token.connect(oracle).mint(user1.address, 10, 'ONTIME_REPAYMENT');

      // Approve first (this should succeed as approve doesn't call _update)
      await token.connect(user1).approve(user2.address, 5);

      await expect(
        token.connect(user2).transferFrom(user1.address, user2.address, 5),
      ).to.be.revertedWithCustomError(token, 'SoulboundNonTransferable');
    });
  });

  describe('Oracle management', function () {
    it('should allow owner to update oracle', async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);
      await token.connect(owner).setOracle(user1.address);
      expect(await token.oracle()).to.equal(user1.address);
    });

    it('should revert when non-owner updates oracle', async function () {
      const { token, nonOracle, user1 } = await loadFixture(deployTokenFixture);
      await expect(
        token.connect(nonOracle).setOracle(user1.address),
      ).to.be.revertedWithCustomError(token, 'OwnableUnauthorizedAccount');
    });
  });
});

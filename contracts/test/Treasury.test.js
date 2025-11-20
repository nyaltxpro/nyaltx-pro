const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Treasury", function () {
  async function deployTreasuryFixture() {
    const [owner, multisigOwner1, multisigOwner2, user1, user2] = await ethers.getSigners();

    // Deploy MultiSig
    const SimpleMultiSig = await ethers.getContractFactory("SimpleMultiSig");
    const multisig = await SimpleMultiSig.deploy(
      [multisigOwner1.address, multisigOwner2.address],
      2
    );

    // Deploy NYAX Token
    const NYAXToken = await ethers.getContractFactory("NYAXToken");
    const nyaxToken = await NYAXToken.deploy(owner.address, owner.address);

    // Deploy Treasury
    const Treasury = await ethers.getContractFactory("Treasury");
    const treasury = await Treasury.deploy(
      nyaxToken.target,
      multisig.target,
      owner.address
    );

    // Set treasury as authorized minter
    await nyaxToken.setTreasury(treasury.target);

    return {
      treasury,
      nyaxToken,
      multisig,
      owner,
      multisigOwner1,
      multisigOwner2,
      user1,
      user2
    };
  }

  describe("Deployment", function () {
    it("Should set the right addresses", async function () {
      const { treasury, nyaxToken, multisig, owner } = await loadFixture(deployTreasuryFixture);

      expect(await treasury.nyax()).to.equal(nyaxToken.target);
      expect(await treasury.multisig()).to.equal(multisig.target);
      expect(await treasury.owner()).to.equal(owner.address);
    });

    it("Should have correct constants", async function () {
      const { treasury } = await loadFixture(deployTreasuryFixture);

      expect(await treasury.BASIS_POINTS()).to.equal(10000);
      expect(await treasury.MULTISIG_THRESHOLD()).to.equal(ethers.parseEther("1000000"));
    });
  });

  describe("Category Management", function () {
    it("Should allow owner to set category wallet", async function () {
      const { treasury, owner, user1 } = await loadFixture(deployTreasuryFixture);

      await treasury.connect(owner).setCategoryWallet("team", user1.address, 2000); // 20%

      expect(await treasury.categoryWallet("team")).to.equal(user1.address);
      expect(await treasury.categoryAllocation("team")).to.equal(2000);
      expect(await treasury.categoryExists("team")).to.equal(true);
    });

    it("Should not allow non-owner to set category wallet", async function () {
      const { treasury, user1, user2 } = await loadFixture(deployTreasuryFixture);

      await expect(
        treasury.connect(user1).setCategoryWallet("team", user2.address, 2000)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not allow allocation over 100%", async function () {
      const { treasury, owner, user1 } = await loadFixture(deployTreasuryFixture);

      await expect(
        treasury.connect(owner).setCategoryWallet("team", user1.address, 10001)
      ).to.be.revertedWith("Treasury: Allocation exceeds 100%");
    });

    it("Should allow removing category", async function () {
      const { treasury, owner, user1 } = await loadFixture(deployTreasuryFixture);

      await treasury.connect(owner).setCategoryWallet("team", user1.address, 2000);
      await treasury.connect(owner).removeCategory("team");

      expect(await treasury.categoryExists("team")).to.equal(false);
    });

    it("Should return all categories", async function () {
      const { treasury, owner, user1, user2 } = await loadFixture(deployTreasuryFixture);

      await treasury.connect(owner).setCategoryWallet("team", user1.address, 2000);
      await treasury.connect(owner).setCategoryWallet("advisors", user2.address, 500);

      const categories = await treasury.getCategories();
      expect(categories).to.include("team");
      expect(categories).to.include("advisors");
    });
  });

  describe("Token Operations", function () {
    it("Should allow owner to mint to treasury", async function () {
      const { treasury, nyaxToken, owner } = await loadFixture(deployTreasuryFixture);

      const mintAmount = ethers.parseEther("1000000");
      await treasury.connect(owner).mintToTreasury(mintAmount, "Initial mint");

      expect(await nyaxToken.balanceOf(treasury.target)).to.equal(mintAmount);
    });

    it("Should allow owner to mint to specific address", async function () {
      const { treasury, nyaxToken, owner, user1 } = await loadFixture(deployTreasuryFixture);

      const mintAmount = ethers.parseEther("1000");
      await treasury.connect(owner).mintTo(user1.address, mintAmount, "Direct mint", "team");

      expect(await nyaxToken.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should allow owner to burn from treasury", async function () {
      const { treasury, nyaxToken, owner } = await loadFixture(deployTreasuryFixture);

      const mintAmount = ethers.parseEther("1000000");
      const burnAmount = ethers.parseEther("100000");

      await treasury.connect(owner).mintToTreasury(mintAmount, "Initial mint");
      await treasury.connect(owner).burnFromTreasury(burnAmount, "Burn excess");

      expect(await nyaxToken.balanceOf(treasury.target)).to.equal(mintAmount - burnAmount);
    });
  });

  describe("Transfer Operations", function () {
    beforeEach(async function () {
      const { treasury, owner } = await loadFixture(deployTreasuryFixture);
      
      // Mint some tokens to treasury for testing
      const mintAmount = ethers.parseEther("10000000");
      await treasury.connect(owner).mintToTreasury(mintAmount, "Test mint");
    });

    it("Should allow owner to make small transfers", async function () {
      const { treasury, nyaxToken, owner, user1 } = await loadFixture(deployTreasuryFixture);

      const transferAmount = ethers.parseEther("100000"); // Below multisig threshold
      await treasury.connect(owner).transferTo(user1.address, transferAmount, "Small transfer", "team");

      expect(await nyaxToken.balanceOf(user1.address)).to.equal(transferAmount);
    });

    it("Should not allow large transfers without multisig", async function () {
      const { treasury, owner, user1 } = await loadFixture(deployTreasuryFixture);

      const largeAmount = ethers.parseEther("2000000"); // Above multisig threshold
      await expect(
        treasury.connect(owner).transferTo(user1.address, largeAmount, "Large transfer", "team")
      ).to.be.revertedWith("Treasury: Amount exceeds multisig threshold");
    });

    it("Should allow multisig transfers", async function () {
      const { treasury, nyaxToken, multisig, multisigOwner1, multisigOwner2, user1 } = await loadFixture(deployTreasuryFixture);

      const largeAmount = ethers.parseEther("2000000");
      
      // Encode the multisig transfer call
      const transferData = treasury.interface.encodeFunctionData(
        "multisigTransfer",
        [user1.address, largeAmount, "Large multisig transfer", "team"]
      );

      // Submit transaction through multisig
      await multisig.connect(multisigOwner1).submitTransaction(treasury.target, 0, transferData);
      
      // Second owner confirms (auto-executes due to threshold)
      await multisig.connect(multisigOwner2).confirmTransaction(0);

      expect(await nyaxToken.balanceOf(user1.address)).to.equal(largeAmount);
    });

    it("Should track category distributions", async function () {
      const { treasury, owner, user1 } = await loadFixture(deployTreasuryFixture);

      await treasury.connect(owner).setCategoryWallet("team", user1.address, 2000);
      
      const transferAmount = ethers.parseEther("100000");
      await treasury.connect(owner).transferTo(user1.address, transferAmount, "Team allocation", "team");

      expect(await treasury.categoryDistributed("team")).to.equal(transferAmount);
    });
  });

  describe("View Functions", function () {
    it("Should return treasury balance", async function () {
      const { treasury, owner } = await loadFixture(deployTreasuryFixture);

      const mintAmount = ethers.parseEther("1000000");
      await treasury.connect(owner).mintToTreasury(mintAmount, "Test mint");

      expect(await treasury.getTreasuryBalance()).to.equal(mintAmount);
    });

    it("Should return category info", async function () {
      const { treasury, owner, user1 } = await loadFixture(deployTreasuryFixture);

      await treasury.connect(owner).setCategoryWallet("team", user1.address, 2000);
      await treasury.connect(owner).mintToTreasury(ethers.parseEther("1000000"), "Test mint");
      
      const transferAmount = ethers.parseEther("50000");
      await treasury.connect(owner).transferTo(user1.address, transferAmount, "Team allocation", "team");

      const [wallet, allocation, distributed, remaining] = await treasury.getCategoryInfo("team");
      
      expect(wallet).to.equal(user1.address);
      expect(allocation).to.equal(2000);
      expect(distributed).to.equal(transferAmount);
      expect(remaining).to.be.gt(0);
    });

    it("Should return total allocation", async function () {
      const { treasury, owner, user1, user2 } = await loadFixture(deployTreasuryFixture);

      await treasury.connect(owner).setCategoryWallet("team", user1.address, 2000);
      await treasury.connect(owner).setCategoryWallet("advisors", user2.address, 500);

      expect(await treasury.getTotalAllocation()).to.equal(2500);
    });

    it("Should check if amount requires multisig", async function () {
      const { treasury } = await loadFixture(deployTreasuryFixture);

      const smallAmount = ethers.parseEther("100000");
      const largeAmount = ethers.parseEther("2000000");

      expect(await treasury.requiresMultisig(smallAmount)).to.equal(false);
      expect(await treasury.requiresMultisig(largeAmount)).to.equal(true);
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to recover ERC20 tokens", async function () {
      const { treasury, owner } = await loadFixture(deployTreasuryFixture);

      // Deploy a mock ERC20 token
      const MockToken = await ethers.getContractFactory("NYAXToken");
      const mockToken = await MockToken.deploy(owner.address, owner.address);
      
      const amount = ethers.parseEther("100");
      await mockToken.connect(owner).mint(treasury.target, amount);

      const ownerBalanceBefore = await mockToken.balanceOf(owner.address);
      await treasury.connect(owner).emergencyRecoverERC20(mockToken.target, amount);
      const ownerBalanceAfter = await mockToken.balanceOf(owner.address);

      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(amount);
    });

    it("Should not allow recovering NYAX tokens", async function () {
      const { treasury, nyaxToken, owner } = await loadFixture(deployTreasuryFixture);

      const amount = ethers.parseEther("100");
      await expect(
        treasury.connect(owner).emergencyRecoverERC20(nyaxToken.target, amount)
      ).to.be.revertedWith("Treasury: Cannot recover NYAX tokens");
    });
  });
});

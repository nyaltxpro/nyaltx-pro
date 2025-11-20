const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("NYAXToken", function () {
  async function deployNYAXTokenFixture() {
    const [owner, treasury, user1, user2, blacklisted] = await ethers.getSigners();

    const NYAXToken = await ethers.getContractFactory("NYAXToken");
    const nyaxToken = await NYAXToken.deploy(treasury.address, owner.address);

    return { nyaxToken, owner, treasury, user1, user2, blacklisted };
  }

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      const { nyaxToken } = await loadFixture(deployNYAXTokenFixture);

      expect(await nyaxToken.name()).to.equal("NYAX");
      expect(await nyaxToken.symbol()).to.equal("NYAX");
    });

    it("Should set the right owner and treasury", async function () {
      const { nyaxToken, owner, treasury } = await loadFixture(deployNYAXTokenFixture);

      expect(await nyaxToken.owner()).to.equal(owner.address);
      expect(await nyaxToken.treasury()).to.equal(treasury.address);
    });

    it("Should have zero initial supply", async function () {
      const { nyaxToken } = await loadFixture(deployNYAXTokenFixture);

      expect(await nyaxToken.totalSupply()).to.equal(0);
    });

    it("Should have transfers enabled by default", async function () {
      const { nyaxToken } = await loadFixture(deployNYAXTokenFixture);

      expect(await nyaxToken.transfersEnabled()).to.equal(true);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const { nyaxToken, owner, user1 } = await loadFixture(deployNYAXTokenFixture);

      const mintAmount = ethers.parseEther("1000");
      await nyaxToken.connect(owner).mint(user1.address, mintAmount);

      expect(await nyaxToken.balanceOf(user1.address)).to.equal(mintAmount);
      expect(await nyaxToken.totalSupply()).to.equal(mintAmount);
    });

    it("Should allow treasury to mint tokens", async function () {
      const { nyaxToken, treasury, user1 } = await loadFixture(deployNYAXTokenFixture);

      const mintAmount = ethers.parseEther("1000");
      await nyaxToken.connect(treasury).mint(user1.address, mintAmount);

      expect(await nyaxToken.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should not allow non-authorized addresses to mint", async function () {
      const { nyaxToken, user1, user2 } = await loadFixture(deployNYAXTokenFixture);

      const mintAmount = ethers.parseEther("1000");
      await expect(
        nyaxToken.connect(user1).mint(user2.address, mintAmount)
      ).to.be.revertedWith("NYAXToken: Not authorized to mint/burn");
    });

    it("Should not allow minting beyond max supply", async function () {
      const { nyaxToken, owner, user1 } = await loadFixture(deployNYAXTokenFixture);

      const maxSupply = await nyaxToken.MAX_SUPPLY();
      const excessAmount = maxSupply + ethers.parseEther("1");

      await expect(
        nyaxToken.connect(owner).mint(user1.address, excessAmount)
      ).to.be.revertedWith("NYAXToken: Minting would exceed max supply");
    });

    it("Should emit TokensMinted event", async function () {
      const { nyaxToken, owner, user1 } = await loadFixture(deployNYAXTokenFixture);

      const mintAmount = ethers.parseEther("1000");
      await expect(nyaxToken.connect(owner).mint(user1.address, mintAmount))
        .to.emit(nyaxToken, "TokensMinted")
        .withArgs(user1.address, mintAmount);
    });
  });

  describe("Burning", function () {
    it("Should allow owner to burn tokens", async function () {
      const { nyaxToken, owner, user1 } = await loadFixture(deployNYAXTokenFixture);

      const mintAmount = ethers.parseEther("1000");
      const burnAmount = ethers.parseEther("500");

      await nyaxToken.connect(owner).mint(user1.address, mintAmount);
      await nyaxToken.connect(owner).burn(user1.address, burnAmount);

      expect(await nyaxToken.balanceOf(user1.address)).to.equal(mintAmount - burnAmount);
      expect(await nyaxToken.totalSupply()).to.equal(mintAmount - burnAmount);
    });

    it("Should allow users to burn their own tokens", async function () {
      const { nyaxToken, owner, user1 } = await loadFixture(deployNYAXTokenFixture);

      const mintAmount = ethers.parseEther("1000");
      const burnAmount = ethers.parseEther("500");

      await nyaxToken.connect(owner).mint(user1.address, mintAmount);
      await nyaxToken.connect(user1).burnSelf(burnAmount);

      expect(await nyaxToken.balanceOf(user1.address)).to.equal(mintAmount - burnAmount);
    });

    it("Should not allow burning more than balance", async function () {
      const { nyaxToken, owner, user1 } = await loadFixture(deployNYAXTokenFixture);

      const mintAmount = ethers.parseEther("1000");
      const burnAmount = ethers.parseEther("1500");

      await nyaxToken.connect(owner).mint(user1.address, mintAmount);
      
      await expect(
        nyaxToken.connect(owner).burn(user1.address, burnAmount)
      ).to.be.revertedWith("NYAXToken: Insufficient balance to burn");
    });
  });

  describe("Transfers", function () {
    it("Should allow normal transfers when enabled", async function () {
      const { nyaxToken, owner, user1, user2 } = await loadFixture(deployNYAXTokenFixture);

      const mintAmount = ethers.parseEther("1000");
      const transferAmount = ethers.parseEther("500");

      await nyaxToken.connect(owner).mint(user1.address, mintAmount);
      await nyaxToken.connect(user1).transfer(user2.address, transferAmount);

      expect(await nyaxToken.balanceOf(user1.address)).to.equal(mintAmount - transferAmount);
      expect(await nyaxToken.balanceOf(user2.address)).to.equal(transferAmount);
    });

    it("Should not allow transfers when disabled", async function () {
      const { nyaxToken, owner, user1, user2 } = await loadFixture(deployNYAXTokenFixture);

      const mintAmount = ethers.parseEther("1000");
      const transferAmount = ethers.parseEther("500");

      await nyaxToken.connect(owner).mint(user1.address, mintAmount);
      await nyaxToken.connect(owner).setTransfersEnabled(false);

      await expect(
        nyaxToken.connect(user1).transfer(user2.address, transferAmount)
      ).to.be.revertedWith("NYAXToken: Transfers are disabled");
    });

    it("Should not allow transfers to/from blacklisted addresses", async function () {
      const { nyaxToken, owner, user1, blacklisted } = await loadFixture(deployNYAXTokenFixture);

      const mintAmount = ethers.parseEther("1000");
      const transferAmount = ethers.parseEther("500");

      await nyaxToken.connect(owner).mint(user1.address, mintAmount);
      await nyaxToken.connect(owner).setBlacklisted(blacklisted.address, true);

      await expect(
        nyaxToken.connect(user1).transfer(blacklisted.address, transferAmount)
      ).to.be.revertedWith("NYAXToken: Account is blacklisted");
    });
  });

  describe("Governance", function () {
    it("Should support delegation", async function () {
      const { nyaxToken, owner, user1, user2 } = await loadFixture(deployNYAXTokenFixture);

      const mintAmount = ethers.parseEther("1000");
      await nyaxToken.connect(owner).mint(user1.address, mintAmount);

      await nyaxToken.connect(user1).delegate(user2.address);
      expect(await nyaxToken.getVotes(user2.address)).to.equal(mintAmount);
    });

    it("Should update voting power on transfers", async function () {
      const { nyaxToken, owner, user1, user2 } = await loadFixture(deployNYAXTokenFixture);

      const mintAmount = ethers.parseEther("1000");
      const transferAmount = ethers.parseEther("500");

      await nyaxToken.connect(owner).mint(user1.address, mintAmount);
      await nyaxToken.connect(user1).delegate(user1.address);

      expect(await nyaxToken.getVotes(user1.address)).to.equal(mintAmount);

      await nyaxToken.connect(user1).transfer(user2.address, transferAmount);
      await nyaxToken.connect(user2).delegate(user2.address);

      expect(await nyaxToken.getVotes(user1.address)).to.equal(mintAmount - transferAmount);
      expect(await nyaxToken.getVotes(user2.address)).to.equal(transferAmount);
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to set treasury", async function () {
      const { nyaxToken, owner, user1 } = await loadFixture(deployNYAXTokenFixture);

      await nyaxToken.connect(owner).setTreasury(user1.address);
      expect(await nyaxToken.treasury()).to.equal(user1.address);
    });

    it("Should not allow non-owner to set treasury", async function () {
      const { nyaxToken, user1, user2 } = await loadFixture(deployNYAXTokenFixture);

      await expect(
        nyaxToken.connect(user1).setTreasury(user2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow owner to toggle transfers", async function () {
      const { nyaxToken, owner } = await loadFixture(deployNYAXTokenFixture);

      await nyaxToken.connect(owner).setTransfersEnabled(false);
      expect(await nyaxToken.transfersEnabled()).to.equal(false);

      await nyaxToken.connect(owner).setTransfersEnabled(true);
      expect(await nyaxToken.transfersEnabled()).to.equal(true);
    });

    it("Should allow owner to manage blacklist", async function () {
      const { nyaxToken, owner, user1 } = await loadFixture(deployNYAXTokenFixture);

      await nyaxToken.connect(owner).setBlacklisted(user1.address, true);
      expect(await nyaxToken.blacklisted(user1.address)).to.equal(true);

      await nyaxToken.connect(owner).setBlacklisted(user1.address, false);
      expect(await nyaxToken.blacklisted(user1.address)).to.equal(false);
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to recover ERC20 tokens", async function () {
      const { nyaxToken, owner } = await loadFixture(deployNYAXTokenFixture);

      // Deploy a mock ERC20 token
      const MockToken = await ethers.getContractFactory("NYAXToken");
      const mockToken = await MockToken.deploy(owner.address, owner.address);
      
      const amount = ethers.parseEther("100");
      await mockToken.connect(owner).mint(nyaxToken.target, amount);

      const ownerBalanceBefore = await mockToken.balanceOf(owner.address);
      await nyaxToken.connect(owner).recoverERC20(mockToken.target, amount);
      const ownerBalanceAfter = await mockToken.balanceOf(owner.address);

      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(amount);
    });

    it("Should not allow recovering NYAX tokens", async function () {
      const { nyaxToken, owner } = await loadFixture(deployNYAXTokenFixture);

      const amount = ethers.parseEther("100");
      await expect(
        nyaxToken.connect(owner).recoverERC20(nyaxToken.target, amount)
      ).to.be.revertedWith("NYAXToken: Cannot recover NYAX tokens");
    });
  });

  describe("View Functions", function () {
    it("Should return correct remaining mintable supply", async function () {
      const { nyaxToken, owner, user1 } = await loadFixture(deployNYAXTokenFixture);

      const maxSupply = await nyaxToken.MAX_SUPPLY();
      expect(await nyaxToken.remainingMintableSupply()).to.equal(maxSupply);

      const mintAmount = ethers.parseEther("1000");
      await nyaxToken.connect(owner).mint(user1.address, mintAmount);

      expect(await nyaxToken.remainingMintableSupply()).to.equal(maxSupply - mintAmount);
    });
  });
});

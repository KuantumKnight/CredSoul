import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("ReputationPassport", function () {
  async function fixture() {
    const [admin, issuer, holder, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("ReputationPassport");
    const passport = await Factory.deploy();
    await passport.waitForDeployment();
    await passport.connect(holder).createProfile();
    await passport.connect(issuer).requestIssuer("VIT Chennai", "https://vit.ac.in", "University");
    await passport.connect(admin).setIssuerStatus(issuer.address, 2);
    return { passport, admin, issuer, holder, other };
  }

  it("creates one profile and blocks transfers", async function () {
    const { passport, holder, other } = await fixture();
    expect(await passport.passportToken(holder.address)).to.equal(1n);
    await expect(passport.connect(holder).createProfile()).to.be.revertedWith("Profile already exists");
    await expect(passport.connect(holder).transferFrom(holder.address, other.address, 1)).to.be.revertedWith("Soulbound token is non-transferable");
  });

  it("allows verified issuers to issue and owners to revoke only their credentials", async function () {
    const { passport, issuer, holder, other } = await fixture();
    const hash = ethers.id("certificate.pdf");
    await passport.connect(issuer).issueCredential(holder.address, "Technical", "Solidity Fundamentals", "Completed", 1723766400, 0, 40, hash);
    expect(await passport.reputationScore(holder.address)).to.equal(40n);
    await expect(passport.connect(other).revokeCredential(1, "not my credential")).to.be.revertedWith("Only issuing issuer can revoke");
    await passport.connect(issuer).revokeCredential(1, "Incorrect record");
    expect(await passport.reputationScore(holder.address)).to.equal(0n);
  });

  it("lets an approved issuer create a student-owned passport and then issue credentials", async function () {
    const { passport, issuer, other } = await fixture();
    const studentBalance = await ethers.provider.getBalance(other.address);
    const transaction = await passport.connect(issuer).createProfileFor(other.address);
    expect(transaction.from).to.equal(issuer.address);
    await expect(transaction)
      .to.emit(passport, "ProfileCreated").withArgs(other.address, 2n)
      .and.to.emit(passport, "ProfileCreatedFor").withArgs(issuer.address, other.address, 2n);
    expect(await passport.ownerOf(2)).to.equal(other.address);
    expect(await ethers.provider.getBalance(other.address)).to.equal(studentBalance);
    expect(await passport.passportToken(issuer.address)).to.equal(0n);
    expect(await passport.holderCount(other.address)).to.equal(1n);
    expect(await passport.getHolders()).to.include(other.address);
    expect(await passport.reputationScore(other.address)).to.equal(0n);
    await passport.connect(issuer).issueCredential(other.address, "Academic", "Course completion", "Passed", 1723766400, 0, 50, ethers.id("course"));
    expect(await passport.reputationScore(other.address)).to.equal(50n);
    await expect(passport.connect(other).transferFrom(other.address, issuer.address, 2))
      .to.be.revertedWith("Soulbound token is non-transferable");
  });

  it("blocks duplicate passports across issuer-created and self-created paths", async function () {
    const { passport, issuer, holder, other, admin } = await fixture();
    await expect(passport.connect(issuer).createProfileFor(holder.address)).to.be.revertedWith("Profile already exists");
    await passport.connect(issuer).createProfileFor(other.address);
    await expect(passport.connect(other).createProfile()).to.be.revertedWith("Profile already exists");
    await expect(passport.connect(issuer).createProfileFor(other.address)).to.be.revertedWith("Profile already exists");
    await passport.connect(admin).setIssuerStatus(admin.address, 2);
    await expect(passport.connect(admin).createProfileFor(other.address)).to.be.revertedWith("Profile already exists");
    expect(await passport.getHolders()).to.deep.equal([holder.address, other.address]);
  });

  it("rejects the zero address without creating a passport", async function () {
    const { passport, issuer, other } = await fixture();
    await expect(passport.connect(issuer).createProfileFor(ethers.ZeroAddress)).to.be.revertedWith("Invalid recipient");
    await passport.connect(issuer).createProfileFor(other.address);
    expect(await passport.passportToken(other.address)).to.equal(2n);
  });

  for (const [name, status] of [["unregistered", 0], ["pending", 1], ["rejected", 3], ["suspended", 4], ["revoked", 5]]) {
    it(`prevents ${name} issuers from creating passports for students`, async function () {
      const { passport, admin, issuer, other } = await fixture();
      await passport.connect(admin).setIssuerStatus(issuer.address, status);
      await expect(passport.connect(issuer).createProfileFor(other.address)).to.be.revertedWith("Issuer is not verified");
      expect(await passport.passportToken(other.address)).to.equal(0n);
    });
  }

  it("rejects unauthorized issuance and duplicate credentials", async function () {
    const { passport, holder, other, issuer } = await fixture();
    const hash = ethers.id("certificate.pdf");
    await expect(passport.connect(other).issueCredential(holder.address, "Academic", "Unauthorized", "No", 1723766400, 0, 10, hash)).to.be.revertedWith("Issuer is not verified");
    await passport.connect(issuer).issueCredential(holder.address, "Academic", "Solidity Fundamentals", "Completed", 1723766400, 0, 40, hash);
    await expect(passport.connect(issuer).issueCredential(holder.address, "Academic", "Solidity Fundamentals", "Completed", 1723766400, 0, 40, hash)).to.be.revertedWith("Duplicate credential");
  });

  it("removes expired credentials from the active score", async function () {
    const { passport, issuer, holder } = await fixture();
    const hash = ethers.id("expired.pdf");
    await passport.connect(issuer).issueCredential(holder.address, "Academic", "Expired record", "No longer active", 1, 2, 50, hash);
    expect(await passport.isCredentialActive(1)).to.equal(false);
    expect(await passport.reputationScore(holder.address)).to.equal(0n);
  });

  it("verifies evidence hashes without storing the source file", async function () {
    const { passport, issuer, holder } = await fixture();
    const hash = ethers.id("evidence.pdf");
    await passport.connect(issuer).issueCredential(holder.address, "Research", "Evidence record", "Hash check", 1723766400, 0, 30, hash);
    expect(await passport.verifyEvidence(1, hash)).to.equal(true);
    expect(await passport.verifyEvidence(1, ethers.id("different.pdf"))).to.equal(false);
  });

  it("supports batch reads and collection counts", async function () {
    const { passport, issuer, holder } = await fixture();
    await passport.connect(issuer).issueCredential(holder.address, "Technical", "First", "One", 1723766400, 0, 20, ethers.id("one"));
    await passport.connect(issuer).issueCredential(holder.address, "Community", "Second", "Two", 1723766400, 0, 30, ethers.id("two"));
    expect(await passport.getHolderCredentialCount(holder.address)).to.equal(2n);
    expect(await passport.getIssuerCredentialCount(issuer.address)).to.equal(2n);
    const records = await passport.getCredentials([1, 2]);
    expect(records.map((record) => record.title)).to.deep.equal(["First", "Second"]);
  });

  it("enforces the maximum credential score", async function () {
    const { passport, issuer, holder } = await fixture();
    await expect(passport.connect(issuer).issueCredential(holder.address, "Technical", "Too much", "Invalid", 1723766400, 0, 1001, ethers.id("invalid"))).to.be.revertedWith("Score must be between 1 and 1000");
  });

  it("rejects unknown issuer status values", async function () {
    const { passport, admin, issuer } = await fixture();
    await expect(passport.connect(admin).setIssuerStatus(issuer.address, 9)).to.be.reverted;
  });

  it("blocks approvals and exposes a stable passport URI", async function () {
    const { passport, holder } = await fixture();
    expect(await passport.tokenURI(1)).to.equal("https://verity.local/passport/1");
    await expect(passport.connect(holder).approve(holder.address, 1)).to.be.revertedWith("Soulbound token is non-transferable");
    await expect(passport.connect(holder).setApprovalForAll(holder.address, true)).to.be.revertedWith("Soulbound token is non-transferable");
  });
});

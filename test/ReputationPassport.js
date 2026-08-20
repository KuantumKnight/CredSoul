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
    await expect(passport.connect(admin).setIssuerStatus(issuer.address, 9)).to.be.revertedWith("Invalid issuer status");
  });
});

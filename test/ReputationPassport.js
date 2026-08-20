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
});

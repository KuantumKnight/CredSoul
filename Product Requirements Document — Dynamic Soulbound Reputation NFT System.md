# Product Requirements Document (PRD)

## Dynamic Soulbound Reputation NFT System

**Project ID:** 25BCE5743  
**Student:** Sarvesh M  
**Project Title:** Dynamic Soulbound Reputation NFT System  
**Document Version:** 1.0  
**Status:** Product Definition  
**Product Type:** Blockchain-based Web Application / DApp  

---

# 1. Product Overview

The **Dynamic Soulbound Reputation NFT System** is a blockchain-based platform for creating a permanent, verifiable, non-transferable digital reputation profile based on an individual's achievements.

Instead of storing achievements as isolated certificates that can be lost, forged, manipulated, or become difficult to verify, the system allows authorized institutions and organizations to issue verified digital achievement records.

Each user owns a **Soulbound Reputation NFT**, or SBT, that:

- permanently belongs to the user's blockchain identity;
- cannot be transferred or sold;
- represents the user's verified reputation;
- evolves when new achievements are added;
- reflects multiple reputation categories;
- responds to credential expiration or revocation;
- provides public verification of the authenticity of achievements;
- maintains an auditable history of issued credentials.

The system is intended to function as a **lifelong decentralized achievement and reputation passport**.

---

# 2. Problem Statement

Individuals accumulate achievements throughout their education and professional life, including:

- academic qualifications;
- certifications;
- hackathon achievements;
- internships;
- research publications;
- technical accomplishments;
- leadership roles;
- extracurricular achievements;
- open-source contributions;
- volunteering;
- professional milestones.

These achievements are currently distributed across multiple platforms and documents.

Traditional credential systems suffer from several problems:

1. Certificates can be forged or modified.
2. Verification often requires contacting the issuing institution.
3. Credentials are stored across unrelated platforms.
4. Users may lose original documents.
5. Recruiters cannot easily verify multiple achievements.
6. Online profiles are largely self-declared.
7. Institutions do not have a common mechanism for issuing trusted digital achievements.
8. Existing NFT-based credential systems often treat achievements only as static tokens.
9. Traditional NFTs are transferable and therefore unsuitable for representing personal reputation.
10. A person's reputation changes over time, while most digital credentials remain static.

The proposed system addresses these limitations through blockchain-backed, issuer-verified, non-transferable and dynamically updated reputation profiles.

---

# 3. Product Vision

Create a decentralized digital reputation passport where:

> **A person's reputation is derived from verifiable achievements rather than self-declared claims.**

The product should allow any verifier to answer:

- Who issued this achievement?
- Was the issuer trusted?
- Was this achievement issued to this wallet?
- Has the achievement been modified?
- Is the credential currently valid?
- Has it expired?
- Has it been revoked?
- How has this achievement contributed to the individual's reputation?

---

# 4. Product Goal

The primary goal is to build a working blockchain application capable of securely issuing, storing, updating and verifying lifelong achievements through a dynamic Soulbound Reputation NFT.

The product must demonstrate more than NFT minting.

The final system must show the complete credential lifecycle:

**Issuer approval → achievement issuance → verification → reputation update → expiration/revocation → reputation recalculation**

---

# 5. Core Product Concept

Each individual receives **one Soulbound Reputation NFT**.

The NFT represents the individual's reputation profile rather than a single certificate.

A user may therefore have:

```text
Wallet
  │
  └── Soulbound Reputation NFT
         │
         ├── Academic Reputation
         ├── Technical Reputation
         ├── Research Reputation
         ├── Hackathon Reputation
         ├── Open Source Reputation
         ├── Leadership Reputation
         └── Community Reputation
```

Individual achievements exist as verified credential records associated with the reputation profile.

Example:

```text
User
│
├── AWS Certification
├── Hackathon Winner
├── Research Publication
├── Internship
├── Open Source Contribution
└── Leadership Position
```

Each valid credential contributes to the user's overall and category-specific reputation.

---

# 6. Product Principles

The product shall follow six core principles.

### 6.1 Reputation must be earned

Users cannot directly increase their own reputation.

Only verified achievements issued by authorized entities may affect reputation.

### 6.2 Reputation must not be transferable

A reputation profile represents an individual's history and must not be tradable or transferable like a conventional NFT.

### 6.3 Credentials must be independently verifiable

A third party must be able to verify credentials without trusting the user's own claims.

### 6.4 Reputation must be dynamic

The profile must evolve when credentials are:

- issued;
- expired;
- revoked;
- restored where allowed.

### 6.5 Sensitive information must not be unnecessarily stored on blockchain

The blockchain should contain proofs and essential verification information rather than confidential personal documents.

### 6.6 Every important action must be auditable

Credential issuance, revocation and reputation changes must leave a verifiable history.

---

# 7. Target Users

The system will support four primary user groups.

## 7.1 Credential Holder

Examples:

- student;
- graduate;
- employee;
- researcher;
- developer;
- professional.

The holder receives achievements and owns the reputation SBT.

### Holder needs

The holder must be able to:

- connect a wallet;
- create a reputation identity;
- view reputation;
- view achievements;
- verify achievement status;
- view issuing organizations;
- share their public profile;
- generate a QR verification link;
- view reputation history.

---

# 8. Issuer

An issuer is an organization authorized to issue credentials.

Examples include:

- universities;
- colleges;
- companies;
- certification bodies;
- hackathon organizers;
- research institutions;
- professional organizations;
- approved clubs.

### Issuer needs

An issuer must be able to:

- register;
- request verification;
- receive authorization;
- issue achievements;
- upload supporting evidence;
- define credential category;
- specify credential validity;
- revoke credentials;
- inspect previously issued credentials.

---

# 9. Verifier

A verifier is a third party who wants to confirm a user's credentials.

Examples:

- recruiter;
- university;
- employer;
- scholarship provider;
- event organizer.

### Verifier needs

A verifier should not require a blockchain wallet.

The verifier must be able to:

- open a public profile;
- scan a QR code;
- inspect achievements;
- see issuer identity;
- see credential status;
- verify document integrity;
- view blockchain transaction references where appropriate.

---

# 10. Platform Administrator

The administrator manages the trusted issuer ecosystem.

The administrator must be able to:

- review issuer requests;
- approve issuers;
- reject issuer requests;
- deactivate issuers;
- reactivate issuers;
- manage achievement categories;
- manage scoring policies;
- monitor suspicious credential activity;
- view platform statistics.

---

# 11. Primary Use Cases

The product shall support the following main scenarios.

## UC-01 — User creates reputation profile

1. User visits the application.
2. User connects blockchain wallet.
3. Application verifies wallet ownership.
4. User initializes a reputation profile.
5. System creates or associates a Soulbound Reputation NFT.
6. Profile becomes available.

---

## UC-02 — Organization applies to become issuer

1. Organization connects issuer wallet.
2. Organization submits:
   - organization name;
   - organization type;
   - website;
   - contact information;
   - supported credential categories.
3. Request enters `Pending` state.
4. Administrator reviews request.
5. Administrator approves or rejects request.

Possible statuses:

```text
Pending
Verified
Rejected
Suspended
Revoked
```

---

## UC-03 — Issuer issues achievement

1. Verified issuer logs in.
2. Issuer selects **Issue Credential**.
3. Issuer enters recipient wallet.
4. Issuer selects credential category.
5. Issuer enters achievement title.
6. Issuer enters description.
7. Issuer chooses achievement level.
8. Issuer specifies issue date.
9. Issuer optionally specifies expiry date.
10. Issuer uploads supporting evidence.
11. System generates a cryptographic proof/hash.
12. Issuer reviews data.
13. Issuer confirms issuance.
14. Credential becomes active.
15. User reputation is recalculated.
16. User sees the new credential.

---

# 12. UC-04 — Verify achievement

A verifier selects a credential.

System must show:

```text
Credential Name
Recipient
Issuer
Issuer Verification Status
Issue Date
Expiry Date
Credential Status
Credential Category
Evidence Verification
Blockchain Proof
```

Status must clearly indicate:

```text
VALID
EXPIRED
REVOKED
INVALID
```

---

# 13. UC-05 — Revoke credential

An issuer may revoke a credential it previously issued.

Issuer must provide:

- credential ID;
- revocation reason.

After confirmation:

```text
ACTIVE → REVOKED
```

The reputation system must recalculate affected scores.

The revoked achievement must remain visible as historical information but must no longer contribute to reputation.

---

# 14. UC-06 — Credential expiration

If a credential has an expiry date, the system must detect when it becomes invalid.

Example:

```text
AWS Certification

Issued:
2026

Expires:
2029

Status:
ACTIVE
```

After expiry:

```text
Status:
EXPIRED
```

Expired credentials should not contribute to active reputation unless the scoring policy explicitly allows historical credit.

---

# 15. UC-07 — Public profile sharing

The credential holder can generate:

- shareable URL;
- QR code.

Example:

```text
reputation.example/u/0x123...
```

A verifier opening this link should see the public reputation profile without requiring wallet authentication.

---

# 16. UC-08 — Certificate integrity verification

When an issuer uploads a certificate or document:

```text
Document
   ↓
Cryptographic Hash
   ↓
Blockchain Record
```

When a document is later presented for verification:

```text
Uploaded document hash
            │
            ▼
Compare with registered hash
```

If identical:

```text
DOCUMENT VERIFIED
```

If different:

```text
DOCUMENT DOES NOT MATCH REGISTERED EVIDENCE
```

---

# 17. Functional Requirements

Requirements use the following priority:

- **P0:** Mandatory
- **P1:** Important
- **P2:** Enhancement
- **P3:** Future feature

---

# 18. Wallet Authentication

### FR-AUTH-01 — Connect wallet — P0

Users must be able to connect a supported blockchain wallet.

### FR-AUTH-02 — Wallet ownership verification — P0

The application must require cryptographic wallet confirmation before authenticated actions.

### FR-AUTH-03 — Session persistence — P1

The application may maintain authenticated sessions while preserving wallet verification.

### FR-AUTH-04 — Wallet disconnect — P0

Users must be able to disconnect their wallet.

---

# 19. Soulbound Reputation Profile

### FR-SBT-01 — One reputation identity — P0

A wallet may own only one active reputation SBT.

### FR-SBT-02 — Non-transferability — P0

Users must not be able to transfer, sell or gift their reputation SBT.

The following operations must fail:

```text
User A → User B transfer
User A → Marketplace
User A → Secondary wallet
```

### FR-SBT-03 — Dynamic state — P0

The reputation profile must dynamically update when credentials change.

### FR-SBT-04 — Reputation level — P1

The profile should display a reputation tier.

Example:

```text
Bronze
Silver
Gold
Platinum
Diamond
```

### FR-SBT-05 — Dynamic visual identity — P2

The NFT representation may visually evolve according to reputation tier.

---

# 20. Credential Management

### FR-CRED-01 — Credential issuance — P0

Verified issuers must be able to create credentials.

### FR-CRED-02 — Unique credential ID — P0

Every issued credential must have a unique identifier.

### FR-CRED-03 — Credential metadata — P0

Every credential must contain:

- credential ID;
- recipient;
- issuer;
- category;
- title;
- description;
- issue date;
- optional expiration date;
- reputation weight;
- evidence hash;
- credential status.

### FR-CRED-04 — Duplicate prevention — P1

The system should prevent accidental duplicate credential issuance.

### FR-CRED-05 — Credential retrieval — P0

Users must be able to retrieve all credentials associated with their profile.

---

# 21. Credential Lifecycle

Every credential must follow the lifecycle:

```text
               ┌─────────┐
               │ ISSUED  │
               └────┬────┘
                    │
                    ▼
               ┌─────────┐
               │ ACTIVE  │
               └──┬───┬──┘
                  │   │
       revocation │   │ expiry
                  │   │
                  ▼   ▼
             REVOKED EXPIRED
```

The system should preserve the credential record regardless of final state.

---

# 22. Issuer Management

### FR-ISS-01 — Issuer registration — P0

Organizations must be able to request issuer status.

### FR-ISS-02 — Administrator approval — P0

Issuer rights must require administrator approval.

### FR-ISS-03 — Issuer status — P0

System must track:

```text
Pending
Verified
Rejected
Suspended
Revoked
```

### FR-ISS-04 — Issuer revocation — P0

Administrators must be able to disable an issuer.

### FR-ISS-05 — Issuer identity — P1

Public credential pages should display issuer identity and verification status.

---

# 23. Achievement Categories

Initial supported reputation categories:

1. Academic
2. Technical
3. Research
4. Hackathon
5. Open Source
6. Professional
7. Leadership
8. Community / Volunteering
9. Sports / Extracurricular

The administrator should be able to configure categories.

---

# 24. Reputation Engine

The system must maintain both:

### Overall Reputation

Example:

```text
742 / 1000
```

### Multidimensional Reputation

Example:

```text
Academic        82
Technical       91
Research        73
Hackathon       94
Open Source     68
Professional    77
Leadership      55
Community       44
```

---

# 25. Reputation Calculation

The reputation engine should use deterministic and transparent rules.

Example baseline scoring:

| Achievement | Base Points |
|---|---:|
| Event participation | 5 |
| Course completion | 10 |
| Workshop completion | 10 |
| Technical certification | 25 |
| Internship | 40 |
| Hackathon finalist | 50 |
| Hackathon winner | 100 |
| Research publication | 100 |
| Patent filing | 100 |
| Patent grant | 150 |
| Major open-source contribution | 75 |
| Leadership role | 50 |
| Volunteer contribution | 20 |

Exact values may be configurable.

---

# 26. Reputation Formula

For each valid achievement:

```text
Contribution =
Base Achievement Score
× Achievement Level Multiplier
× Issuer Weight
```

Example:

```text
Hackathon Winner

Base score = 100
Level multiplier = 1.0
Issuer weight = 1.0

Contribution = 100
```

Optional future reputation factors may include:

```text
Credential freshness
Issuer credibility
Credential rarity
Credential difficulty
Peer validation
```

These must not be part of the MVP unless required.

---

# 27. Reputation Revocation Behavior

If:

```text
Current reputation = 550
```

and an active achievement worth:

```text
100
```

is revoked:

```text
New active reputation = 450
```

The system must preserve historical information showing why the reputation changed.

---

# 28. Reputation Levels

Initial level definition:

| Score | Tier |
|---:|---|
| 0–99 | Starter |
| 100–249 | Bronze |
| 250–449 | Silver |
| 450–649 | Gold |
| 650–849 | Platinum |
| 850+ | Diamond |

These values should be configurable.

---

# 29. Public Reputation Profile

The public user profile must display:

```text
Name / Display Identity
Wallet Address
SBT ID
Overall Reputation Score
Reputation Tier
Category Scores
Number of Valid Credentials
Number of Issuers
Recent Achievements
Credential Timeline
Share Button
QR Code
```

The design must make verification the primary feature rather than NFT trading.

---

# 30. Credential Detail Page

Each credential must have a dedicated verification view.

The page must display:

```text
Achievement
Issuer
Recipient
Credential ID
Issue Date
Expiry Date
Category
Reputation Contribution
Credential Status
Evidence Status
Blockchain Verification
Transaction Reference
```

The most prominent UI element should be the validity state.

Example:

```text
✓ VALID VERIFIED CREDENTIAL
```

or:

```text
✕ REVOKED
```

---

# 31. Issuer Dashboard

The issuer dashboard should contain:

```text
Dashboard
Issue Credential
Issued Credentials
Search Credential
Revoke Credential
Organization Profile
```

Dashboard statistics should include:

```text
Credentials Issued
Active Credentials
Expired Credentials
Revoked Credentials
Unique Recipients
```

---

# 32. Credential Issuance Form

Required fields:

```text
Recipient Wallet
Credential Title
Credential Description
Category
Achievement Type
Achievement Level
Issue Date
Expiration Date
Supporting Evidence
```

Before final submission, the issuer must see a confirmation screen.

---

# 33. Administrator Dashboard

The administrator dashboard must provide:

```text
Pending Issuer Requests
Verified Issuers
Suspended Issuers
Credential Activity
User Count
Credential Count
Revocation Statistics
Reputation Configuration
```

Administrator must be able to:

- approve issuer;
- reject issuer;
- suspend issuer;
- restore issuer;
- inspect issuer activity.

---

# 34. Public Verification Portal

The system must provide a dedicated verification page.

Verifier must be able to enter:

```text
Credential ID
```

or scan:

```text
QR Code
```

The verification portal must return:

```text
VALID
EXPIRED
REVOKED
NOT FOUND
INVALID
```

---

# 35. Search

### FR-SEARCH-01 — Credential search — P1

Users must be able to search by credential ID.

### FR-SEARCH-02 — Wallet lookup — P1

Public users may look up a reputation profile using wallet address.

### FR-SEARCH-03 — Issuer search — P2

Users may search registered issuers.

---

# 36. Credential Evidence

The system should support evidence including:

- PDF certificates;
- images;
- text proofs;
- external reference IDs.

The full document should not be stored directly on the public blockchain.

Instead, a cryptographic fingerprint should be created.

Example:

```text
Certificate.pdf

SHA-256:
932ac728...
```

Blockchain stores:

```text
932ac728...
```

---

# 37. Privacy Requirements

### PR-01

Sensitive information must not be written directly to a public blockchain.

### PR-02

The product must avoid publicly storing:

- Aadhaar number;
- passport number;
- personal phone number;
- personal email;
- home address;
- student private records;
- confidential marksheets.

### PR-03

Only information necessary for public verification should be exposed.

### PR-04

Users should be informed that blockchain records may be permanent.

---

# 38. Auditability Requirements

The following operations must be auditable:

```text
Issuer registration
Issuer approval
Issuer suspension
Credential issuance
Credential revocation
Reputation update
Profile creation
Credential expiration
```

Audit records must preserve:

```text
Who performed action
What action occurred
When action occurred
Affected credential
Affected user
```

---

# 39. Security Requirements

## SEC-01 — Authorization

Only authorized issuers may issue credentials.

## SEC-02 — Issuer isolation

Issuer A must not be able to revoke credentials created by Issuer B.

## SEC-03 — Non-transferability

Reputation SBT transfers must be rejected.

## SEC-04 — Duplicate protection

Repeated transactions must not generate duplicate credentials.

## SEC-05 — Input validation

All wallet addresses and credential data must be validated.

## SEC-06 — Reentrancy awareness

Any smart-contract functionality involving external calls must be protected appropriately.

## SEC-07 — Principle of least privilege

Administrator and issuer privileges must be separate.

## SEC-08 — Key security

The application must never request or store users' wallet private keys.

---

# 40. Wallet Loss and Recovery

Wallet recovery is considered a **P2 feature**.

The system may support an identity migration mechanism.

Example:

```text
Old Wallet
0xOLD
   │
   ▼
Recovery Verification
   │
   ▼
New Wallet
0xNEW
```

The old identity should be marked:

```text
MIGRATED
```

rather than allowing ordinary token transfer.

Migration history must remain auditable.

---

# 41. Fraud Prevention

The system must protect against:

### Fake issuer attack

Mitigation:

```text
Only administrator-approved issuers can issue credentials.
```

### Fake achievement attack

Mitigation:

```text
Users cannot issue their own credentials.
```

### Certificate modification

Mitigation:

```text
Cryptographic document hashing.
```

### Reputation farming

Mitigation:

```text
Duplicate restrictions
Issuer verification
Category score caps
```

### Credential resale

Mitigation:

```text
Soulbound non-transferability.
```

---

# 42. User Stories

## Holder

**US-H01**

As a student, I want my verified achievements stored in a single profile so that I can demonstrate them without carrying multiple certificates.

**US-H02**

As a student, I want my reputation profile to automatically update when I receive an achievement.

**US-H03**

As a user, I want to share my reputation profile through a QR code.

**US-H04**

As a user, I want to know whether one of my credentials has expired or been revoked.

---

# 43. Issuer Stories

**US-I01**

As a university, I want to issue achievements directly to a student's wallet.

**US-I02**

As an issuer, I want to attach a tamper-evident proof to a credential.

**US-I03**

As an issuer, I want to revoke incorrectly issued credentials.

**US-I04**

As an issuer, I want to review all credentials I have issued.

---

# 44. Verifier Stories

**US-V01**

As a recruiter, I want to verify a candidate's achievement without contacting the university.

**US-V02**

As a recruiter, I want to determine whether a credential has been revoked.

**US-V03**

As a verifier, I want to know which organization issued a credential.

**US-V04**

As a verifier, I want to verify that the certificate provided to me matches the registered certificate.

---

# 45. Administrator Stories

**US-A01**

As an administrator, I want to verify legitimate issuing organizations.

**US-A02**

As an administrator, I want to suspend malicious issuers.

**US-A03**

As an administrator, I want to configure achievement categories and scoring rules.

---

# 46. UI/UX Requirements

The product must not visually resemble an NFT marketplace.

Avoid:

```text
NFT floor price
Buy
Sell
Transfer
Marketplace
ETH valuation
```

The interface should resemble:

> LinkedIn Credentials + Digital Passport + Blockchain Verification System.

Visual hierarchy should prioritize:

```text
Identity
Verification
Reputation
Achievements
Issuers
Proof
```

---

# 47. User Dashboard Requirements

The dashboard should contain five primary areas.

## Hero section

```text
REPUTATION SCORE

742

PLATINUM
```

## Reputation breakdown

Visual representation of category scores.

Possible chart:

```text
Radar chart
```

## Verified achievements

Credential cards displaying:

```text
Achievement
Issuer
Date
Category
Status
```

## Reputation history

Example:

```text
+100  Hackathon Winner
+40   Internship
+100  Research Paper
-25   Certification Expired
```

## Sharing

Provide:

```text
Copy Public Link
Generate QR
```

---

# 48. Credential Card Design

Example:

```text
┌──────────────────────────────────┐
│ ✓ VERIFIED                       │
│                                  │
│ VITISH 2026 Winner               │
│                                  │
│ Issued by                        │
│ VIT Chennai ✓                    │
│                                  │
│ Hackathon                        │
│ +100 Reputation                  │
│                                  │
│ Issued: Aug 2026                 │
│                                  │
│ [Verify Credential]              │
└──────────────────────────────────┘
```

---

# 49. Reputation Transparency

A user must be able to understand why they received a particular score.

The system must never display only:

```text
Reputation = 742
```

without explaining the calculation.

The profile should expose:

```text
Academic              150
Technical             180
Research              100
Hackathon             200
Leadership             60
Community              52
                      ───
Total                 742
```

---

# 50. Notifications

P2 functionality may notify users when:

- credential is issued;
- credential is revoked;
- credential approaches expiry;
- reputation tier changes.

---

# 51. Analytics

The system should expose platform analytics.

Examples:

```text
Total holders
Total credentials
Total verified issuers
Credentials issued this month
Credential categories
Credential revocation rate
```

Issuer analytics:

```text
Credentials issued
Active credentials
Expired credentials
Revoked credentials
Unique recipients
```

---

# 52. Non-Functional Requirements

## NFR-01 — Usability

A first-time verifier must be able to verify a credential without understanding blockchain technology.

## NFR-02 — Responsiveness

The application must support:

- desktop;
- tablet;
- mobile.

## NFR-03 — Availability

Public verification should remain available independently of the credential holder.

## NFR-04 — Performance

Normal profile pages should load within a reasonable interactive timeframe.

## NFR-05 — Transparency

Blockchain transaction failures must produce understandable user messages.

Bad:

```text
execution reverted
```

Preferred:

```text
Credential could not be issued because this wallet is not an authorized issuer.
```

## NFR-06 — Maintainability

Achievement categories and scoring rules should be configurable without rewriting the entire application.

## NFR-07 — Auditability

Historical credential state changes must remain traceable.

---

# 53. Error States

The frontend must explicitly handle:

```text
Wallet not connected
Wrong blockchain network
Transaction rejected
Transaction pending
Transaction failed
Invalid recipient wallet
Unauthorized issuer
Duplicate credential
Issuer suspended
Credential not found
Credential revoked
Credential expired
Evidence hash mismatch
```

---

# 54. Credential Status Semantics

## ACTIVE

Credential is valid and contributes to reputation.

## EXPIRED

Credential has exceeded its validity date.

## REVOKED

Issuer intentionally invalidated the credential.

## INVALID

Credential proof cannot be verified.

## MIGRATED

Credential/profile has been associated with a wallet recovery operation.

---

# 55. MVP Scope

The minimum acceptable product must include:

- wallet connection;
- Soulbound profile creation;
- non-transferable NFT;
- administrator-controlled issuer verification;
- achievement issuance;
- achievement categories;
- dynamic reputation score;
- multidimensional reputation;
- evidence hashing;
- credential verification;
- expiration;
- revocation;
- public reputation page;
- QR-based profile sharing;
- public credential verifier.

If these features work end-to-end, the central project objective is achieved.

---

# 56. Enhanced Version

After MVP completion, the following may be added:

- wallet recovery;
- animated dynamic NFT;
- issuer reputation;
- EIP-712 signed credentials;
- decentralized attestations;
- selective disclosure;
- zero-knowledge proofs;
- decentralized identity;
- mobile application;
- employer integrations;
- university ERP integration.

---

# 57. Explicitly Out of Scope for MVP

The first release will **not** include:

- cryptocurrency trading;
- NFT marketplace;
- token speculation;
- NFT selling;
- NFT bidding;
- cross-chain reputation;
- DAO governance;
- cryptocurrency rewards;
- token staking;
- AI-based reputation prediction;
- facial recognition;
- national identity verification;
- complete university ERP integration;
- zero-knowledge proof infrastructure;
- cross-platform identity federation.

These features would increase complexity without strengthening the central problem being solved.

---

# 58. Product Success Criteria

The project will be considered functionally successful if the following scenario can be demonstrated end-to-end:

### Test scenario

A user starts with:

```text
Reputation: 0
Credentials: 0
```

An authorized university issues:

```text
Hackathon Winner
+100
```

Profile changes:

```text
Reputation: 100
```

A second issuer issues:

```text
Technical Certification
+40
```

Profile changes:

```text
Reputation: 140
```

A recruiter opens the user's QR profile and verifies both credentials.

The certification issuer then revokes the second credential.

Profile automatically becomes:

```text
Reputation: 100
```

The recruiter refreshes verification.

The certification now displays:

```text
REVOKED
```

while the hackathon credential remains:

```text
VALID
```

The holder attempts to transfer the SBT to another wallet.

Transaction fails.

This one scenario proves:

```text
Soulbound identity
+
trusted issuance
+
dynamic reputation
+
verification
+
revocation
+
auditability
```

---

# 59. Acceptance Criteria

## AC-01

A non-authorized wallet cannot issue credentials.

## AC-02

An approved issuer can issue a credential.

## AC-03

The credential appears in the holder's profile.

## AC-04

The holder's reputation changes after credential issuance.

## AC-05

A verifier can independently verify the credential.

## AC-06

Modifying the uploaded evidence causes verification failure.

## AC-07

The issuer can revoke its own credential.

## AC-08

An issuer cannot revoke another issuer's credential.

## AC-09

Revoked credentials stop contributing to active reputation.

## AC-10

Expired credentials are visually identified.

## AC-11

The reputation NFT cannot be transferred.

## AC-12

A public profile can be accessed without wallet login.

## AC-13

A QR code leads to the correct public verification profile.

## AC-14

Credential history remains available after revocation.

---

# 60. Testing Requirements

Testing must cover four levels.

## Smart contract tests

Test:

```text
Minting
Non-transferability
Issuer permissions
Credential issuance
Unauthorized issuance
Revocation
Duplicate prevention
Score calculations
Expiration behavior
```

## Backend tests

Test:

```text
Document hashing
Data validation
Credential retrieval
Profile retrieval
```

## Frontend tests

Test:

```text
Wallet states
Loading states
Failure states
Credential display
QR sharing
Verification results
```

## End-to-end testing

Required demo flow:

```text
Admin → Issuer → Student → Verifier → Revocation
```

---

# 61. Demo Requirements

The final demonstration should use at least four wallets.

```text
Wallet A → Administrator
Wallet B → University
Wallet C → Certification Provider
Wallet D → Student
```

Demo sequence:

1. Show empty student profile.
2. Attempt unauthorized credential issuance.
3. Show transaction rejection.
4. Approve university issuer.
5. Issue hackathon credential.
6. Observe reputation update.
7. Approve certification issuer.
8. Issue technical certificate.
9. Observe category and overall reputation update.
10. Open public student profile.
11. Scan QR as recruiter.
12. Verify both achievements.
13. Verify certificate integrity.
14. Modify certificate.
15. Demonstrate hash verification failure.
16. Revoke one credential.
17. Show reputation decrease.
18. Show credential as revoked.
19. Attempt to transfer Soulbound NFT.
20. Demonstrate transfer failure.

This provides a much stronger demonstration than simply showing that an NFT was minted.

---

# 62. Evaluation Metrics

The system can be evaluated using:

### Functional correctness

Percentage of required product functions working successfully.

### Credential verification accuracy

Expected:

```text
Valid → correctly detected
Modified → rejected
Revoked → rejected
Expired → detected
```

### Authorization correctness

Unauthorized users must never issue credentials.

### Reputation consistency

Reputation shown to the user must exactly match contributions from currently valid credentials.

### Verification time

Time required for a recruiter to verify a credential.

### User interaction complexity

Number of steps required for:

```text
Issue credential
Verify credential
Share profile
```

---

# 63. Key Product Risks

## Risk 1 — Fake issuer

A malicious organization may request issuer status.

### Mitigation

Manual administrative approval during MVP.

---

## Risk 2 — Incorrect credential

A legitimate issuer may issue incorrect information.

### Mitigation

Revocation mechanism.

---

## Risk 3 — Wallet loss

Users may lose wallet access.

### Mitigation

Wallet recovery/migration as enhanced feature.

---

## Risk 4 — Privacy

Blockchain information may remain permanently public.

### Mitigation

Store only minimum required data and document fingerprints.

---

## Risk 5 — Reputation manipulation

Users may try to accumulate meaningless achievements.

### Mitigation

Controlled issuer registry, scoring limits and achievement classifications.

---

## Risk 6 — Arbitrary scoring

Faculty may question why one achievement is worth 100 points and another 40.

### Mitigation

Maintain a transparent configurable scoring policy and treat the numerical score as a derived reputation indicator rather than absolute human worth.

---

# 64. Critical Product Limitation

Blockchain does **not** prove that an achievement happened in the real world.

It proves that:

> A recognized issuer issued a cryptographically verifiable statement about the achievement.

Therefore the trust chain is:

```text
Real-world organization
        ↓
Verified issuer identity
        ↓
Credential
        ↓
Blockchain proof
        ↓
Holder reputation
```

The quality of the system ultimately depends on the quality of issuer verification.

This limitation must be openly stated in the project report.

---

# 65. Why Blockchain Is Required

A faculty evaluator may ask:

> Why can't this simply be implemented with MySQL?

The blockchain is not being used merely as a database.

Its purpose is to provide:

### Tamper-evident credential history

Previously issued credential records cannot silently be edited.

### Independent verification

A verifier is not completely dependent on the user's own application database.

### Issuer accountability

Credential issuance is attributable to specific authorized blockchain identities.

### Revocation transparency

A revoked credential retains its historical existence.

### Non-transferable digital ownership

The SBT establishes a wallet-bound reputation identity.

### Shared trust

Multiple independent organizations can issue credentials into the same reputation ecosystem without one organization owning all reputation records.

---

# 66. Product Positioning

The system should **not** be described simply as:

> Blockchain certificate management.

Preferred positioning:

> **A dynamic decentralized reputation passport where a non-transferable digital identity evolves according to independently issued, verifiable and revocable achievements.**

---

# 67. Core Innovation Statement

The main product contribution is the combination of:

```text
Soulbound Identity
        +
Verified Credential Issuance
        +
Dynamic Reputation
        +
Multidimensional Reputation
        +
Credential Revocation
        +
Tamper-Evident Evidence
        +
Public Verification
```

rather than merely representing certificates as NFTs.

---

# 68. Final Product Scope

The final product should contain four interconnected experiences:

```text
                   PLATFORM

        ┌────────────┬─────────────┐
        │            │             │
     HOLDER       ISSUER         ADMIN
        │            │             │
        └───────┬────┴──────┬──────┘
                │           │
          REPUTATION     CREDENTIALS
                │           │
                └─────┬─────┘
                      │
                      ▼
                  VERIFIER
```

The system succeeds when a credential can move through its complete lifecycle:

```text
Organization approved
        ↓
Credential issued
        ↓
Evidence recorded
        ↓
User reputation changes
        ↓
Public verification succeeds
        ↓
Credential expires/revoked
        ↓
Verification status changes
        ↓
Reputation recalculated
        ↓
Historical proof remains
```

---

# 69. Final MVP Feature Freeze

For this project, the recommended feature freeze is:

### Must Build

- Soulbound reputation NFT
- one SBT per user
- non-transferability
- approved issuer system
- credential issuance
- credential revocation
- credential expiration
- credential evidence hashing
- public credential verification
- reputation categories
- dynamic reputation score
- reputation history
- public user profile
- QR profile sharing
- administrator portal
- issuer portal
- holder dashboard
- verifier portal

### Build After Core Works

- dynamic NFT artwork
- wallet migration
- issuer credibility score
- advanced analytics
- notifications

### Do Not Prioritize

- AI/ML
- cryptocurrency
- NFT marketplace
- DAO
- staking
- cross-chain functionality
- token rewards
- ZK proofs
- complex decentralized identity standards

---

# 70. Definition of Done

The project is considered complete when:

- a new holder can establish a reputation identity;
- the reputation NFT cannot be transferred;
- an administrator can approve an issuer;
- an unauthorized wallet cannot issue credentials;
- an approved issuer can issue an achievement;
- that achievement changes reputation;
- multiple achievement categories are supported;
- supporting evidence can be cryptographically verified;
- a third party can verify a credential;
- verification does not require trusting the holder;
- credentials can expire;
- issuers can revoke their credentials;
- revocation changes active reputation;
- historical records remain traceable;
- users can publicly share reputation profiles;
- profiles can be accessed through a QR code;
- all major workflows can be demonstrated reliably during project evaluation.

---

## Final Product Statement

**Dynamic Soulbound Reputation NFT System is a blockchain-based lifelong reputation passport that binds a non-transferable digital identity to independently verified achievements. Authorized organizations issue tamper-evident credentials that dynamically affect a holder's multidimensional reputation, while third parties can independently verify credential provenance, validity, expiration and revocation.**
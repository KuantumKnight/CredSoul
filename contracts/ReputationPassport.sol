// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Verity Soulbound Reputation Passport
/// @notice One non-transferable ERC-721 identity per wallet, backed by issuer-signed achievement records.
contract ReputationPassport is ERC721, Ownable {
    enum IssuerStatus { None, Pending, Verified, Rejected, Suspended, Revoked }
    enum CredentialStatus { Active, Revoked }
    uint32 public constant MAX_CREDENTIAL_SCORE = 1000;

    struct Issuer {
        string name;
        string website;
        string organizationType;
        IssuerStatus status;
        uint64 requestedAt;
    }

    struct Credential {
        uint256 id;
        address recipient;
        address issuer;
        string category;
        string title;
        string description;
        uint64 issueDate;
        uint64 expiryDate;
        uint32 score;
        bytes32 evidenceHash;
        CredentialStatus status;
    }

    uint256 private _nextTokenId = 1;
    uint256 private _nextCredentialId = 1;
    mapping(address => uint256) public passportToken;
    mapping(address => Issuer) public issuers;
    mapping(uint256 => Credential) private _credentials;
    mapping(address => uint256[]) private _holderCredentials;
    mapping(address => uint256[]) private _issuerCredentials;
    mapping(bytes32 => bool) private _credentialFingerprints;
    mapping(address => uint256) public holderCount;
    address[] private _holders;
    address[] private _issuerRegistry;
    uint256 public totalCredentials;
    uint256 public revokedCredentials;

    event ProfileCreated(address indexed holder, uint256 indexed tokenId);
    event IssuerRequested(address indexed issuer, string name);
    event IssuerStatusChanged(address indexed issuer, IssuerStatus status);
    event CredentialIssued(uint256 indexed credentialId, address indexed recipient, address indexed issuer, bytes32 evidenceHash, uint256 score);
    event CredentialRevoked(uint256 indexed credentialId, address indexed issuer, string reason);

    constructor() ERC721("Verity Reputation Passport", "VRP") Ownable(msg.sender) {}

    function createProfile() external returns (uint256 tokenId) {
        require(passportToken[msg.sender] == 0, "Profile already exists");
        tokenId = _nextTokenId++;
        passportToken[msg.sender] = tokenId;
        holderCount[msg.sender] = 1;
        _holders.push(msg.sender);
        _safeMint(msg.sender, tokenId);
        emit ProfileCreated(msg.sender, tokenId);
    }

    function requestIssuer(string calldata name, string calldata website, string calldata organizationType) external {
        require(bytes(name).length > 1, "Issuer name required");
        require(issuers[msg.sender].status != IssuerStatus.Verified, "Issuer already verified");
        if (issuers[msg.sender].status == IssuerStatus.None || issuers[msg.sender].status == IssuerStatus.Rejected) _issuerRegistry.push(msg.sender);
        issuers[msg.sender] = Issuer(name, website, organizationType, IssuerStatus.Pending, uint64(block.timestamp));
        emit IssuerRequested(msg.sender, name);
        emit IssuerStatusChanged(msg.sender, IssuerStatus.Pending);
    }

    function setIssuerStatus(address issuer, IssuerStatus status) external onlyOwner {
        require(issuer != address(0), "Invalid issuer");
        issuers[issuer].status = status;
        emit IssuerStatusChanged(issuer, status);
    }

    function issueCredential(
        address recipient,
        string calldata category,
        string calldata title,
        string calldata description,
        uint64 issueDate,
        uint64 expiryDate,
        uint32 score,
        bytes32 evidenceHash
    ) external returns (uint256 credentialId) {
        require(issuers[msg.sender].status == IssuerStatus.Verified, "Issuer is not verified");
        require(passportToken[recipient] != 0, "Recipient has no profile");
        require(bytes(title).length > 1, "Credential title required");
        require(score > 0 && score <= MAX_CREDENTIAL_SCORE, "Score must be between 1 and 1000");
        require(expiryDate == 0 || expiryDate > issueDate, "Invalid expiry");
        bytes32 fingerprint = keccak256(abi.encode(recipient, msg.sender, category, title, issueDate, evidenceHash));
        require(!_credentialFingerprints[fingerprint], "Duplicate credential");
        _credentialFingerprints[fingerprint] = true;
        credentialId = _nextCredentialId++;
        totalCredentials++;
        _credentials[credentialId] = Credential(credentialId, recipient, msg.sender, category, title, description, issueDate, expiryDate, score, evidenceHash, CredentialStatus.Active);
        _holderCredentials[recipient].push(credentialId);
        _issuerCredentials[msg.sender].push(credentialId);
        emit CredentialIssued(credentialId, recipient, msg.sender, evidenceHash, score);
    }

    function revokeCredential(uint256 credentialId, string calldata reason) external {
        Credential storage credential = _credentials[credentialId];
        require(credential.id != 0, "Credential not found");
        require(credential.issuer == msg.sender, "Only issuing issuer can revoke");
        require(credential.status == CredentialStatus.Active, "Credential already revoked");
        credential.status = CredentialStatus.Revoked;
        revokedCredentials++;
        emit CredentialRevoked(credentialId, msg.sender, reason);
    }

    function getCredential(uint256 credentialId) external view returns (Credential memory) {
        require(_credentials[credentialId].id != 0, "Credential not found");
        return _credentials[credentialId];
    }

    function getHolderCredentials(address holder) external view returns (uint256[] memory) { return _holderCredentials[holder]; }
    function getIssuerCredentials(address issuer) external view returns (uint256[] memory) { return _issuerCredentials[issuer]; }
    function getHolders() external view returns (address[] memory) { return _holders; }
    function getIssuerRegistry() external view returns (address[] memory) { return _issuerRegistry; }

    function isCredentialActive(uint256 credentialId) public view returns (bool) {
        Credential memory credential = _credentials[credentialId];
        return credential.id != 0 && credential.status == CredentialStatus.Active && (credential.expiryDate == 0 || credential.expiryDate > block.timestamp);
    }

    function reputationScore(address holder) public view returns (uint256 total) {
        uint256[] memory ids = _holderCredentials[holder];
        for (uint256 i = 0; i < ids.length; i++) if (isCredentialActive(ids[i])) total += _credentials[ids[i]].score;
    }

    function categoryScore(address holder, string calldata category) public view returns (uint256 total) {
        uint256[] memory ids = _holderCredentials[holder];
        for (uint256 i = 0; i < ids.length; i++) {
            Credential memory credential = _credentials[ids[i]];
            if (isCredentialActive(ids[i]) && keccak256(bytes(credential.category)) == keccak256(bytes(category))) total += credential.score;
        }
    }

    function verifyEvidence(uint256 credentialId, bytes32 candidateHash) external view returns (bool) {
        Credential memory credential = _credentials[credentialId];
        return credential.id != 0 && credential.evidenceHash != bytes32(0) && credential.evidenceHash == candidateHash;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "URI query for nonexistent token");
        return string.concat("https://verity.local/passport/", _toString(tokenId));
    }

    // Soulbound enforcement: minting is allowed, every token movement and approval is rejected.
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0), "Soulbound token is non-transferable");
        return super._update(to, tokenId, auth);
    }

    function approve(address, uint256) public pure override { revert("Soulbound token is non-transferable"); }
    function setApprovalForAll(address, bool) public pure override { revert("Soulbound token is non-transferable"); }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value; uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) { digits--; buffer[digits] = bytes1(uint8(48 + uint256(value % 10))); value /= 10; }
        return string(buffer);
    }
}

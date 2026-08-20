import { ethers } from "ethers";
import QRCode from "qrcode";

const ABI = [
  "function createProfile() returns (uint256)",
  "function requestIssuer(string name,string website,string organizationType)",
  "function setIssuerStatus(address issuer,uint8 status)",
  "function issueCredential(address recipient,string category,string title,string description,uint64 issueDate,uint64 expiryDate,uint32 score,bytes32 evidenceHash) returns (uint256)",
  "function revokeCredential(uint256 credentialId,string reason)",
  "function passportToken(address) view returns (uint256)",
  "function issuers(address) view returns (string name,string website,string organizationType,uint8 status,uint64 requestedAt)",
  "function getCredential(uint256) view returns (uint256 id,address recipient,address issuer,string category,string title,string description,uint64 issueDate,uint64 expiryDate,uint32 score,bytes32 evidenceHash,uint8 status)",
  "function getHolderCredentials(address) view returns (uint256[])",
  "function getIssuerCredentials(address) view returns (uint256[])",
  "function getHolders() view returns (address[])",
  "function getIssuerRegistry() view returns (address[])",
  "function reputationScore(address) view returns (uint256)",
  "function categoryScore(address,string) view returns (uint256)",
  "function verifyEvidence(uint256,bytes32) view returns (bool)",
  "function totalCredentials() view returns (uint256)",
  "function revokedCredentials() view returns (uint256)",
  "function owner() view returns (address)",
  "event CredentialIssued(uint256 indexed credentialId,address indexed recipient,address indexed issuer,bytes32 evidenceHash,uint256 score)",
  "event CredentialRevoked(uint256 indexed credentialId,address indexed issuer,string reason)"
];

const CATEGORY_LIST = ["Academic", "Technical", "Research", "Hackathon", "Open Source", "Professional", "Leadership", "Community", "Sports"];
const SCORE_BY_TYPE = { hackathon: 100, certification: 40, research: 100, internship: 40, opensource: 75, leadership: 50, community: 20, academic: 25 };
const STATUS_NAMES = ["ACTIVE", "REVOKED"];
const MODE_KEY = "verity-mode";

const DEMO_WALLET = "0x9f3a7b24d031cee6b9c812000000000000000000";
const DEMO_ISSUERS = { vit: "0x1111111111111111111111111111111111111111", cloud: "0x2222222222222222222222222222222222222222", lab: "0x3333333333333333333333333333333333333333" };
const DEMO_CREDENTIALS = [
  { id: "VC-2026-0017", recipient: DEMO_WALLET, issuer: DEMO_ISSUERS.vit, issuerName: "VIT Chennai", category: "Hackathon", title: "VITISH 2026 Winner", description: "First place in the annual software innovation challenge.", issueDate: "2026-08-16", expiryDate: "", score: 100, evidenceHash: "0x" + "a1".repeat(32), status: "ACTIVE", evidenceName: "vitish-2026-winner.pdf" },
  { id: "VC-2026-0021", recipient: DEMO_WALLET, issuer: DEMO_ISSUERS.cloud, issuerName: "CloudCert Pro", category: "Technical", title: "Cloud Architecture Professional", description: "Professional certification in cloud architecture and security.", issueDate: "2026-07-04", expiryDate: "2029-07-04", score: 120, evidenceHash: "0x" + "b2".repeat(32), status: "ACTIVE", evidenceName: "cloud-architecture.pdf" },
  { id: "VC-2026-0032", recipient: DEMO_WALLET, issuer: DEMO_ISSUERS.lab, issuerName: "VIT Research Cell", category: "Research", title: "Research Publication · IEEE", description: "Peer-reviewed publication in distributed systems.", issueDate: "2026-05-28", expiryDate: "", score: 180, evidenceHash: "0x" + "c3".repeat(32), status: "ACTIVE", evidenceName: "ieee-publication.pdf" },
  { id: "VC-2026-0009", recipient: DEMO_WALLET, issuer: DEMO_ISSUERS.vit, issuerName: "VIT Chennai", category: "Open Source", title: "Major Open Source Contribution", description: "Merged contribution to the Verity protocol SDK.", issueDate: "2026-04-18", expiryDate: "", score: 95, evidenceHash: "0x" + "d4".repeat(32), status: "ACTIVE", evidenceName: "github-contribution.png" },
  { id: "VC-2025-0091", recipient: DEMO_WALLET, issuer: DEMO_ISSUERS.vit, issuerName: "VIT Chennai", category: "Leadership", title: "Student Technical Lead", description: "Led a 12-person student engineering team.", issueDate: "2025-11-12", expiryDate: "", score: 80, evidenceHash: "0x" + "e5".repeat(32), status: "ACTIVE", evidenceName: "leadership-letter.pdf" },
  { id: "VC-2025-0062", recipient: DEMO_WALLET, issuer: DEMO_ISSUERS.vit, issuerName: "VIT Chennai", category: "Community", title: "Community Volunteer · 120 hours", description: "Documented community technology education contribution.", issueDate: "2025-09-14", expiryDate: "", score: 67, evidenceHash: "0x" + "f6".repeat(32), status: "ACTIVE", evidenceName: "volunteer-record.pdf" },
  { id: "VC-2025-0044", recipient: DEMO_WALLET, issuer: DEMO_ISSUERS.vit, issuerName: "VIT Chennai", category: "Academic", title: "Dean's List · 2025", description: "Academic distinction for sustained performance.", issueDate: "2025-06-01", expiryDate: "", score: 100, evidenceHash: "0x" + "17".repeat(32), status: "ACTIVE", evidenceName: "deans-list.pdf" },
  { id: "VC-2025-0088", recipient: DEMO_WALLET, issuer: DEMO_ISSUERS.cloud, issuerName: "CloudCert Pro", category: "Technical", title: "Container Security Associate", description: "Credential revoked by issuer after an administrative correction.", issueDate: "2025-03-11", expiryDate: "2028-03-11", score: 40, evidenceHash: "0x" + "28".repeat(32), status: "REVOKED", evidenceName: "container-security.pdf" },
  { id: "VC-2024-0024", recipient: DEMO_WALLET, issuer: DEMO_ISSUERS.vit, issuerName: "VIT Chennai", category: "Professional", title: "Industry Internship", description: "Completed a software engineering internship.", issueDate: "2024-06-12", expiryDate: "2025-06-12", score: 40, evidenceHash: "0x" + "39".repeat(32), status: "EXPIRED", evidenceName: "internship-letter.pdf" }
];

const state = {
  mode: localStorage.getItem(MODE_KEY) === "demo" ? "demo" : "live",
  deployment: null,
  provider: null,
  signer: null,
  contract: null,
  account: "",
  profileExists: false,
  credentials: [],
  score: 0,
  categories: Object.fromEntries(CATEGORY_LIST.map((name) => [name, 0])),
  issuerNames: new Map(),
  issuerStatus: 0,
  issuerActivity: [],
  issuerCredentials: [],
  liveRequests: [],
  owner: "",
  blockNumber: 0,
  clerk: null,
  user: null,
  authReady: false,
  publicProfile: false,
  demoIssuers: [
    { address: "0x4444444444444444444444444444444444444444", name: "Open Source Guild", type: "Community organization", status: 1 },
    { address: "0x5555555555555555555555555555555555555555", name: "FutureSkills Academy", type: "Certification body", status: 1 },
    { address: "0x6666666666666666666666666666666666666666", name: "NexGen Labs", type: "Research institution", status: 1 }
  ]
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
const shortAddress = (address = "") => address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "—";
const formatDate = (value) => { if (!value) return "No expiry"; const date = new Date(value); return Number.isNaN(date.valueOf()) ? "—" : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); };
const parseDate = (value) => value ? new Date(value).getTime() : 0;
const today = () => new Date().toISOString().slice(0, 10);

function toast(title, message, type = "success") {
  const item = document.createElement("div");
  item.className = `toast ${type}`;
  item.innerHTML = `<div class="toast-icon">${type === "error" ? "!" : type === "warn" ? "i" : "✓"}</div><div><strong>${esc(title)}</strong><span>${esc(message)}</span></div>`;
  $("#toastRegion").append(item);
  setTimeout(() => item.remove(), 4800);
}

function tierFor(score) {
  if (score >= 850) return "DIAMOND";
  if (score >= 650) return "PLATINUM";
  if (score >= 450) return "GOLD";
  if (score >= 250) return "SILVER";
  if (score >= 100) return "BRONZE";
  return "STARTER";
}

function credentialStatus(credential) {
  if (credential.status === "REVOKED") return "REVOKED";
  if (credential.expiryDate && parseDate(credential.expiryDate) <= Date.now()) return "EXPIRED";
  return "ACTIVE";
}

function setMode(mode) {
  state.mode = mode;
  localStorage.setItem(MODE_KEY, mode);
  const toggle = $("#modeToggle");
  toggle.classList.toggle("demo", mode === "demo");
  $("#modeLabel").textContent = mode === "demo" ? "Demo mode" : "Live mode";
  if (mode === "demo") {
    state.account = DEMO_WALLET;
    state.profileExists = true;
    state.credentials = DEMO_CREDENTIALS.map((credential) => ({ ...credential }));
    state.score = state.credentials.filter((credential) => credentialStatus(credential) === "ACTIVE").reduce((sum, credential) => sum + credential.score, 0);
    state.issuerStatus = 2;
    state.issuerNames = new Map(Object.entries({ [DEMO_ISSUERS.vit]: "VIT Chennai", [DEMO_ISSUERS.cloud]: "CloudCert Pro", [DEMO_ISSUERS.lab]: "VIT Research Cell" }));
    state.issuerActivity = state.credentials.slice(0, 3);
    state.issuerCredentials = state.credentials.filter((credential) => credential.issuer === DEMO_ISSUERS.vit);
    state.owner = DEMO_ISSUERS.vit;
    state.blockNumber = 0;
    calculateCategories();
    renderAll();
    toast("Demo mode enabled", "Seeded data is local to this browser. Switch back to live mode for wallet and contract data.", "warn");
  } else {
    state.account = ""; state.profileExists = false; state.credentials = []; state.score = 0; state.issuerStatus = 0; state.issuerNames = new Map(); state.issuerActivity = []; state.issuerCredentials = []; state.liveRequests = []; state.owner = ""; state.blockNumber = 0; calculateCategories(); renderAll();
    toast("Live mode enabled", "No demo data is loaded. Connect a wallet to read the deployed contract.");
    if (state.provider) refreshLive();
  }
}

function calculateCategories() {
  state.categories = Object.fromEntries(CATEGORY_LIST.map((name) => [name, 0]));
  for (const credential of state.credentials) if (credentialStatus(credential) === "ACTIVE") state.categories[credential.category] = (state.categories[credential.category] || 0) + Number(credential.score);
}

function renderAll() {
  renderAuth(); renderIdentity(); renderNetwork(); renderScore(); renderBreakdown(); renderRecent(); renderHistory(); renderCredentialMetrics(); renderCredentials(); renderReputation(); renderIssuerMetrics(); renderIssuerActivity(); renderAdmin(); renderModeDependentUi();
}

function renderModeDependentUi() {
  $$(".demo-only").forEach((element) => { element.hidden = state.mode !== "demo"; });
}

function renderNetwork() {
  const network = state.mode === "demo" ? "Demo scenario" : state.deployment?.network || "Contract not loaded";
  $("#networkLabel").textContent = network;
  $("#sidebarNetworkLabel").textContent = network;
}

function renderAuth() {
  const avatar = $("#authAvatar"); const label = $("#authLabel"); const profile = $("#authButton"); const signup = $("#authSignupButton");
  if (!avatar || !label || !profile) return;
  if (state.mode === "demo") { avatar.textContent = "SM"; label.textContent = "Demo user"; profile.title = "Demo mode profile"; signup.hidden = true; return; }
  if (state.publicProfile) { avatar.textContent = "↗"; label.textContent = "Public view"; profile.title = "Public read-only profile"; signup.hidden = true; return; }
  if (state.user) { const first = state.user.firstName || state.user.username || "User"; avatar.textContent = first.slice(0, 2).toUpperCase(); label.textContent = first; profile.title = "Open account menu"; signup.hidden = true; return; }
  avatar.textContent = "?"; label.textContent = "Sign in"; profile.title = "Sign in with Clerk"; signup.hidden = false;
}

function renderIdentity() {
  const hasWallet = Boolean(state.account);
  const clerkName = state.user ? [state.user.firstName, state.user.lastName].filter(Boolean).join(" ") || state.user.username || "Verified holder" : "";
  const name = state.mode === "demo" ? "Sarvesh M." : state.publicProfile ? "Public holder" : clerkName || (hasWallet ? "Connected holder" : "Wallet not connected");
  const initials = state.mode === "demo" ? "SM" : state.publicProfile ? "↗" : state.user ? (state.user.firstName || state.user.username || "U").slice(0, 2).toUpperCase() : hasWallet ? state.account.slice(2, 4).toUpperCase() : "—";
  $("#identityName").textContent = name; $("#identityInitials").textContent = initials; $("#walletLabel").textContent = state.mode === "demo" ? "Sarvesh M." : hasWallet ? "Connected wallet" : "Connect wallet"; $("#walletAddress").textContent = shortAddress(state.account) || "No wallet";
  $("#identityAddress").innerHTML = `${esc(shortAddress(state.account) || "Connect a wallet to continue")} <button class="copy-button" data-copy="${esc(state.account)}">⧉</button>`;
  $("#identityOrg").textContent = state.mode === "demo" ? "Vellore Institute of Technology" : state.deployment ? `Live contract · ${shortAddress(state.deployment.address)}` : "Deploy the contract and load deployment.json";
  $("#sbtId").textContent = state.profileExists ? (state.mode === "demo" ? "#VT-00842" : `#${state.account ? state.account.slice(-6).toUpperCase() : "—"}`) : "—";
  $("#memberSince").textContent = state.profileExists ? (state.mode === "demo" ? "Aug 2024" : "On-chain") : "—";
  $("#holderNameSuffix").textContent = state.mode === "demo" ? ", Sarvesh" : state.publicProfile ? "" : clerkName ? `, ${clerkName.split(" ")[0]}` : "";
  $("#holderIntro").textContent = state.mode === "demo" ? "A presentation scenario with a complete credential lifecycle." : state.publicProfile ? "Public read-only profile. No wallet authentication is required to verify this record." : state.user ? (state.account ? "Your verified achievements, read directly from the deployed contract." : "Connect a wallet to load your on-chain reputation passport.") : "Sign in with Clerk, then connect a wallet to manage your on-chain reputation passport.";
}

function renderScore() {
  const tier = tierFor(state.score);
  $("#overallScore").textContent = state.score; $("#tierBadge").textContent = tier; $("#tierCopy").textContent = state.mode === "demo" ? "Seeded presentation scenario" : state.account ? "Calculated from active on-chain credentials" : "Connect wallet to load your score";
  $("#scoreSource").textContent = state.mode === "demo" ? "Demo ledger" : state.publicProfile ? "Public ledger" : state.account ? "On-chain ledger" : "Wallet required";
  $("#scoreDelta").textContent = state.mode === "demo" ? "Demo scenario" : state.account ? `${state.credentials.filter((credential) => credentialStatus(credential) === "ACTIVE").length} active credential${state.credentials.filter((credential) => credentialStatus(credential) === "ACTIVE").length === 1 ? "" : "s"}` : "No live data";
  $("#scoreSync").textContent = state.mode === "demo" ? "Local seeded record" : state.account ? "Read from contract" : "Connect wallet";
  $("#reputationMiniScore").textContent = state.score; $("#reputationMiniTier").textContent = tier; $("#ledgerTotal").textContent = state.score;
  $("#chainMeta").textContent = state.mode === "demo" ? "DEMO TIMELINE" : state.blockNumber ? `BLOCK #${state.blockNumber.toLocaleString()}` : "AWAITING WALLET";
}

function renderBreakdown() {
  const entries = Object.entries(state.categories).filter(([, score]) => score > 0).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const list = entries.length ? entries : [["No credentials yet", 0]];
  $("#breakdownGrid").innerHTML = list.slice(0, 8).map(([category, score]) => `<div class="panel breakdown-item"><div class="breakdown-head"><span>${esc(category)}</span><strong>${score}</strong></div><div class="progress-track"><div class="progress-bar" style="width:${Math.min(100, Number(score) / 2.5)}%"></div></div><small>${score ? "Active contribution" : "Issue a credential to begin"}</small></div>`).join("");
}

function symbolFor(category) {
  const paths = {
    Technical: '<path d="M8 6 4 10l4 4M16 6l4 4-4 4M14 4l-4 12"/>',
    Research: '<path d="M9 3h6M10 3v5l-4.5 8.2A2 2 0 0 0 7.2 19h9.6a2 2 0 0 0 1.7-2.8L14 8V3M8 14h8"/>',
    Hackathon: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/>',
    "Open Source": '<path d="M8 8 4 12l4 4M16 8l4 4-4 4M14 5l-4 14"/>',
    Leadership: '<path d="M12 3 20 7v5c0 4.5-3.2 7.3-8 9-4.8-1.7-8-4.5-8-9V7l8-4Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
    Community: '<circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M14 16.5a4.5 4.5 0 0 1 6.5 2.5"/>',
    Academic: '<path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M7 11.5V16c3 2 7 2 10 0v-4.5M21 9v6"/>',
    Professional: '<rect x="4" y="7" width="16" height="12" rx="2"/><path d="M9 7V5h6v2M4 12h16M10 12v2h4v-2"/>',
    Sports: '<circle cx="12" cy="12" r="8"/><path d="m7 7 5 5 5-5M7 17l5-5 5 5"/>'
  };
  return `<svg class="category-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[category] || '<path d="M12 3 20 8v8l-8 5-8-5V8l8-5Z"/><path d="m8 12 2.5 2.5L16 9"/>'}</svg>`;
}
function colorFor(category) { return ({ Technical: "green", Research: "purple", Hackathon: "amber", "Open Source": "green", Leadership: "purple", Community: "amber" })[category] || ""; }
function credentialRow(credential) { const status = credentialStatus(credential); return `<div class="credential-row"><div class="credential-symbol ${colorFor(credential.category)}">${symbolFor(credential.category)}</div><div class="credential-copy"><strong>${esc(credential.title)}</strong><span>${esc(credential.issuerName || shortAddress(credential.issuer))} · ${esc(credential.category)}</span></div><div class="credential-status"><strong class="${status !== "ACTIVE" ? "status-muted" : ""}">${status === "ACTIVE" ? "✓ VERIFIED" : status}</strong><span>${status === "ACTIVE" ? `+${credential.score} pts` : formatDate(credential.expiryDate || credential.issueDate)}</span></div></div>`; }
function renderRecent() { $("#recentCredentials").innerHTML = state.credentials.length ? state.credentials.slice(0, 4).map(credentialRow).join("") : `<div class="empty-state">No credentials are associated with this wallet yet.</div>`; }

function historyItems() {
  return state.credentials.map((credential) => { const status = credentialStatus(credential); return { date: credential.issueDate, title: credential.title, detail: `${credential.issuerName || shortAddress(credential.issuer)} · ${status.toLowerCase()}`, points: status === "ACTIVE" ? `+${credential.score}` : `−${credential.score}`, tone: status === "REVOKED" ? "revoked" : status === "EXPIRED" ? "expired" : "" }; }).sort((a, b) => parseDate(b.date) - parseDate(a.date));
}
function historyItem(item) { return `<div class="history-item"><i class="history-dot ${item.tone}"></i><div class="history-copy"><strong>${esc(item.title)}</strong><span>${esc(item.detail)} · ${formatDate(item.date)}</span></div><span class="history-points ${item.tone === "revoked" ? "negative" : item.tone === "expired" ? "muted" : ""}">${item.points}</span></div>`; }
function renderHistory() { const items = historyItems(); $("#historyList").innerHTML = items.length ? items.slice(0, 5).map(historyItem).join("") : `<div class="empty-state">No score changes to display.</div>`; $("#fullHistoryList").innerHTML = items.length ? items.map((item) => `<div class="full-history-row"><span class="mono">${formatDate(item.date)}</span><strong>${esc(item.title)}</strong><span>${esc(item.detail)}</span><span class="history-points ${item.tone === "revoked" ? "negative" : item.tone === "expired" ? "muted" : ""}">${item.points} pts</span></div>`).join("") : `<div class="empty-state">The timeline will appear after credentials are issued.</div>`; }

function renderCredentialMetrics() {
  const counts = { all: state.credentials.length, active: 0, expired: 0, revoked: 0 };
  for (const credential of state.credentials) counts[credentialStatus(credential).toLowerCase()]++;
  $("#credentialMetric").textContent = counts.all; $("#activeMetric").textContent = counts.active; $("#issuerMetric").textContent = new Set(state.credentials.map((credential) => credential.issuer)).size; $("#evidenceMetric").innerHTML = `${state.credentials.length ? Math.round(state.credentials.filter((credential) => credential.evidenceHash && credential.evidenceHash !== "0x" + "0".repeat(64)).length / state.credentials.length * 100) : 0}<span class="metric-suffix">%</span>`;
  $("#credentialNavCount").textContent = counts.all; $("#allFilterCount").textContent = counts.all; $("#activeFilterCount").textContent = counts.active; $("#expiredFilterCount").textContent = counts.expired; $("#revokedFilterCount").textContent = counts.revoked;
}

function renderCredentials() {
  const filter = $("#credentialFilters .active")?.dataset.filter || "all"; const query = $("#credentialSearch")?.value.trim().toLowerCase() || "";
  const credentials = state.credentials.filter((credential) => (filter === "all" || credentialStatus(credential).toLowerCase() === filter) && (!query || `${credential.title} ${credential.category} ${credential.issuerName} ${credential.id}`.toLowerCase().includes(query)));
  $("#credentialGrid").innerHTML = credentials.length ? credentials.map((credential) => { const status = credentialStatus(credential); return `<article class="panel credential-card"><div class="credential-card-top"><div class="credential-symbol ${colorFor(credential.category)}">${symbolFor(credential.category)}</div><button class="card-menu" data-credential-details="${esc(credential.id)}">View detail</button></div><h3>${esc(credential.title)}</h3><span class="issuer-name">${esc(credential.issuerName || shortAddress(credential.issuer))} · ${esc(credential.category)}</span><div class="credential-card-footer"><div><span class="tag ${status.toLowerCase()}">${status === "ACTIVE" ? "✓ VERIFIED" : status}</span><small>${status === "EXPIRED" ? `Expired ${formatDate(credential.expiryDate)}` : `Issued ${formatDate(credential.issueDate)}`}</small></div><span class="points-badge">${status === "ACTIVE" ? `+${credential.score}` : "—"}</span></div></article>`; }).join("") : `<div class="empty-state">No credentials match this filter.</div>`;
}

function renderReputation() {
  const entries = Object.entries(state.categories).filter(([, score]) => score > 0).sort((a, b) => b[1] - a[1]);
  $("#radarLegend").innerHTML = (entries.length ? entries : [["No active categories", 0]]).slice(0, 7).map(([name, score]) => `<div class="legend-row"><span>${esc(name)}</span><span class="legend-score">${score} <b>/ 250</b></span></div>`).join("");
  $("#scoreLedger").innerHTML = (entries.length ? entries : [["No active credentials", 0]]).map(([name, score]) => `<div class="ledger-row"><div class="ledger-copy"><i></i>${esc(name)}</div><strong>${score}</strong><small><i style="width:${Math.min(100, Number(score) / 2.5)}%"></i></small></div>`).join("");
  const radar = $("#radarChart"); if (radar) radar.innerHTML = `<div class="radar-polygon"></div><span class="radar-label">Technical</span><span class="radar-label">Research</span><span class="radar-label">Leadership</span><span class="radar-label">Community</span><span class="radar-label">Academic</span>`;
}

function renderIssuerActivity() {
  const issuerStatus = $("#issuerStatus");
  if (issuerStatus) {
    const verified = state.mode === "demo" || state.issuerStatus === 2;
    issuerStatus.innerHTML = `<span class="status-dot"></span> ${verified ? "Issuer verified · Manage status" : state.issuerStatus === 1 ? "Issuer request pending" : "Request issuer status"}`;
  }
  const trustCopy = $("#issuerTrustCopy");
  if (trustCopy) trustCopy.textContent = state.mode === "demo" ? "Demo organization · local-only scenario" : state.issuerStatus === 2 ? "Approved on-chain by the Verity administrator" : "Connect a wallet to load issuer status";
  const rows = (state.issuerActivity.length ? state.issuerActivity : state.credentials.slice(0, 3)).map((credential) => `<div class="issuer-activity-row"><div class="activity-avatar">${symbolFor(credential.category)}</div><div><strong>${esc(credential.title)}</strong><span>Recipient ${shortAddress(credential.recipient)} · ${formatDate(credential.issueDate)}</span></div><em>+${credential.score}</em></div>`).join("");
  $("#issuerActivity").innerHTML = rows || `<div class="empty-state">No credentials issued from this wallet.</div>`;
}

function renderIssuerMetrics() {
  const records = state.issuerCredentials || [];
  const active = records.filter((credential) => credentialStatus(credential) === "ACTIVE").length;
  const recipients = new Set(records.map((credential) => credential.recipient)).size;
  const revoked = records.filter((credential) => credentialStatus(credential) === "REVOKED").length;
  $("#issuedMetric").textContent = records.length;
  $("#issuedActiveMetric").textContent = active;
  $("#issuedRecipientsMetric").textContent = recipients;
  $("#issuedRevocationMetric").innerHTML = `${records.length ? Math.round((revoked / records.length) * 100) : 0}<span class="metric-suffix">%</span>`;
  $("#issuerMetricContext").textContent = state.mode === "demo" ? "demo scenario" : state.account ? "from this wallet" : "connect issuer wallet";
  $("#issuerMetricContextActive").textContent = state.mode === "demo" ? "demo scenario" : state.account ? "currently valid" : "no live data";
  $("#issuerMetricContextRecipients").textContent = state.mode === "demo" ? "demo scenario" : state.account ? "on-chain recipients" : "no live data";
  $("#issuerMetricContextRevoked").textContent = state.mode === "demo" ? "demo scenario" : state.account ? "from this wallet" : "no live data";
}

function renderAdmin() {
  const holderCount = state.mode === "demo" ? new Set(state.credentials.map((credential) => credential.recipient)).size : state.profileExists ? 1 : 0;
  const credentialCount = state.mode === "demo" ? state.credentials.length : state.credentials.length;
  const issuerCount = state.mode === "demo" ? new Set(state.credentials.map((credential) => credential.issuer)).size : state.issuerStatus === 2 ? 1 : 0;
  const revocationRate = credentialCount ? Math.round(state.credentials.filter((credential) => credentialStatus(credential) === "REVOKED").length / credentialCount * 100) : 0;
  $("#adminHolderCount").textContent = holderCount; $("#adminCredentialCount").textContent = credentialCount; $("#adminIssuerCount").textContent = issuerCount; $("#adminRevocationRate").textContent = `${revocationRate}%`;
  const context = state.mode === "demo" ? "demo record" : state.account ? "connected wallet" : "wallet required";
  $("#adminHolderContext").textContent = context; $("#adminCredentialContext").textContent = context; $("#adminIssuerContext").textContent = context; $("#adminRevocationContext").textContent = context;
  $("#adminIdentityLabel").textContent = state.mode === "demo" ? "Demo admin" : state.owner ? "Contract owner" : "Admin wallet";
  $("#adminIdentityAddress").textContent = state.mode === "demo" ? "showcase scenario" : shortAddress(state.owner) || "not loaded";
  const requests = state.mode === "demo" ? state.demoIssuers : state.liveRequests || [];
  $("#requestCount").textContent = `${requests.length} pending`;
  $("#issuerRequests").innerHTML = requests.length ? requests.map((request) => `<div class="request-row"><div class="request-logo">◎</div><div class="request-copy"><strong>${esc(request.name)}</strong><span>${esc(request.type)} · ${shortAddress(request.address)}</span></div><div class="request-actions"><button data-approve-issuer="${esc(request.address)}">Approve</button><button class="reject" data-reject-issuer="${esc(request.address)}">Reject</button></div></div>`).join("") : `<div class="empty-state">No pending issuer requests.</div>`;
  const activities = state.mode === "demo" ? state.credentials.slice(0, 3).map((credential) => ({ event: "Credential record", actor: credential.issuerName, reference: credential.id, time: formatDate(credential.issueDate), status: credentialStatus(credential), tone: credentialStatus(credential) === "REVOKED" ? "red-bg" : "green-bg" })) : state.credentials.slice(0, 5).map((credential) => ({ event: credentialStatus(credential) === "REVOKED" ? "Credential revoked" : "Credential issued", actor: credential.issuerName || shortAddress(credential.issuer), reference: credential.id, time: formatDate(credential.issueDate), status: credentialStatus(credential), tone: credentialStatus(credential) === "REVOKED" ? "red-bg" : "green-bg" }));
  $("#auditTable").innerHTML = activities.length ? `<div class="audit-row table-header"><span>Event</span><span>Actor</span><span>Reference</span><span>Date</span><span>Status</span></div>${activities.map((item) => `<div class="audit-row"><span><i class="audit-icon ${item.tone}">${item.tone === "red-bg" ? "×" : "◇"}</i>${esc(item.event)}</span><span>${esc(item.actor)}</span><span class="mono">${esc(item.reference)}</span><span>${esc(item.time)}</span><span class="table-status ${item.tone === "red-bg" ? "revoked" : "valid"}">${esc(item.status)}</span></div>`).join("")}` : `<div class="empty-state">No on-chain activity for this wallet.</div>`;
}

function activateView(viewName) {
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === `view-${viewName}`));
  const label = $(`.nav-item[data-view="${viewName}"] span:nth-child(2)`)?.textContent || viewName;
  $("#breadcrumbCurrent").textContent = label;
  $("#sidebar")?.classList.remove("open");
  if (viewName === "credentials") renderCredentials();
}

function openModal(content) { $("#modalContent").innerHTML = content; $("#modalBackdrop").classList.add("open"); $("#modalBackdrop").setAttribute("aria-hidden", "false"); }
function closeModal() { $("#modalBackdrop").classList.remove("open"); $("#modalBackdrop").setAttribute("aria-hidden", "true"); }

async function openShareModal() {
  if (state.mode === "live" && !state.account) { toast("Connect a wallet first", "A public QR link can only be created for a real on-chain wallet.", "warn"); return; }
  const link = `${location.origin}${location.pathname.replace(/index\.html$/, "") || "/"}?holder=${state.account || DEMO_WALLET}`;
  openModal(`<div class="modal-header"><div><span class="section-kicker">Public profile</span><h2>Share your passport</h2></div><button class="modal-close" data-close-modal aria-label="Close">×</button></div><p>Scan this code to open the read-only profile. The QR encodes the current public URL.</p><div class="qr-box" id="shareQr" aria-label="QR code for public profile"><span class="qr-loading">Generating QR…</span></div><div class="share-url"><span>${esc(link)}</span><button data-copy="${esc(link)}">Copy</button></div><div class="modal-actions"><button class="button secondary" data-close-modal>Close</button><button class="button primary" data-copy="${esc(link)}">Copy public link <span>⧉</span></button></div>`);
  const qrBox = $("#shareQr");
  try {
    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, link, { width: 184, margin: 1, errorCorrectionLevel: "M", color: { dark: "#0b1628", light: "#ffffff" } });
    canvas.setAttribute("aria-label", "Generated QR code"); qrBox.replaceChildren(canvas);
  } catch { qrBox.innerHTML = `<span class="qr-error">QR unavailable. Copy the public link instead.</span>`; }
}

function openTransferModal() { openModal(`<div class="modal-header"><div><span class="section-kicker">Soulbound safeguard</span><h2>Transfer blocked</h2></div><button class="modal-close" data-close-modal>×</button></div><p>A reputation passport is intentionally bound to its holder. There is no buy, sell, transfer, or marketplace path.</p><div class="transfer-warning"><strong>Expected contract behavior</strong><br />A call to transferFrom or safeTransferFrom reverts with <span class="mono">Soulbound token is non-transferable</span>.</div><button class="button primary" data-close-modal>Understood</button>`); }

function openCredentialModal(id) {
  const credential = state.credentials.find((item) => String(item.id) === String(id)); if (!credential) return;
  const status = credentialStatus(credential);
  openModal(`<div class="modal-header"><div><span class="section-kicker">Credential detail</span><h2>${esc(credential.title)}</h2></div><button class="modal-close" data-close-modal>×</button></div><div class="modal-list"><div><span>Status</span><strong>${status}</strong></div><div><span>Credential ID</span><strong class="mono">${esc(credential.id)}</strong></div><div><span>Issuer</span><strong>${esc(credential.issuerName || shortAddress(credential.issuer))}</strong></div><div><span>Recipient</span><strong class="mono">${shortAddress(credential.recipient)}</strong></div><div><span>Reputation contribution</span><strong>${status === "ACTIVE" ? `+${credential.score}` : "0 active"}</strong></div><div><span>Evidence hash</span><strong class="mono">${credential.evidenceHash ? `${credential.evidenceHash.slice(0, 10)}...` : "Not registered"}</strong></div></div>${status === "ACTIVE" && state.mode === "demo" ? `<button class="button primary" data-demo-revoke="${esc(credential.id)}">Revoke in demo</button>` : ""}`);
}

async function loadDeployment() {
  try {
    const response = await fetch("/deployment.json", { cache: "no-store" });
    if (!response.ok) return;
    const deployment = await response.json();
    const isLocalHost = ["localhost", "127.0.0.1"].includes(location.hostname);
    state.deployment = !isLocalHost && deployment.network === "localhost" ? null : deployment;
  } catch { state.deployment = null; }
}

async function initializeClerk() {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) { state.authReady = false; return; }
  try {
    const clerkDomain = atob(publishableKey.split("_")[2]).replace(/\$$/, "");
    await loadClerkUi(clerkDomain);
    const { Clerk } = await import("@clerk/clerk-js");
    state.clerk = new Clerk(publishableKey);
    await state.clerk.load({ ui: { ClerkUI: window.__internal_ClerkUICtor } });
    state.user = state.clerk.user || null;
    state.authReady = true;
    state.clerk.addListener(({ user }) => { state.user = user || null; if (!user && state.mode === "live" && !state.publicProfile) { state.account = ""; state.profileExists = false; state.credentials = []; state.score = 0; calculateCategories(); } renderAll(); });
  } catch (error) { state.authReady = false; toast("Authentication unavailable", readableError(error), "error"); }
}

function loadClerkUi(clerkDomain) {
  if (window.__internal_ClerkUICtor) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-verity-clerk-ui]");
    const script = existing || document.createElement("script");
    const finish = () => window.__internal_ClerkUICtor ? resolve() : reject(new Error("Clerk UI bundle did not expose its component constructor"));
    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", () => reject(new Error("Failed to load Clerk UI bundle")), { once: true });
    if (!existing) {
      script.dataset.verityClerkUi = "true";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.src = `https://${clerkDomain}/npm/@clerk/ui@1/dist/ui.browser.js`;
      document.head.appendChild(script);
    }
    if (window.__internal_ClerkUICtor) finish();
  });
}

async function openAuthControl() {
  if (state.mode === "demo" || state.publicProfile) { toast("Authentication is not needed here", state.mode === "demo" ? "Demo mode is intentionally local-only." : "This is a public read-only profile.", "warn"); return; }
  if (!state.clerk) { toast("Clerk is not configured", "Add VITE_CLERK_PUBLISHABLE_KEY to .env.local and restart the dev server.", "error"); return; }
  if (state.user) await state.clerk.openUserProfile(); else await state.clerk.openSignIn({ signUpForceRedirectUrl: location.href, afterSignInUrl: location.href });
}

async function openSignUp() {
  if (!state.clerk) { toast("Clerk is not configured", "Add VITE_CLERK_PUBLISHABLE_KEY to .env.local and restart the dev server.", "error"); return; }
  await state.clerk.openSignUp({ afterSignUpUrl: location.href, signInUrl: location.href });
}

async function syncWalletToClerk() {
  if (!state.user || !state.account || typeof state.user.update !== "function") return;
  try {
    const existing = state.user.unsafeMetadata || {};
    if (existing.walletAddress !== state.account) await state.user.update({ unsafeMetadata: { ...existing, walletAddress: state.account } });
  } catch (error) { toast("Wallet link not saved", "The wallet is connected, but Clerk metadata could not be updated.", "warn"); }
}

async function connectWallet() {
  if (state.mode === "demo") { setMode("live"); return; }
  if (!state.publicProfile && !state.user) { await openAuthControl(); toast("Sign in first", "Clerk authentication is required before linking a wallet.", "warn"); return; }
  if (!window.ethereum) { toast("Wallet not detected", "Install MetaMask or another EIP-1193 wallet, then try again.", "error"); return; }
  if (!state.deployment?.address) { toast("Contract not configured", "Run npm run chain, then npm run deploy. The app reads public/deployment.json.", "error"); return; }
  try {
    state.provider = new ethers.BrowserProvider(window.ethereum);
    await state.provider.send("eth_requestAccounts", []);
    state.signer = await state.provider.getSigner(); state.account = await state.signer.getAddress();
    await syncWalletToClerk();
    state.contract = new ethers.Contract(state.deployment.address, ABI, state.signer);
    const network = await state.provider.getNetwork(); if (state.deployment.chainId && Number(network.chainId) !== Number(state.deployment.chainId)) { toast("Wrong network", `Switch your wallet to chain ID ${state.deployment.chainId}.`, "error"); return; }
    await refreshLive(); toast("Wallet connected", `Reading live data for ${shortAddress(state.account)}.`);
  } catch (error) { toast("Wallet connection failed", readableError(error), "error"); }
}

async function refreshLive() {
  if (state.mode !== "live" || !state.contract || !state.account) { renderAll(); return; }
  try {
    const tokenId = await state.contract.passportToken(state.account); state.profileExists = tokenId !== 0n;
    state.credentials = []; state.issuerCredentials = []; state.score = 0; state.issuerNames = new Map(); state.owner = await state.contract.owner(); state.blockNumber = state.provider?.getBlockNumber ? await state.provider.getBlockNumber() : 0;
    const issuer = await state.contract.issuers(state.account); state.issuerStatus = Number(issuer.status);
    if (state.profileExists) {
      const ids = await state.contract.getHolderCredentials(state.account);
      for (const id of ids) { const raw = await state.contract.getCredential(id); const credential = await liveCredential(raw); state.credentials.push(credential); }
      state.score = Number(await state.contract.reputationScore(state.account));
      for (const category of CATEGORY_LIST) state.categories[category] = Number(await state.contract.categoryScore(state.account, category));
    } else calculateCategories();
    if (state.issuerStatus === 2) { const ids = await state.contract.getIssuerCredentials(state.account); state.issuerCredentials = []; for (const id of ids) state.issuerCredentials.push(await liveCredential(await state.contract.getCredential(id))); state.issuerActivity = state.issuerCredentials.slice(-5).reverse(); } else state.issuerActivity = [];
    const requestAddresses = await state.contract.getIssuerRegistry(); state.liveRequests = []; for (const address of requestAddresses) { const record = await state.contract.issuers(address); if (Number(record.status) === 1) state.liveRequests.push({ address, name: record.name, type: record.organizationType, status: Number(record.status) }); }
    renderAll();
  } catch (error) { toast("Could not read contract", readableError(error), "error"); }
}

async function liveCredential(raw) {
  const issuerAddress = raw.issuer; let issuerName = state.issuerNames.get(issuerAddress) || "Verified issuer";
  if (!state.issuerNames.has(issuerAddress) && state.contract) { try { const issuer = await state.contract.issuers(issuerAddress); issuerName = issuer.name || issuerName; state.issuerNames.set(issuerAddress, issuerName); } catch {} }
  const issueDate = new Date(Number(raw.issueDate) * 1000).toISOString().slice(0, 10); const expiryDate = raw.expiryDate > 0n ? new Date(Number(raw.expiryDate) * 1000).toISOString().slice(0, 10) : "";
  return { id: raw.id.toString(), recipient: raw.recipient, issuer: issuerAddress, issuerName, category: raw.category, title: raw.title, description: raw.description, issueDate, expiryDate, score: Number(raw.score), evidenceHash: raw.evidenceHash, status: STATUS_NAMES[Number(raw.status)] || "INVALID" };
}

async function createProfile() {
  if (state.mode === "demo") { toast("Demo profile already exists", "Switch to live mode to create a real on-chain profile.", "warn"); return; }
  if (!state.contract) return connectWallet();
  try { toast("Confirm transaction", "Create profile in your wallet to mint your one-per-wallet soulbound NFT.", "warn"); const tx = await state.contract.createProfile(); await tx.wait(); await refreshLive(); toast("Profile created", "Your soulbound reputation identity is now on-chain."); } catch (error) { toast("Profile creation failed", readableError(error), "error"); }
}

function readableError(error) { const text = error?.shortMessage || error?.reason || error?.message || "Unknown transaction error"; return text.replace(/^execution reverted: /i, "").slice(0, 180); }

async function hashFile(file) { const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer()); return `0x${[...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`; }

async function issueCredential(event) {
  event.preventDefault(); const form = new FormData(event.currentTarget); const type = form.get("type"); const file = form.get("evidence"); const level = Number(form.get("level") || 1); const score = Math.round((SCORE_BY_TYPE[type] || 25) * level); const evidenceHash = file instanceof File && file.size ? await hashFile(file) : `0x${"0".repeat(64)}`;
  const raw = { recipient: String(form.get("recipient")).trim(), category: String(form.get("category")), title: String(form.get("title")).trim(), description: String(form.get("description")).trim(), issueDate: String(form.get("issueDate") || today()), expiryDate: String(form.get("expiry") || ""), score, evidenceHash, issuer: state.account, issuerName: state.mode === "demo" ? "VIT Chennai" : "Connected issuer", status: "ACTIVE", evidenceName: file instanceof File ? file.name : "" };
  if (!ethers.isAddress(raw.recipient)) { toast("Invalid recipient", "Use a valid EVM wallet address.", "error"); return; }
  if (!raw.title || !raw.description) { toast("Missing credential data", "Title and description are required.", "error"); return; }
  if (state.mode === "demo") { const next = state.credentials.length + 1; const credential = { ...raw, id: `VC-DEMO-${String(next).padStart(4, "0")}`, issuer: DEMO_ISSUERS.vit, issuerName: "VIT Chennai" }; state.credentials.unshift(credential); state.score = state.credentials.filter((item) => credentialStatus(item) === "ACTIVE").reduce((sum, item) => sum + item.score, 0); calculateCategories(); renderAll(); event.currentTarget.reset(); toast("Demo credential issued", `Added ${raw.title} with +${score} points. This did not touch a blockchain.`, "warn"); return; }
  if (!state.contract || !state.account) { toast("Connect issuer wallet", "Live issuance requires a wallet and an approved issuer address.", "error"); return; }
  try {
    const record = await state.contract.issuers(state.account); if (Number(record.status) !== 2) { toast("Issuer not approved", "Submit an issuer request, then have the contract owner approve this wallet.", "error"); return; }
    const issueTimestamp = Math.floor(parseDate(raw.issueDate) / 1000); const expiryTimestamp = raw.expiryDate ? Math.floor(parseDate(raw.expiryDate) / 1000) : 0;
    toast("Confirm issuance", "Review the credential transaction in your wallet.", "warn"); const tx = await state.contract.issueCredential(raw.recipient, raw.category, raw.title, raw.description, issueTimestamp, expiryTimestamp, score, evidenceHash); await tx.wait(); await refreshLive(); event.currentTarget.reset(); toast("Credential issued", "The achievement and evidence fingerprint are now on-chain.");
  } catch (error) { toast("Issuance failed", readableError(error), "error"); }
}

async function verifyCredential(id) {
  const query = String(id || $("#verifyInput").value).trim(); if (!query) { toast("Enter a credential ID", "Try one of the public demo IDs or use a deployed credential ID.", "warn"); return; }
  let credential;
  if (state.mode === "demo") credential = state.credentials.find((item) => item.id.toLowerCase() === query.toLowerCase()) || (query.toLowerCase() === DEMO_WALLET.toLowerCase() ? state.credentials[0] : null);
  else if (state.contract && /^\d+$/.test(query)) { try { credential = await liveCredential(await state.contract.getCredential(query)); } catch {} }
  if (!credential) { $("#verificationResult").className = "panel verification-result empty-result"; $("#verificationResult").innerHTML = `<div class="empty-result-icon">×</div><h2>Credential not found</h2><p>No on-chain record matched <span class="mono">${esc(query)}</span>.</p><div class="result-hint"><span class="green-dot"></span> Search is case-sensitive for contract IDs</div>`; return; }
  renderVerificationResult(credential);
}

function renderVerificationResult(credential) {
  const status = credentialStatus(credential); const valid = status === "ACTIVE"; $("#verificationResult").className = "panel verification-result"; $("#verificationResult").innerHTML = `<div class="result-card-head"><div><span class="section-kicker">${state.mode === "demo" ? "Demo credential record" : "On-chain credential record"}</span><h2>${esc(credential.title)}</h2><p>${esc(credential.issuerName || shortAddress(credential.issuer))} · ${esc(credential.category)}</p></div><span class="big-valid ${valid ? "" : "big-invalid"}">${valid ? "✓ VALID" : `✕ ${status}`}</span></div><div class="result-facts"><div class="result-fact"><span>Credential ID</span><strong class="mono">${esc(credential.id)}</strong></div><div class="result-fact"><span>Recipient</span><strong class="mono">${shortAddress(credential.recipient)}</strong></div><div class="result-fact"><span>Issuer status</span><strong>✓ Verified issuer</strong></div><div class="result-fact"><span>Issued</span><strong>${formatDate(credential.issueDate)}</strong></div><div class="result-fact"><span>Expiry</span><strong>${formatDate(credential.expiryDate)}</strong></div><div class="result-fact"><span>Active contribution</span><strong>${valid ? `+${credential.score} points` : "0 points"}</strong></div></div><div class="result-link"><span>Evidence integrity</span><span><span class="mono">${credential.evidenceHash && credential.evidenceHash !== "0x" + "0".repeat(64) ? `${credential.evidenceHash.slice(0, 14)}...` : "No evidence hash"}</span> <button class="text-button" data-check-evidence="${esc(credential.id)}">Check a file →</button></span></div><input id="verifyEvidenceFile" type="file" accept=".pdf,image/*" hidden />`;
}

async function checkEvidence(id) {
  const credential = state.credentials.find((item) => String(item.id) === String(id)); const input = $("#verifyEvidenceFile"); if (!credential || !input) return; input.click(); input.onchange = async () => { const file = input.files?.[0]; if (!file) return; const candidate = await hashFile(file); const matches = state.mode === "demo" ? candidate === credential.evidenceHash : await state.contract.verifyEvidence(id, candidate); toast(matches ? "Evidence verified" : "Evidence mismatch", matches ? "The selected file matches the registered fingerprint." : "The selected file does not match the registered credential evidence.", matches ? "success" : "error"); };
}

async function revokeCredential(id) {
  const credential = state.credentials.find((item) => String(item.id) === String(id)); if (!credential) return;
  if (state.mode === "demo") { credential.status = "REVOKED"; state.score = state.credentials.filter((item) => credentialStatus(item) === "ACTIVE").reduce((sum, item) => sum + item.score, 0); calculateCategories(); renderAll(); closeModal(); toast("Demo credential revoked", "The history remains visible, but its contribution is removed.", "warn"); return; }
  if (!state.contract) return; try { const tx = await state.contract.revokeCredential(id, "Revoked by issuing organization"); await tx.wait(); await refreshLive(); closeModal(); toast("Credential revoked", "The on-chain record remains auditable and no longer contributes to reputation.", "warn"); } catch (error) { toast("Revocation failed", readableError(error), "error"); }
}

async function setIssuerStatus(address, status) {
  if (state.mode === "demo") { state.demoIssuers = state.demoIssuers.filter((item) => item.address !== address); renderAdmin(); toast(status === 2 ? "Demo issuer approved" : "Demo request rejected", "This action is local to demo mode.", "warn"); return; }
  if (!state.contract) return connectWallet(); try { const tx = await state.contract.setIssuerStatus(address, status); await tx.wait(); await refreshLive(); toast(status === 2 ? "Issuer approved" : "Issuer rejected", "The issuer registry was updated on-chain."); } catch (error) { toast("Issuer update failed", readableError(error), "error"); }
}

function openIssuerRequestModal() { openModal(`<div class="modal-header"><div><span class="section-kicker">Issuer registry</span><h2>Request issuer status</h2></div><button class="modal-close" data-close-modal>×</button></div><p>Submit an organization identity for administrator review. This creates a pending on-chain request.</p><form id="issuerRequestForm"><label class="modal-field">Organization name<input required name="name" placeholder="Your organization" /></label><label class="modal-field">Website<input name="website" placeholder="https://" /></label><label class="modal-field">Organization type<select name="type"><option>University</option><option>Company</option><option>Certification body</option><option>Community organization</option><option>Research institution</option></select></label><button class="button primary" type="submit">Submit request <span>→</span></button></form>`); }

async function requestIssuer(event) { event.preventDefault(); const form = new FormData(event.currentTarget); if (state.mode === "demo") { closeModal(); toast("Demo request submitted", "A pending issuer request was added to the local scenario.", "warn"); return; } if (!state.contract) return connectWallet(); try { const tx = await state.contract.requestIssuer(form.get("name"), form.get("website"), form.get("type")); await tx.wait(); closeModal(); await refreshLive(); toast("Issuer request submitted", "The contract owner can now approve this wallet."); } catch (error) { toast("Request failed", readableError(error), "error"); } }

async function initialize() {
  await Promise.all([loadDeployment(), initializeClerk()]);
  const issueDate = $("#issueDateInput"); if (issueDate) issueDate.value = today();
  const publicHolder = new URLSearchParams(location.search).get("holder");
  if (state.mode === "demo") setMode("demo"); else if (publicHolder && ethers.isAddress(publicHolder) && state.deployment?.address) {
    state.publicProfile = true;
    state.account = publicHolder;
    state.provider = new ethers.JsonRpcProvider(state.deployment.rpcUrl || "http://127.0.0.1:8545");
    state.contract = new ethers.Contract(state.deployment.address, ABI, state.provider);
    await refreshLive();
    toast("Public profile", `Read-only profile for ${shortAddress(publicHolder)}. No wallet is required.`);
  } else renderAll();
  $("#walletButton").addEventListener("click", () => state.account && !state.profileExists && state.mode === "live" ? createProfile() : connectWallet());
  $("#authButton").addEventListener("click", openAuthControl);
  $("#authSignupButton").addEventListener("click", openSignUp);
  $("#notificationsButton").addEventListener("click", () => toast("No new alerts", state.mode === "demo" ? "Demo notifications are disabled." : "Credential and issuer events will appear here when enabled."));
  $("#networkSelector").addEventListener("click", () => toast("Network selection", state.deployment ? `Connected to ${state.deployment.network} · chain ${state.deployment.chainId}. Change networks in your wallet.` : "Deploy the contract to configure a network."));
  $("#modeToggle").addEventListener("click", () => setMode(state.mode === "demo" ? "live" : "demo"));
  $("#mobileMenu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
  $$(".nav-item").forEach((item) => item.addEventListener("click", () => activateView(item.dataset.view)));
  document.addEventListener("click", async (event) => {
    const target = event.target.closest("[data-view-target]"); if (target) activateView(target.dataset.viewTarget);
    const view = event.target.closest("[data-view]"); if (view && !view.classList.contains("nav-item")) activateView(view.dataset.view);
    if (event.target.closest("[data-action=share]")) openShareModal();
    if (event.target.closest("[data-action=transfer]")) openTransferModal();
    if (event.target.closest("[data-action=verify]")) activateView("verify");
    if (event.target.closest("[data-action=export]")) { const blob = new Blob([JSON.stringify({ wallet: state.account, score: state.score, credentials: state.credentials }, null, 2)], { type: "application/json" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "verity-reputation-record.json"; link.click(); URL.revokeObjectURL(link.href); toast("Record exported", "A JSON copy of the current record was downloaded."); }
    if (event.target.closest("[data-action=issuerExport]")) { const blob = new Blob([JSON.stringify({ issuer: state.account, credentials: state.issuerActivity }, null, 2)], { type: "application/json" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "verity-issuer-record.json"; link.click(); URL.revokeObjectURL(link.href); toast("Issuer record exported", "The current issuer activity was downloaded."); }
    if (event.target.closest("[data-action=savePolicy]")) toast("Policy is contract-controlled", "Scoring policy editing is intentionally disabled until the policy contract is deployed.", "warn");
    if (event.target.closest("[data-action=viewAudit]")) toast("Audit log", "The latest platform events are shown in the table below.");
    if (event.target.closest("[data-action=requestIssuer]")) openIssuerRequestModal();
    if (event.target.closest("[data-close-modal]") || event.target === $("#modalBackdrop")) closeModal();
    const copyTarget = event.target.closest("[data-copy]"); if (copyTarget) { try { await navigator.clipboard.writeText(copyTarget.dataset.copy); toast("Copied", "Copied to clipboard."); } catch { toast("Copy unavailable", "Select the text manually.", "warn"); } }
    const details = event.target.closest("[data-credential-details]"); if (details) openCredentialModal(details.dataset.credentialDetails);
    const demoRevoke = event.target.closest("[data-demo-revoke]"); if (demoRevoke) revokeCredential(demoRevoke.dataset.demoRevoke);
    const check = event.target.closest("[data-check-evidence]"); if (check) checkEvidence(check.dataset.checkEvidence);
    const approve = event.target.closest("[data-approve-issuer]"); if (approve) setIssuerStatus(approve.dataset.approveIssuer, 2);
    const reject = event.target.closest("[data-reject-issuer]"); if (reject) setIssuerStatus(reject.dataset.rejectIssuer, 3);
    const verifyId = event.target.closest("[data-verify-id]"); if (verifyId) { $("#verifyInput").value = verifyId.dataset.verifyId; verifyCredential(verifyId.dataset.verifyId); }
  });
  $("#verifyButton").addEventListener("click", () => verifyCredential()); $("#verifyInput").addEventListener("keydown", (event) => { if (event.key === "Enter") verifyCredential(); }); $("#credentialSearch").addEventListener("input", renderCredentials);
  document.addEventListener("submit", (event) => { if (event.target.id === "issuerRequestForm") requestIssuer(event); });
  $$("#credentialFilters .filter-tab").forEach((tab) => tab.addEventListener("click", () => { $$("#credentialFilters .filter-tab").forEach((item) => item.classList.remove("active")); tab.classList.add("active"); renderCredentials(); }));
  $("#issueForm").addEventListener("submit", issueCredential); $("#issuerRequestForm")?.addEventListener("submit", requestIssuer);
  $("#evidenceInput").addEventListener("change", (event) => { const file = event.target.files?.[0]; if (file) { $("#uploadTitle").textContent = file.name; $("#uploadMeta").textContent = `${Math.round(file.size / 1024)} KB · SHA-256 before registration`; } });
  if (window.ethereum) window.ethereum.on?.("accountsChanged", () => state.mode === "live" && refreshLive());
}

initialize();

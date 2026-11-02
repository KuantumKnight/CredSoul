import { ethers } from "ethers";
import QRCode from "qrcode";
import "@fontsource-variable/manrope";
import "@fontsource/dm-mono/latin-400.css";
import fingerprint from "@phosphor-icons/core/assets/regular/fingerprint.svg?raw";
import arrowUpRight from "@phosphor-icons/core/assets/regular/arrow-up-right.svg?raw";
import scan from "@phosphor-icons/core/assets/regular/scan.svg?raw";
import lock from "@phosphor-icons/core/assets/regular/lock-simple.svg?raw";
import sparkle from "@phosphor-icons/core/assets/regular/sparkle.svg?raw";
import bell from "@phosphor-icons/core/assets/regular/bell.svg?raw";
import copy from "@phosphor-icons/core/assets/regular/copy.svg?raw";
import code from "@phosphor-icons/core/assets/regular/code.svg?raw";
import flask from "@phosphor-icons/core/assets/regular/flask.svg?raw";
import trophy from "@phosphor-icons/core/assets/regular/trophy.svg?raw";
import gitBranch from "@phosphor-icons/core/assets/regular/git-branch.svg?raw";
import shield from "@phosphor-icons/core/assets/regular/shield-check.svg?raw";
import users from "@phosphor-icons/core/assets/regular/users.svg?raw";
import graduation from "@phosphor-icons/core/assets/regular/graduation-cap.svg?raw";
import briefcase from "@phosphor-icons/core/assets/regular/briefcase.svg?raw";
import house from "@phosphor-icons/core/assets/regular/house.svg?raw";
import cube from "@phosphor-icons/core/assets/regular/cube.svg?raw";
import chart from "@phosphor-icons/core/assets/regular/chart-donut.svg?raw";
import magnifyingGlass from "@phosphor-icons/core/assets/regular/magnifying-glass.svg?raw";
import squares from "@phosphor-icons/core/assets/regular/squares-four.svg?raw";

const icons = { fingerprint, "arrow-up-right": arrowUpRight, scan, lock, sparkle, bell, copy };
const decorativeIcon = (svg) => svg.replace("<svg ", '<svg aria-hidden="true" focusable="false" ');
document.querySelectorAll("[data-icon]").forEach((element) => { element.innerHTML = decorativeIcon(icons[element.dataset.icon]); });
document.querySelector("#notificationsButton").innerHTML = decorativeIcon(bell);
const navigationIcons = { overview: house, credentials: cube, reputation: chart, verify: magnifyingGlass, issuer: arrowUpRight, admin: squares };
document.querySelectorAll(".nav-item").forEach((element) => { element.querySelector(".nav-icon").innerHTML = decorativeIcon(navigationIcons[element.dataset.view]); });
document.querySelector('.nav-item.active').setAttribute('aria-current', 'page');

const ABI = [
  "function createProfile() returns (uint256)",
  "function createProfileFor(address recipient) returns (uint256)",
  "function requestIssuer(string name,string website,string organizationType)",
  "function setIssuerStatus(address issuer,uint8 status)",
  "function issueCredential(address recipient,string category,string title,string description,uint64 issueDate,uint64 expiryDate,uint32 score,bytes32 evidenceHash) returns (uint256)",
  "function revokeCredential(uint256 credentialId,string reason)",
  "function passportToken(address) view returns (uint256)",
  "function issuers(address) view returns (string name,string website,string organizationType,uint8 status,uint64 requestedAt)",
  "function getCredential(uint256) view returns (tuple(uint256 id,address recipient,address issuer,string category,string title,string description,uint64 issueDate,uint64 expiryDate,uint32 score,bytes32 evidenceHash,uint8 status))",
  "function getHolderCredentials(address) view returns (uint256[])",
  "function getIssuerCredentials(address) view returns (uint256[])",
  "function getHolderCredentialCount(address) view returns (uint256)",
  "function getIssuerCredentialCount(address) view returns (uint256)",
  "function getCredentials(uint256[]) view returns (tuple(uint256 id,address recipient,address issuer,string category,string title,string description,uint64 issueDate,uint64 expiryDate,uint32 score,bytes32 evidenceHash,uint8 status)[])",
  "function getCredentialStatus(uint256) view returns (uint8 status,bool active)",
  "function isIssuerVerified(address) view returns (bool)",
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
const DEFAULT_LOCAL_RPC = "http://127.0.0.1:8545";
const ZERO_EVIDENCE_HASH = `0x${"0".repeat(64)}`;
const APP_NAME = "Verity";
const HARDHAT_CHAIN_ID = "0x7a69";

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
  allCredentials: [],
  score: 0,
  categories: Object.fromEntries(CATEGORY_LIST.map((name) => [name, 0])),
  issuerNames: new Map(),
  issuerStatus: 0,
  issuerActivity: [],
  issuerCredentials: [],
  liveRequests: [],
  liveIssuers: [],
  owner: "",
  blockNumber: 0,
  clerk: null,
  user: null,
  authReady: false,
  publicProfile: false,
  passportCreationPending: false,
  demoPassportHolders: new Set(),
  demoIssuers: [
    { address: DEMO_ISSUERS.vit, name: "VIT Chennai", type: "University", status: 2 },
    { address: DEMO_ISSUERS.cloud, name: "CloudCert Pro", type: "Certification body", status: 2 },
    { address: DEMO_ISSUERS.lab, name: "VIT Research Cell", type: "Research institution", status: 2 },
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
const networkLabel = (deployment) => deployment ? `${deployment.network || "Configured network"} · chain ${deployment.chainId}` : "Contract not loaded";

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
  if (state.passportCreationPending) { toast("Passport creation pending", "Wait for the current request to finish before switching modes.", "warn"); return; }
  state.demoPassportHolders = new Set([DEMO_WALLET, ...DEMO_CREDENTIALS.map((credential) => credential.recipient.toLowerCase())]);
  $("#passportCreationFeedback").textContent = "";
  state.mode = mode;
  localStorage.setItem(MODE_KEY, mode);
  const toggle = $("#modeToggle");
  toggle.classList.toggle("demo", mode === "demo");
  $("#modeLabel").textContent = mode === "demo" ? "Demo mode" : "Live mode";
  if (mode === "demo") {
    state.account = DEMO_WALLET;
    state.profileExists = true;
    state.credentials = DEMO_CREDENTIALS.map((credential) => ({ ...credential }));
    state.allCredentials = state.credentials.map((credential) => ({ ...credential }));
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
    state.account = ""; state.profileExists = false; state.credentials = []; state.allCredentials = []; state.score = 0; state.issuerStatus = 0; state.issuerNames = new Map(); state.issuerActivity = []; state.issuerCredentials = []; state.liveRequests = []; state.liveIssuers = []; state.owner = ""; state.blockNumber = 0; calculateCategories(); renderAll();
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
  const network = state.mode === "demo" ? "Demo scenario" : networkLabel(state.deployment);
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
  $("#identityName").textContent = name; $("#identityInitials").textContent = initials; $("#walletLabel").textContent = state.mode === "demo" ? "Sarvesh M." : hasWallet ? "Connected wallet" : "Connect MetaMask"; $("#walletAddress").textContent = shortAddress(state.account) || "No wallet";
  $(".wallet-avatar").textContent = hasWallet ? initials : "V";
  $("#identityAddress").innerHTML = `${esc(state.account ? shortAddress(state.account) : "Your wallet. Your identity.")} ${state.account ? `<button class="copy-button" aria-label="Copy wallet address" data-copy="${esc(state.account)}">${decorativeIcon(copy)}</button>` : ""}`;
  $("#identityOrg").textContent = state.mode === "demo" ? "Vellore Institute of Technology" : state.deployment ? `Live contract · ${shortAddress(state.deployment.address)}` : "Deploy the contract and load deployment.json";
  $("#sbtId").textContent = state.profileExists ? (state.mode === "demo" ? "#VT-00842" : `#${state.account ? state.account.slice(-6).toUpperCase() : "—"}`) : "—";
  $("#memberSince").textContent = state.profileExists ? (state.mode === "demo" ? "Aug 2024" : "On-chain") : "—";
  $("#holderNameSuffix").textContent = state.mode === "demo" ? ", Sarvesh" : state.publicProfile ? "" : clerkName ? `, ${clerkName.split(" ")[0]}` : "";
  $("#holderIntro").textContent = state.mode === "demo" ? "A living record of achievement. Explore this sample passport in demo mode." : state.publicProfile ? "A public record of verified achievement. Open for anyone to verify." : state.user ? (state.account ? "A living record of everything you’ve earned. Verified on-chain. Owned by you." : "Connect your wallet and give your achievements a place to belong.") : "A living record of everything you’ve earned. Connect to make it yours.";
  $("#onboardingStrip").hidden = hasWallet || state.mode === "demo";
  $(".identity-card").classList.toggle("has-identity", state.profileExists);
}

function renderScore() {
  const tier = tierFor(state.score);
  $("#overallScore").textContent = state.score; $("#tierBadge").textContent = tier; $("#tierCopy").textContent = state.mode === "demo" ? "Seeded presentation scenario" : state.account ? "Calculated from active on-chain credentials" : "Connect wallet to load your score";
  $("#scoreSource").textContent = state.mode === "demo" ? "Demo ledger" : state.publicProfile ? "Public ledger" : state.account ? "On-chain ledger" : "Wallet required";
  $("#scoreDelta").textContent = state.mode === "demo" ? "Demo scenario" : state.account ? `${state.credentials.filter((credential) => credentialStatus(credential) === "ACTIVE").length} active credential${state.credentials.filter((credential) => credentialStatus(credential) === "ACTIVE").length === 1 ? "" : "s"}` : "No live data";
  $("#scoreSync").textContent = state.mode === "demo" ? "Local seeded record" : state.account ? "Read from contract" : "Connect wallet";
  $("#reputationMiniScore").textContent = state.score; $("#reputationMiniTier").textContent = tier; $("#ledgerTotal").textContent = state.score;
  $("#chainMeta").textContent = state.mode === "demo" ? "DEMO TIMELINE" : state.blockNumber ? `BLOCK #${state.blockNumber.toLocaleString()}` : "AWAITING WALLET";
  renderScoreChart();
}

function scoreTimeline() {
  let runningScore = 0;
  return state.credentials
    .filter((credential) => credentialStatus(credential) === "ACTIVE")
    .sort((a, b) => parseDate(a.issueDate) - parseDate(b.issueDate))
    .map((credential) => {
      runningScore += Number(credential.score) || 0;
      return { date: credential.issueDate, score: runningScore, title: credential.title };
    });
}

function renderScoreChart() {
  const fill = $("#scoreChartFill");
  const line = $("#scoreChartLine");
  const dots = $("#scoreChartDots");
  const labels = $("#scoreChartLabels");
  const empty = $("#scoreChartEmpty");
  const description = $("#scoreChartDescription");
  if (!fill || !line || !dots || !labels || !empty || !description) return;

  const points = scoreTimeline();
  empty.hidden = points.length > 0;
  empty.textContent = state.mode === "demo" ? "No active demo credential history yet." : state.account ? "No active on-chain credential history yet." : "Connect a wallet to load on-chain history.";
  if (!points.length) {
    fill.removeAttribute("d");
    line.removeAttribute("d");
    dots.replaceChildren();
    labels.innerHTML = "<span>NO DATA</span>";
    description.textContent = empty.textContent;
    return;
  }

  const plotted = [{ date: points[0].date, score: 0, title: "Starting point" }, ...points];
  const maxScore = Math.max(1000, plotted[plotted.length - 1].score);
  const coordinates = plotted.map((point, index) => ({
    ...point,
    x: plotted.length === 1 ? 0 : (index / (plotted.length - 1)) * 600,
    y: 130 - (Math.min(maxScore, point.score) / maxScore) * 118
  }));
  const linePath = coordinates.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  fill.setAttribute("d", `${linePath} L600 145 L0 145 Z`);
  line.setAttribute("d", linePath);
  dots.innerHTML = coordinates.slice(1).map((point) => `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="5" class="chart-point"><title>${esc(formatDate(point.date))}: ${point.score} points · ${esc(point.title)}</title></circle>`).join("");
  labels.innerHTML = coordinates.filter((_, index) => index === 0 || index === coordinates.length - 1 || index % Math.max(1, Math.ceil(coordinates.length / 4)) === 0).slice(0, 5).map((point, index) => `<span>${index === 0 ? "START" : esc(formatDate(point.date))}</span>`).join("");
  description.textContent = `${state.mode === "demo" ? "Demo" : "Live"} score history from ${points.length} active credential${points.length === 1 ? "" : "s"}. Current score: ${state.score} points.`;
}

function renderBreakdown() {
  const entries = Object.entries(state.categories).filter(([, score]) => score > 0).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const list = entries.length ? entries : [["Technical", 0], ["Hackathon", 0], ["Research", 0], ["Community", 0]];
  $("#breakdownGrid").innerHTML = list.slice(0, 4).map(([category, score]) => {
    const count = state.credentials.filter((credential) => credential.category === category && credentialStatus(credential) === "ACTIVE").length;
    return `<button class="panel breakdown-item ${colorFor(category)}" data-view-target="reputation"><div class="breakdown-head"><span class="dimension-icon">${symbolFor(category)}</span><span class="dimension-arrow">↗</span></div><span class="dimension-name">${esc(category)}</span><div class="dimension-value"><strong>${score}</strong><span>/ 250 pts</span></div><div class="progress-track" role="meter" aria-label="${esc(category)} reputation" aria-valuemin="0" aria-valuemax="250" aria-valuenow="${Math.min(250, Number(score))}"><div class="progress-bar" style="width:${Math.min(100, Number(score) / 2.5)}%"></div></div><small>${count ? `${count} verified credential${count === 1 ? "" : "s"}` : "Your next chapter awaits"}</small></button>`;
  }).join("");
}

function symbolFor(category) {
  const symbols = { Technical: code, Research: flask, Hackathon: trophy, "Open Source": gitBranch, Leadership: shield, Community: users, Academic: graduation, Professional: briefcase };
  return decorativeIcon(symbols[category] || shield).replace('<svg ', '<svg class="category-icon" ');
}
function colorFor(category) { return ({ Technical: "green", Research: "purple", Hackathon: "amber", "Open Source": "green", Leadership: "purple", Community: "amber" })[category] || ""; }
function credentialRow(credential) { const status = credentialStatus(credential); return `<div class="credential-row"><div class="credential-symbol ${colorFor(credential.category)}">${symbolFor(credential.category)}</div><div class="credential-copy"><strong>${esc(credential.title)}</strong><span>${esc(credential.issuerName || shortAddress(credential.issuer))} · ${esc(credential.category)}</span></div><div class="credential-status"><strong class="${status !== "ACTIVE" ? "status-muted" : ""}">${status === "ACTIVE" ? "✓ VERIFIED" : status}</strong><span>${status === "ACTIVE" ? `+${credential.score} pts` : formatDate(credential.expiryDate || credential.issueDate)}</span></div></div>`; }
function renderRecent() { $("#recentCredentials").innerHTML = state.credentials.length ? state.credentials.slice(0, 4).map(credentialRow).join("") : `<div class="empty-state"><strong>Great work deserves a record.</strong>Your verified achievements will find a home here.</div>`; }

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
  const radar = $("#radarChart");
  const axes = CATEGORY_LIST;
  const point = (index, radius) => {
    const angle = index * Math.PI * 2 / axes.length - Math.PI / 2;
    return [180 + Math.cos(angle) * radius, 180 + Math.sin(angle) * radius];
  };
  const polygon = (radius) => axes.map((_, index) => point(index, radius).join(",")).join(" ");
  const values = axes.map((name, index) => point(index, 103 * Math.min(250, Number(state.categories[name] || 0)) / 250));
  radar.innerHTML = `<svg viewBox="0 0 360 360" role="img" aria-labelledby="radarTitle radarDescription"><title id="radarTitle">Reputation by category</title><desc id="radarDescription">${esc(entries.length ? entries.map(([name, score]) => `${name}: ${score} of 250 points`).join(". ") : "No active credentials. All categories are zero.")}</desc>${[.25, .5, .75, 1].map((scale) => `<polygon points="${polygon(103 * scale)}" class="radar-grid"/>`).join("")}${axes.map((name, index) => {
    const [x, y] = point(index, 103); const [labelX, labelY] = point(index, 127);
    return `<line x1="180" y1="180" x2="${x}" y2="${y}" class="radar-spoke"/><text x="${labelX}" y="${labelY}" text-anchor="${labelX < 165 ? "end" : labelX > 195 ? "start" : "middle"}" dominant-baseline="middle" class="radar-axis">${esc(name)}</text>`;
  }).join("")}<polygon points="${values.map((value) => value.join(",")).join(" ")}" class="radar-data"/>${values.map(([x, y], index) => `<circle cx="${x}" cy="${y}" r="3" class="radar-data-point"><title>${esc(axes[index])}: ${state.categories[axes[index]] || 0} points</title></circle>`).join("")}</svg>`;
}

function renderIssuerActivity() {
  const createButton = $("#createStudentPassportButton");
  const canCreate = state.mode === "demo" || (!state.publicProfile && state.issuerStatus === 2);
  createButton.disabled = state.passportCreationPending || (Boolean(state.account) && !canCreate);
  createButton.textContent = state.passportCreationPending ? "Creating passport…" : state.mode === "demo" ? "Create demo passport" : state.account ? "Create student passport" : "Connect issuer wallet";
  $("#passportCreationHelp").textContent = state.mode === "demo" ? "Sample passports stay in this demo session. No gas is spent." : state.publicProfile ? "Public profiles are read-only. Open your own session to create student passports." : state.account && !canCreate ? "An administrator must approve your issuer wallet before you can create student passports." : "Use a student-confirmed wallet address. Your issuer wallet pays gas; the student owns the passport.";
  const issuerStatus = $("#issuerStatus");
  if (issuerStatus) {
    const verified = state.mode === "demo" || state.issuerStatus === 2;
    const unavailable = state.mode === "live" && !state.deployment?.address;
    issuerStatus.innerHTML = `<span class="status-dot"></span> ${unavailable ? "Live contract required" : verified ? "Issuer verified · Manage status" : state.issuerStatus === 1 ? "Issuer request pending" : "Request issuer status"}`;
    issuerStatus.title = unavailable ? "This deployment has no public contract configured. Open the local app or deploy a public testnet contract." : "";
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
  const networkCredentials = state.mode === "demo" ? state.credentials : state.allCredentials;
  const holderCount = new Set(networkCredentials.map((credential) => credential.recipient)).size;
  const credentialCount = networkCredentials.length;
  const issuerRegistry = state.mode === "demo" ? state.demoIssuers : state.liveIssuers;
  const issuerCount = new Set(issuerRegistry.filter((issuer) => issuer.status === 2).map((issuer) => issuer.address.toLowerCase())).size;
  const revocationRate = credentialCount ? Math.round(networkCredentials.filter((credential) => credentialStatus(credential) === "REVOKED").length / credentialCount * 100) : 0;
  $("#adminHolderCount").textContent = holderCount; $("#adminCredentialCount").textContent = credentialCount; $("#adminIssuerCount").textContent = issuerCount; $("#adminRevocationRate").textContent = `${revocationRate}%`;
  const context = state.mode === "demo" ? "demo record" : state.account ? "connected wallet" : "wallet required";
  $("#adminHolderContext").textContent = context; $("#adminCredentialContext").textContent = context; $("#adminIssuerContext").textContent = context; $("#adminRevocationContext").textContent = context;
  $("#adminIdentityLabel").textContent = state.mode === "demo" ? "Demo admin" : state.owner ? "Contract owner" : "Admin wallet";
  $("#adminIdentityAddress").textContent = state.mode === "demo" ? "showcase scenario" : shortAddress(state.owner) || "not loaded";
  $("#adminIssuerContext").textContent = state.mode === "demo" ? "demo issuer registry" : state.account ? "on-chain issuer registry" : "wallet required";
  const requests = state.mode === "demo" ? state.demoIssuers.filter((issuer) => issuer.status === 1) : state.liveRequests || [];
  $("#requestCount").textContent = `${requests.length} pending`;
  $("#issuerRequests").innerHTML = requests.length ? requests.map((request) => `<div class="request-row"><div class="request-logo">◎</div><div class="request-copy"><strong>${esc(request.name)}</strong><span>${esc(request.type)} · ${shortAddress(request.address)}</span></div><div class="request-actions"><button data-approve-issuer="${esc(request.address)}">Approve</button><button class="reject" data-reject-issuer="${esc(request.address)}">Reject</button></div></div>`).join("") : `<div class="empty-state">No pending issuer requests.</div>`;
  const recentCredentials = state.mode === "demo" ? networkCredentials.slice(0, 5) : networkCredentials.slice(-5).reverse();
  const activities = recentCredentials.map((credential) => ({ event: state.mode === "demo" ? "Credential record" : credentialStatus(credential) === "REVOKED" ? "Credential revoked" : "Credential issued", actor: credential.issuerName || shortAddress(credential.issuer), reference: credential.id, time: formatDate(credential.issueDate), status: credentialStatus(credential), tone: credentialStatus(credential) === "REVOKED" ? "red-bg" : "green-bg" }));
  $("#auditTable").innerHTML = activities.length ? `<div class="audit-row table-header"><span>Event</span><span>Actor</span><span>Reference</span><span>Date</span><span>Status</span></div>${activities.map((item) => `<div class="audit-row"><span><i class="audit-icon ${item.tone}">${item.tone === "red-bg" ? "×" : "◇"}</i>${esc(item.event)}</span><span>${esc(item.actor)}</span><span class="mono">${esc(item.reference)}</span><span>${esc(item.time)}</span><span class="table-status ${item.tone === "red-bg" ? "revoked" : "valid"}">${esc(item.status)}</span></div>`).join("")}` : `<div class="empty-state">No on-chain activity for this wallet.</div>`;
}

function activateView(viewName) {
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === `view-${viewName}`));
  const label = $(`.nav-item[data-view="${viewName}"] span:nth-child(2)`)?.textContent || viewName;
  $("#breadcrumbCurrent").textContent = label;
  closeNavigation();
  $$(".nav-item").forEach((item) => { if (item.dataset.view === viewName) item.setAttribute("aria-current", "page"); else item.removeAttribute("aria-current"); });
  if (viewName === "credentials") renderCredentials();
}

let modalReturnFocus = null;
function openModal(content) {
  modalReturnFocus = document.activeElement;
  const modal = $("#modalContent");
  modal.innerHTML = content;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  const heading = modal.querySelector("h2");
  if (heading) { heading.id = "dialogTitle"; modal.setAttribute("aria-labelledby", "dialogTitle"); }
  $("#modalBackdrop").classList.add("open");
  $("#modalBackdrop").setAttribute("aria-hidden", "false");
  $(".app-shell").inert = true;
  modal.querySelector("button, input, select")?.focus();
}
function closeModal() {
  if (!$("#modalBackdrop").classList.contains("open")) return;
  $("#modalBackdrop").classList.remove("open");
  $("#modalBackdrop").setAttribute("aria-hidden", "true");
  $(".app-shell").inert = false;
  if (modalReturnFocus?.isConnected) modalReturnFocus.focus();
}
function closeNavigation() {
  const wasOpen = $("#sidebar").classList.contains("open");
  $("#sidebar").classList.remove("open");
  $("#mobileMenu").setAttribute("aria-expanded", "false");
  document.body.classList.remove("navigation-open");
  if (wasOpen) $("#mobileMenu").focus();
}
matchMedia("(min-width: 821px)").addEventListener("change", (event) => { if (event.matches) closeNavigation(); });
document.addEventListener("keydown", (event) => {
  const modalOpen = $("#modalBackdrop").classList.contains("open");
  const navigationOpen = $("#sidebar").classList.contains("open");
  if (event.key === "Escape") { if (modalOpen) closeModal(); else if (navigationOpen) closeNavigation(); }
  if (event.key !== "Tab" || (!modalOpen && !navigationOpen)) return;
  const container = modalOpen ? $("#modalContent") : $("#sidebar");
  const controls = [...container.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter((element) => element.getClientRects().length && getComputedStyle(element).visibility !== "hidden");
  const first = controls[0]; const last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
});

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
    state.clerk.addListener(({ user }) => { state.user = user || null; if (!user && state.mode === "live" && !state.publicProfile) { state.account = ""; state.profileExists = false; state.credentials = []; state.allCredentials = []; state.score = 0; calculateCategories(); } renderAll(); });
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

function walletNetworkConfig() {
  if (!state.deployment?.chainId) return null;
  const isLocal = Number(state.deployment.chainId) === 31337;
  return {
    chainId: isLocal ? HARDHAT_CHAIN_ID : `0x${Number(state.deployment.chainId).toString(16)}`,
    chainName: isLocal ? "Hardhat Local" : state.deployment.network || "Configured network",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: [state.deployment.rpcUrl || DEFAULT_LOCAL_RPC],
    ...(isLocal ? {} : { blockExplorerUrls: ["https://sepolia.etherscan.io"] })
  };
}

async function ensureWalletNetwork() {
  const expected = walletNetworkConfig();
  if (!expected || !state.provider) return true;
  const network = await state.provider.getNetwork();
  if (Number(network.chainId) === Number(state.deployment.chainId)) return true;
  try {
    await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: expected.chainId }] });
  } catch (error) {
    if (error?.code !== 4902) throw error;
    await window.ethereum.request({ method: "wallet_addEthereumChain", params: [expected] });
  }
  const updatedNetwork = await state.provider.getNetwork();
  if (Number(updatedNetwork.chainId) !== Number(state.deployment.chainId)) throw new Error(`Switch MetaMask to ${expected.chainName} (chain ${state.deployment.chainId}).`);
  return true;
}

async function connectWallet() {
  if (state.mode === "demo") { setMode("live"); return false; }
  if (!state.publicProfile && !state.user) { await openAuthControl(); toast("Sign in first", "Clerk authentication is required before linking a wallet.", "warn"); return; }
  if (!window.ethereum) { toast("Wallet not detected", "Install MetaMask or another EIP-1193 wallet, then try again.", "error"); return; }
  if (!state.deployment?.address) { toast("Live contract not configured", "This deployment cannot send issuer requests yet. Use http://127.0.0.1:5173 for the local chain or configure a public testnet contract.", "error"); return false; }
  try {
    state.provider = new ethers.BrowserProvider(window.ethereum);
    await state.provider.send("eth_requestAccounts", []);
    await ensureWalletNetwork();
    state.signer = await state.provider.getSigner(); state.account = await state.signer.getAddress();
    await syncWalletToClerk();
    state.contract = new ethers.Contract(state.deployment.address, ABI, state.signer);
    await refreshLive(); toast("Wallet connected", `Reading live data for ${shortAddress(state.account)}.`); return true;
  } catch (error) { toast("Wallet connection failed", readableError(error), "error"); return false; }
}

async function refreshLive() {
  if (state.mode !== "live" || !state.contract || !state.account) { renderAll(); return; }
  try {
    const tokenId = await state.contract.passportToken(state.account); state.profileExists = tokenId !== 0n;
    state.credentials = []; state.allCredentials = []; state.issuerCredentials = []; state.score = 0; state.issuerNames = new Map(); state.owner = await state.contract.owner(); state.blockNumber = state.provider?.getBlockNumber ? await state.provider.getBlockNumber() : 0;
    const totalCredentials = Number(await state.contract.totalCredentials());
    if (totalCredentials > 0) {
      const ids = Array.from({ length: totalCredentials }, (_, index) => index + 1);
      const records = await state.contract.getCredentials(ids);
      for (const raw of records) state.allCredentials.push(await liveCredential(raw));
    }
    const issuer = await state.contract.issuers(state.account); state.issuerStatus = Number(issuer.status);
    if (state.profileExists) {
      const ids = await state.contract.getHolderCredentials(state.account);
      for (const id of ids) { const raw = await state.contract.getCredential(id); const credential = await liveCredential(raw); state.credentials.push(credential); }
      state.score = Number(await state.contract.reputationScore(state.account));
      for (const category of CATEGORY_LIST) state.categories[category] = Number(await state.contract.categoryScore(state.account, category));
    } else calculateCategories();
    if (state.issuerStatus === 2) { const ids = await state.contract.getIssuerCredentials(state.account); state.issuerCredentials = []; for (const id of ids) state.issuerCredentials.push(await liveCredential(await state.contract.getCredential(id))); state.issuerActivity = state.issuerCredentials.slice(-5).reverse(); } else state.issuerActivity = [];
    const requestAddresses = [...new Set((await state.contract.getIssuerRegistry()).map((address) => address.toLowerCase()))];
    const issuerRecords = await Promise.all(requestAddresses.map(async (address) => {
      const record = await state.contract.issuers(address);
      return { address, name: record.name, type: record.organizationType, status: Number(record.status) };
    }));
    state.liveIssuers = issuerRecords;
    state.liveRequests = issuerRecords.filter((issuer) => issuer.status === 1);
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

async function createStudentPassport(event) {
  event.preventDefault();
  if (state.passportCreationPending || (state.mode === "live" && state.publicProfile)) return;
  const form = event.currentTarget;
  const field = form.elements.recipient;
  const recipient = field.value.trim();
  const feedback = $("#passportCreationFeedback");
  const valid = ethers.isAddress(recipient) && recipient !== ethers.ZeroAddress;
  markFieldError(field, !valid);
  if (!valid) { feedback.textContent = "Enter a valid, non-zero student wallet address."; field.focus(); return; }
  state.passportCreationPending = true;
  form.setAttribute("aria-busy", "true");
  field.disabled = true;
  renderIssuerActivity();
  try {
    if (state.mode === "demo") {
      const holder = recipient.toLowerCase();
      if (state.demoPassportHolders.has(holder) || state.credentials.some((credential) => credential.recipient.toLowerCase() === holder)) throw new Error("Profile already exists");
      state.demoPassportHolders.add(holder);
      feedback.textContent = `Demo passport created for ${recipient}. No blockchain transaction was sent.`;
    } else {
      if (!state.signer || !state.contract) {
        feedback.textContent = "Connect your approved issuer wallet to continue.";
        const connected = await connectWallet();
        if (!connected || !state.signer || !state.contract) return;
      }
      const contract = state.contract;
      const issuer = await contract.issuers(await state.signer.getAddress());
      if (Number(issuer.status) !== 2) throw new Error("Issuer is not verified");
      if (await contract.passportToken(recipient) !== 0n) throw new Error("Profile already exists");
      feedback.textContent = "Confirm in MetaMask. Your issuer wallet pays gas; the student receives the passport.";
      const tx = await contract.createProfileFor(recipient);
      feedback.textContent = "Waiting for blockchain confirmation…";
      await tx.wait();
      await refreshLive();
      feedback.textContent = `Passport created for ${recipient}. The student owns it and can now receive credentials.`;
    }
    form.reset();
  } catch (error) {
    feedback.textContent = `Passport creation failed: ${readableError(error)}${error?.code === "CALL_EXCEPTION" && (!error.data || error.data === "0x") ? " If this is an older contract, deploy the updated contract and reload the app." : ""}`;
  } finally {
    state.passportCreationPending = false;
    form.setAttribute("aria-busy", "false");
    field.disabled = false;
    renderIssuerActivity();
  }
}

function readableError(error) { const code = error?.code || error?.info?.error?.code; if (code === 4001 || code === "ACTION_REJECTED") return "The wallet request was rejected."; const text = error?.shortMessage || error?.reason || error?.message || "Unknown transaction error"; return text.replace(/^execution reverted: /i, "").replace(/^user rejected.*/i, "The wallet request was rejected.").slice(0, 180); }

function downloadJSON(filename, payload) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);
  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "true");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.append(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

async function hashFile(file) {
  if (!(file instanceof File) || !file.size) throw new Error("Choose a non-empty evidence file.");
  if (!crypto?.subtle) throw new Error("This browser cannot calculate SHA-256 evidence hashes.");
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return `0x${[...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

function markFieldError(field, hasError) {
  field?.classList.toggle("field-error", hasError);
  field?.setAttribute("aria-invalid", String(hasError));
}

async function issueCredential(event) {
  event.preventDefault(); const form = new FormData(event.currentTarget); const type = form.get("type"); const file = form.get("evidence"); const level = Number(form.get("level") || 1); const score = Math.round((SCORE_BY_TYPE[type] || 25) * level); const evidenceHash = file instanceof File && file.size ? await hashFile(file) : ZERO_EVIDENCE_HASH;
  const raw = { recipient: String(form.get("recipient")).trim(), category: String(form.get("category")), title: String(form.get("title")).trim(), description: String(form.get("description")).trim(), issueDate: String(form.get("issueDate") || today()), expiryDate: String(form.get("expiry") || ""), score, evidenceHash, issuer: state.account, issuerName: state.mode === "demo" ? "VIT Chennai" : "Connected issuer", status: "ACTIVE", evidenceName: file instanceof File ? file.name : "" };
  const recipientField = event.currentTarget.elements.recipient;
  if (!ethers.isAddress(raw.recipient)) { markFieldError(recipientField, true); toast("Invalid recipient", "Use a valid EVM wallet address.", "error"); return; }
  markFieldError(recipientField, false);
  if (!raw.title || !raw.description) { toast("Missing credential data", "Title and description are required.", "error"); return; }
  if (raw.expiryDate && parseDate(raw.expiryDate) <= parseDate(raw.issueDate)) { toast("Invalid expiration", "Expiration must be later than the issue date.", "error"); return; }
  if (state.mode === "demo") { const next = state.credentials.length + 1; const credential = { ...raw, id: `VC-DEMO-${String(next).padStart(4, "0")}`, issuer: DEMO_ISSUERS.vit, issuerName: "VIT Chennai" }; state.credentials.unshift(credential); state.allCredentials = state.credentials.map((item) => ({ ...item })); state.issuerCredentials = state.credentials.filter((item) => item.issuer === DEMO_ISSUERS.vit); state.issuerActivity = state.issuerCredentials.slice(0, 5); state.score = state.credentials.filter((item) => credentialStatus(item) === "ACTIVE").reduce((sum, item) => sum + item.score, 0); calculateCategories(); renderAll(); event.currentTarget.reset(); toast("Demo credential issued", `Added ${raw.title} with +${score} points. This did not touch a blockchain.`, "warn"); return; }
  if (!state.contract || !state.account) { const connected = await connectWallet(); if (!connected || !state.contract || !state.account) return; }
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
  if (state.mode === "demo") {
    const issuer = state.demoIssuers.find((item) => item.address.toLowerCase() === address.toLowerCase());
    if (!issuer || issuer.status !== 1) return;
    issuer.status = status;
    renderAdmin();
    toast(status === 2 ? "Demo issuer approved" : "Demo request rejected", "This action is local to demo mode.", "warn");
    return;
  }
  if (!state.contract) { const connected = await connectWallet(); if (!connected || !state.contract) return; }
  try { const tx = await state.contract.setIssuerStatus(address, status); await tx.wait(); await refreshLive(); toast(status === 2 ? "Issuer approved" : "Issuer rejected", "The issuer registry was updated on-chain."); } catch (error) { toast("Issuer update failed", readableError(error), "error"); }
}

function openIssuerRequestModal() {
  if (state.mode === "live" && !state.deployment?.address) {
    openModal(`<div class="modal-header"><div><span class="section-kicker">Live contract unavailable</span><h2>Issuer requests are not configured here</h2></div><button class="modal-close" data-close-modal>×</button></div><p>This deployed site has no public ReputationPassport contract address, so MetaMask has nothing to call.</p><div class="transfer-warning"><strong>For the local blockchain demo</strong><br />Open <span class="mono">http://127.0.0.1:5173/</span> while <span class="mono">npm run chain</span> is running, or deploy a public Sepolia contract and configure its address.</div><button class="button primary" data-close-modal>Close</button>`);
    return;
  }
  openModal(`<div class="modal-header"><div><span class="section-kicker">Issuer registry</span><h2>Request issuer status</h2></div><button class="modal-close" data-close-modal>×</button></div><p>Submit an organization identity for administrator review. This creates a pending on-chain request.</p><form id="issuerRequestForm"><label class="modal-field">Organization name<input required name="name" placeholder="Your organization" /></label><label class="modal-field">Website<input name="website" placeholder="https://" /></label><label class="modal-field">Organization type<select name="type"><option>University</option><option>Company</option><option>Certification body</option><option>Community organization</option><option>Research institution</option></select></label><button class="button primary" type="submit">Submit request <span>→</span></button></form>`);
}

async function requestIssuer(event) { event.preventDefault(); const issuerForm = event.target instanceof HTMLFormElement ? event.target : event.currentTarget; const form = new FormData(issuerForm); if (state.mode === "demo") { closeModal(); toast("Demo request submitted", "A pending issuer request was added to the local scenario.", "warn"); return; } if (!state.deployment?.address) { closeModal(); toast("Live contract not configured", "Use the local app or configure a public testnet contract before submitting an issuer request.", "error"); return; } if (!state.contract) { const connected = await connectWallet(); if (!connected || !state.contract) return; } try { toast("Confirm issuer request", "Review and confirm the request in MetaMask.", "warn"); const tx = await state.contract.requestIssuer(form.get("name"), form.get("website"), form.get("type")); await tx.wait(); closeModal(); await refreshLive(); toast("Issuer request submitted", "The contract owner can now approve this wallet."); } catch (error) { toast("Request failed", readableError(error), "error"); } }

function handleWalletEvents() {
  if (!window.ethereum?.on) return;
  window.ethereum.on("accountsChanged", async (accounts) => {
    if (!accounts.length) { state.account = ""; state.signer = null; state.contract = null; state.profileExists = false; state.credentials = []; state.allCredentials = []; state.score = 0; calculateCategories(); renderAll(); return; }
    if (state.mode !== "live" || !state.deployment?.address) return;
    try {
      state.provider ||= new ethers.BrowserProvider(window.ethereum);
      state.signer = await state.provider.getSigner();
      state.account = await state.signer.getAddress();
      await syncWalletToClerk();
      state.contract = new ethers.Contract(state.deployment.address, ABI, state.signer);
      await refreshLive();
      toast("Wallet switched", `Reading live data for ${shortAddress(state.account)}.`);
    } catch (error) { toast("Wallet switch failed", readableError(error), "error"); }
  });
  window.ethereum.on("chainChanged", () => { if (state.mode === "live") window.location.reload(); });
}

async function initialize() {
  document.title = `${APP_NAME} — Soulbound Reputation Passport`;
  await Promise.all([loadDeployment(), initializeClerk()]);
  const issueDate = $("#issueDateInput"); if (issueDate) issueDate.value = today();
  const publicHolder = new URLSearchParams(location.search).get("holder");
  if (state.mode === "demo") setMode("demo"); else if (publicHolder && ethers.isAddress(publicHolder) && state.deployment?.address) {
    state.publicProfile = true;
    state.account = publicHolder;
    state.provider = new ethers.JsonRpcProvider(state.deployment.rpcUrl || DEFAULT_LOCAL_RPC);
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
  $("#mobileMenu").addEventListener("click", () => {
    if ($("#sidebar").classList.contains("open")) { closeNavigation(); return; }
    $("#sidebar").classList.add("open");
    $("#mobileMenu").setAttribute("aria-expanded", "true");
    document.body.classList.add("navigation-open");
    $(".sidebar-close").focus();
  });
  $$(".nav-item").forEach((item) => item.addEventListener("click", () => activateView(item.dataset.view)));
  document.addEventListener("click", async (event) => {
    if (event.target.closest("[data-close-nav]")) closeNavigation();
    const target = event.target.closest("[data-view-target]"); if (target) activateView(target.dataset.viewTarget);
    const view = event.target.closest("[data-view]"); if (view && !view.classList.contains("nav-item")) activateView(view.dataset.view);
    if (event.target.closest("[data-action=demo]")) setMode("demo");
    if (event.target.closest("[data-action=share]")) openShareModal();
    if (event.target.closest("[data-action=transfer]")) openTransferModal();
    if (event.target.closest("[data-action=verify]")) activateView("verify");
    if (event.target.closest("[data-action=export]")) { downloadJSON("verity-reputation-record.json", { wallet: state.account, score: state.score, credentials: state.credentials }); toast("Record exported", "A JSON copy of the current record was downloaded."); }
    if (event.target.closest("[data-action=issuerExport]")) { downloadJSON("verity-issuer-record.json", { issuer: state.account, credentials: state.issuerActivity }); toast("Issuer record exported", "The current issuer activity was downloaded."); }
    if (event.target.closest("[data-action=savePolicy]")) toast("Policy is contract-controlled", "Scoring policy editing is intentionally disabled until the policy contract is deployed.", "warn");
    if (event.target.closest("[data-action=viewAudit]")) toast("Audit log", "The latest platform events are shown in the table below.");
    if (event.target.closest("[data-action=requestIssuer]")) openIssuerRequestModal();
    if (event.target.closest("[data-close-modal]") || event.target === $("#modalBackdrop")) closeModal();
    const copyTarget = event.target.closest("[data-copy]"); if (copyTarget) { try { await copyText(copyTarget.dataset.copy); toast("Copied", "Copied to clipboard."); } catch { toast("Copy unavailable", "Select the text manually.", "warn"); } }
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
  $("#studentPassportForm").addEventListener("submit", createStudentPassport);
  $("#issueForm").addEventListener("submit", issueCredential); $("#issuerRequestForm")?.addEventListener("submit", requestIssuer);
  $("#evidenceInput").addEventListener("change", (event) => { const file = event.target.files?.[0]; if (file) { $("#uploadTitle").textContent = file.name; $("#uploadMeta").textContent = `${Math.round(file.size / 1024)} KB · SHA-256 before registration`; } });
  handleWalletEvents();
}

initialize();

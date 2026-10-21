const rouletteData = {
  "2000": {
    items: [
      ["방셀", 2], ["으르렁하기", 3], ["볼콕", 3], ["입술콕", 3], ["키-모", 3], ["윙크1번", 3],
      ["윙크 3번", 3], ["10초 얼음", 3], ["짜기양", 3], ["쨔량해", 3], ["카메라에 초근접하기", 3],
      ["랜덤 포즈 5초 유지", 3], ["눈싸움", 3], ["뽀뽀", 3], ["야옹야옹", 3], ["멍멍왕왕", 3],
      ["애교츄", 3], ["매도츄", 3], ["갑자기 놀란 표정", 3], ["손으로 하트 크게 만들기", 3], ["화이텡", 3],
      ["모찌", 3], ["더블피스", 3], ["하트", 3], ["갑자기 ASMR 한마디", 3], ["주먹질", 3],
      ["고양이귀", 3], ["곰돌이귀", 3], ["할미가뒷돈 2%", 2], ["너뿐이야 2%", 2], ["모찌송 2%", 2],
      ["귀요미송 2%", 2], ["귀여워서 미안 2%", 2], ["나랑 사귈래 2%", 2]
    ]
  },
  "3000": {
    items: [["냠냠^.^", 50], ["스쿼트 5개", 8], ["런지 5개", 8], ["팔벌려뛰기 10", 8], ["팔굽혀펴기 5개", 8], ["윗몸일으키기 5개", 8], ["덤벨들고 스쿼트 5개", 8], ["힛임", 2]]
  },
  "5000": {
    items: [["시그니엘 로얄층 숙박권", 0.001], ["식사 대접", 0.01], ["낼름", 25], ["랜덤 리액션", 15], ["랜덤 댄스", 15], ["모찌모찌", 10], ["코스프레 의챈권 (5개 모으면)", 7], ["샤라웃", 5], ["구독권 선물 랜덤 1명", 5], ["방셀", 4], ["고백송", 1], ["맞팔", 1], ["1:1 개인카톡", 1], ["영상편지", 1], ["1시간 춤추기", 0.1], ["연습실 라방 2시간", 0.1], ["24시간 방송", 0.1], ["★코스프레권★", 0.1]]
  },
  "20000": { source: "2000" },
  "30000": {
    items: [["냠냠^.^", 50], ["스쿼트 5개", 8], ["런지 5개", 8], ["팔벌려뛰기 10", 8], ["팔굽혀펴기 5", 8], ["윗몸일으키기 5", 8], ["덤벨들고 스쿼트 5개", 8], ["힛임", 2]]
  },
  "50000": { source: "5000" }
};

const palette = ["#f3b9d4", "#f4d590", "#a7e2d1", "#9fc1fa", "#c8b5ee", "#f4c5a5", "#b3d3ee", "#e6b3a7"];
const spinDuration = 5250;
const tierButtons = Array.from(document.querySelectorAll(".tier-button"));
const wheelCanvas = document.getElementById("wheel-canvas");
const wheelRotor = document.getElementById("wheel-rotor");
const wheelShell = document.getElementById("wheel-shell");
const wheelStage = document.getElementById("wheel-stage");
const spinButton = document.getElementById("spin-button");
const resultCard = document.getElementById("result-card");
const resultText = document.getElementById("result-text");
const prizeList = document.getElementById("prize-list");
const historyList = document.getElementById("history-list");
const historyResetButton = document.getElementById("history-reset");
const selectedTierName = document.getElementById("selected-tier-name");
const soundToggle = document.getElementById("sound-toggle");
const soundLabel = document.getElementById("sound-label");
const clockDate = document.getElementById("clock-date");
const clockTime = document.getElementById("clock-time");

let selectedTier = "2000";
let currentRotation = 0;
let spinning = false;
let soundEnabled = true;
let audioContext = null;
let soundTimer = null;
let lastResult = null;
let recentHistory = readHistory();
let outfitChangeTimer = null;
let outfitEffectTimer = null;

function getConfig(tier) {
  const row = rouletteData[tier];
  return row.source ? rouletteData[row.source] : row;
}

function getWheelEntries(tier) {
  const items = getConfig(tier).items.map(function (item) {
    return { name: item[0], probability: item[1] };
  });
  const total = items.reduce(function (sum, item) { return sum + item.probability; }, 0);
  return { items: items, configuredTotal: Math.round(total * 1000) / 1000 };
}

function formatNumber(value) {
  return Number(value).toLocaleString("ko-KR");
}

function drawWheel() {
  const context = wheelCanvas.getContext("2d");
  const size = wheelCanvas.width;
  const center = size / 2;
  const radius = center - 4;
  const wheel = getWheelEntries(selectedTier);
  const total = wheel.items.reduce(function (sum, item) { return sum + item.probability; }, 0);
  let start = -Math.PI / 2;

  context.clearRect(0, 0, size, size);
  wheel.items.forEach(function (item, index) {
    const end = start + (item.probability / total) * Math.PI * 2;
    context.beginPath();
    context.moveTo(center, center);
    context.arc(center, center, radius, start, end);
    context.closePath();
    context.fillStyle = palette[index % palette.length];
    context.fill();
    context.lineWidth = 1.3;
    context.strokeStyle = "#14203a";
    context.stroke();
    start = end;
  });

  context.beginPath();
  context.arc(center, center, radius, 0, Math.PI * 2);
  context.lineWidth = 3;
  context.strokeStyle = "#e2d5b7";
  context.stroke();

  for (let i = 0; i < 28; i += 1) {
    const angle = (i / 28) * Math.PI * 2;
    const x = center + Math.cos(angle) * (radius - 3);
    const y = center + Math.sin(angle) * (radius - 3);
    context.fillStyle = i % 2 === 0 ? "#fff0c2" : "#536d9d";
    context.fillRect(Math.round(x), Math.round(y), 2, 2);
  }
}

function renderPrizeList() {
  const data = getWheelEntries(selectedTier);
  prizeList.replaceChildren();
  data.items.forEach(function (item, index) {
    const row = document.createElement("li");
    row.className = "prize-row";
    if (lastResult && lastResult.tier === selectedTier && lastResult.name === item.name) row.classList.add("is-last-result");
    const dot = document.createElement("span");
    dot.className = "prize-dot";
    dot.style.background = palette[index % palette.length];
    const name = document.createElement("span");
    name.className = "prize-name";
    name.textContent = item.name;
    const rate = document.createElement("span");
    rate.className = "prize-percent";
    rate.textContent = item.probability + "%";
    row.append(dot, name, rate);
    prizeList.appendChild(row);
  });
}

function selectTier(tier) {
  if (spinning || !rouletteData[tier]) return;
  selectedTier = tier;
  tierButtons.forEach(function (button) {
    const selected = button.dataset.tier === tier;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  selectedTierName.textContent = formatNumber(tier) + "개";
  renderPrizeList();
  drawWheel();
}

function randomFloat() {
  if (window.crypto && window.crypto.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return values[0] / 4294967296;
  }
  return Math.random();
}

function chooseEntry(entries) {
  const configuredTotal = entries.reduce(function (sum, item) { return sum + item.probability; }, 0);
  const target = randomFloat() * configuredTotal;
  let cumulative = 0;
  for (let index = 0; index < entries.length; index += 1) {
    cumulative += entries[index].probability;
    if (target < cumulative) return { entry: entries[index], index: index };
  }
  return { entry: entries[entries.length - 1], index: entries.length - 1 };
}

function playTone(frequency, duration, volume) {
  if (!soundEnabled) return;
  try {
    const AudioContextType = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextType) return;
    if (!audioContext) audioContext = new AudioContextType();
    if (audioContext.state === "suspended") audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration + 0.02);
  } catch (error) {
    // Audio is optional; the visual roulette remains usable when the browser blocks it.
  }
}

function playWinSound() {
  if (!soundEnabled) return;
  try {
    const AudioContextType = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextType) return;
    if (!audioContext) audioContext = new AudioContextType();
    if (audioContext.state === "suspended") audioContext.resume();
    const now = audioContext.currentTime;
    [523.25, 659.25, 783.99].forEach(function (frequency, index) {
      const start = now + index * 0.09;
      const duration = 0.58;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.058, start + 0.09);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.02);
    });
  } catch (error) {
    // Audio is optional; the visual roulette remains usable when the browser blocks it.
  }
}

function startSoftSpinSound(startedAt) {
  if (!spinning || !soundEnabled) return;
  const elapsed = performance.now() - startedAt;
  const progress = Math.min(1, elapsed / spinDuration);
  playTone(480 + Math.round(Math.random() * 60), 0.055, 0.10);
  if (progress < 0.94) {
    const interval = 82 + Math.pow(progress, 2.3) * 310;
    soundTimer = window.setTimeout(function () { startSoftSpinSound(startedAt); }, interval);
  }
}

function rememberResult(tier, entry) {
  const item = { tier: tier, name: entry.name, time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) };
  recentHistory.unshift(item);
  recentHistory = recentHistory.slice(0, 5);
  try { window.localStorage.setItem("majitens-roulette-history", JSON.stringify(recentHistory)); } catch (error) { /* Local history is optional. */ }
  renderHistory();
}

function readHistory() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem("majitens-roulette-history") || "[]");
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch (error) { return []; }
}

function renderHistory() {
  historyList.replaceChildren();
  if (!recentHistory.length) {
    const empty = document.createElement("li");
    empty.className = "history-empty";
    empty.textContent = "아직 룰렛 결과가 없어요.";
    historyList.appendChild(empty);
    return;
  }
  recentHistory.forEach(function (item) {
    const row = document.createElement("li");
    const amount = document.createElement("span");
    amount.className = "history-amount";
    amount.textContent = formatNumber(item.tier) + "개";
    const value = document.createElement("span");
    value.textContent = item.time + " · " + item.name;
    row.append(amount, value);
    historyList.appendChild(row);
  });
}

function updateClock() {
  const now = new Date();
  const pad = function (value) { return String(value).padStart(2, "0"); };
  clockDate.textContent = now.getFullYear() + ". " + pad(now.getMonth() + 1) + ". " + pad(now.getDate());
  clockTime.textContent = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
  document.getElementById("header-clock").dateTime = now.toISOString();
}

historyResetButton.addEventListener("click", function () {
  recentHistory = [];
  try { window.localStorage.removeItem("majitens-roulette-history"); } catch (error) { /* Local history is optional. */ }
  renderHistory();
});
updateClock();
window.setInterval(updateClock, 1000);

function spin() {
  if (spinning) return;
  clearActorReaction("host");
  const data = getWheelEntries(selectedTier);
  const chosen = chooseEntry(data.items);
  const entry = chosen.entry;
  const before = data.items.slice(0, chosen.index).reduce(function (sum, item) { return sum + item.probability; }, 0);
  const centerDegrees = -90 + ((before + entry.probability / 2) / data.configuredTotal) * 360;
  const desiredModulo = ((360 - centerDegrees) % 360 + 360) % 360;
  const currentModulo = ((currentRotation % 360) + 360) % 360;
  const adjustment = (desiredModulo - currentModulo + 360) % 360;
  const targetRotation = currentRotation + 5 * 360 + adjustment;
  const startedAt = performance.now();

  spinning = true;
  spinButton.disabled = true;
  wheelStage.classList.add("is-spinning");
  resultCard.classList.remove("has-result");
  resultCard.classList.add("is-spinning");
  resultText.textContent = "별빛을 따라 천천히 돌아가는 중…";
  if (soundEnabled) startSoftSpinSound(startedAt);
  requestAnimationFrame(function () { wheelRotor.style.transform = "rotate(" + targetRotation + "deg)"; });

  window.setTimeout(function () {
    spinning = false;
    currentRotation = targetRotation;
    spinButton.disabled = false;
    wheelStage.classList.remove("is-spinning");
    if (soundTimer) window.clearTimeout(soundTimer);
    playWinSound();
    lastResult = { tier: selectedTier, name: entry.name };
    resultCard.classList.remove("is-spinning");
    resultText.textContent = entry.name;
    resultCard.classList.add("has-result");
    rememberResult(selectedTier, entry);
    renderPrizeList();
  }, spinDuration + 70);
}

const actorMessages = {
  host: ["야랄금지", "마하마하!", "룰렛 돌리라!", "사랑의 농도 체크"] ,
  black: ["냐옹!", "딸랑♪", "놀아줘!", "꼬리 살랑살랑"] ,
  white: ["야옹~", "볼 비비기♪", "쓰담쓰담 해줘요", "기분 좋아요!"]
};

const outfitButtons = Array.from(document.querySelectorAll(".outfit-option"));
const outfitCategoryButtons = Array.from(document.querySelectorAll(".wardrobe-category"));
const hostActor = document.querySelector('[data-actor="host"]');
const outfitNames = ["hoodie", "casual", "pajamas", "sport", "bunny", "denim"];

function setOutfitCategory(category) {
  if (category !== "child" && category !== "adult") return;
  outfitCategoryButtons.forEach(function (button) {
    const selected = button.dataset.outfitCategory === category;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  outfitButtons.forEach(function (button) {
    button.hidden = button.dataset.category !== category;
  });
}

function changeOutfit(outfit) {
  if (!hostActor || !outfitNames.includes(outfit)) return;
  outfitButtons.forEach(function (button) {
    const selected = button.dataset.outfit === outfit;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  window.clearTimeout(outfitChangeTimer);
  window.clearTimeout(outfitEffectTimer);
  hostActor.classList.remove("is-transforming");
  void hostActor.offsetWidth;
  hostActor.classList.add("is-transforming");
  reactActor("host", "짜잔!");
  outfitChangeTimer = window.setTimeout(function () { hostActor.dataset.outfit = outfit; }, 280);
  outfitEffectTimer = window.setTimeout(function () { hostActor.classList.remove("is-transforming"); }, 1350);
}

outfitButtons.forEach(function (button) {
  button.addEventListener("click", function () { changeOutfit(button.dataset.outfit); });
});
outfitCategoryButtons.forEach(function (button) {
  button.addEventListener("click", function () { setOutfitCategory(button.dataset.outfitCategory); });
});
setOutfitCategory("child");

function reactActor(kind, message) {
  if (spinning) return;
  const actor = document.querySelector('[data-actor="' + kind + '"]');
  if (!actor) return;
  const bubble = actor.querySelector(".speech-bubble");
  const messages = actorMessages[kind] || ["반짝!"];
  bubble.textContent = message || messages[Math.floor(Math.random() * messages.length)];
  actor.classList.remove("is-reacting");
  void actor.offsetWidth;
  actor.classList.add("is-reacting");
  window.clearTimeout(actor.reactionTimer);
  actor.reactionTimer = window.setTimeout(function () { actor.classList.remove("is-reacting"); }, 1150);
}

function clearActorReaction(kind) {
  const actor = document.querySelector('[data-actor="' + kind + '"]');
  if (!actor) return;
  window.clearTimeout(actor.reactionTimer);
  actor.classList.remove("is-reacting");
  const bubble = actor.querySelector(".speech-bubble");
  if (bubble) bubble.textContent = "";
}

tierButtons.forEach(function (button) {
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", function () { selectTier(button.dataset.tier); });
});

document.querySelectorAll(".walker").forEach(function (actor) {
  actor.addEventListener("click", function () { reactActor(actor.dataset.actor); });
});

const previousActorPositions = new WeakMap();
function syncActorWalkDirection() {
  document.querySelectorAll(".walker").forEach(function (actor) {
    const left = actor.getBoundingClientRect().left;
    const previous = previousActorPositions.get(actor);
    if (previous !== undefined && Math.abs(left - previous) > 0.01) {
      actor.classList.toggle("is-returning", left < previous);
    }
    previousActorPositions.set(actor, left);
  });
  window.requestAnimationFrame(syncActorWalkDirection);
}
window.requestAnimationFrame(syncActorWalkDirection);

spinButton.addEventListener("click", spin);
wheelShell.addEventListener("click", spin);

soundToggle.addEventListener("click", function () {
  soundEnabled = !soundEnabled;
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  soundLabel.textContent = soundEnabled ? "소리 켜짐" : "소리 꺼짐";
  soundToggle.classList.toggle("is-muted", !soundEnabled);
});

renderHistory();
selectTier(selectedTier);

const noContainer = document.getElementById("no-container");
const yesButton = document.querySelector(".yes-button");
const finalScreen = document.getElementById("final-screen");

const config = {
  driftRadius: 18,
  escapeLimit: 3,
  safeRadius: 180
};

let noButtons = [];
let safeCenter = { x: 0, y: 0 };

window.addEventListener("load", init);
window.addEventListener("resize", updateSafeCenter);

function init() {
  updateSafeCenter();
  createNoButtons();
  startDrifting();

  yesButton.addEventListener("click", handleYes);
}

function updateSafeCenter() {
  const rect = yesButton.getBoundingClientRect();
  safeCenter.x = rect.left + rect.width / 2;
  safeCenter.y = rect.top + rect.height / 2;
}

function createNoButtons() {
  const area = window.innerWidth * window.innerHeight;
  const count = Math.max(15, Math.floor(area / 20000));

  for (let i = 0; i < count; i++) {
    const btn = document.createElement("button");
    btn.className = "no-button";
    btn.textContent = randomNoText();
    btn.dataset.escapes = 0;

    placeOutsideSafeZone(btn);

    btn.addEventListener("pointerdown", () => handleNo(btn));

    noContainer.appendChild(btn);
    noButtons.push(btn);
  }
}

function placeOutsideSafeZone(btn) {
  let x, y, distance;

  do {
    x = Math.random() * (window.innerWidth - 120);
    y = Math.random() * (window.innerHeight - 60);
    distance = Math.hypot(x - safeCenter.x, y - safeCenter.y);
  } while (distance < config.safeRadius);

  btn.dataset.anchorX = x;
  btn.dataset.anchorY = y;

  btn.style.left = x + "px";
  btn.style.top = y + "px";
}

function handleNo(btn) {
  let escapes = Number(btn.dataset.escapes);

  if (escapes < config.escapeLimit) {
    btn.dataset.escapes = escapes + 1;
    relocate(btn);
  } else {
    vanish(btn);
  }
}

function relocate(btn) {
  placeOutsideSafeZone(btn);
}

function vanish(btn) {
  btn.classList.add("fade");

  const phrase = document.createElement("div");
  phrase.className = "phrase";
  phrase.textContent = randomPhrase();

  phrase.style.left = btn.style.left;
  phrase.style.top = btn.style.top;

  noContainer.appendChild(phrase);

  setTimeout(() => phrase.remove(), 5000);
}

function startDrifting() {
  function animate() {
    noButtons.forEach(btn => {
      if (btn.classList.contains("fade")) return;

      const ax = Number(btn.dataset.anchorX);
      const ay = Number(btn.dataset.anchorY);

      const dx = Math.sin(Date.now() / 1200 + ax) * config.driftRadius;
      const dy = Math.cos(Date.now() / 1400 + ay) * config.driftRadius;

      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    requestAnimationFrame(animate);
  }

  animate();
}

function handleYes() {
  document.querySelector(".scene").style.opacity = "0";
  setTimeout(() => {
    finalScreen.classList.remove("hidden");
  }, 600);
}

function randomNoText() {
  const variants = [
    "Нет",
    "Неа",
    "Ни за что",
    "Вряд ли",
    "Сомневаюсь",
    "Не думаю"
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

function randomPhrase() {
  const phrases = [
    "Хм…",
    "Попробуй ещё",
    "Не сдавайся",
    "Ты настойчивый :)"
  ];
  return phrases[Math.floor(Math.random() * phrases.length)];
}
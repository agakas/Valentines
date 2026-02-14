const noContainer = document.getElementById("no-container");
const yesButton = document.querySelector(".yes-button");
const finalScreen = document.getElementById("final-screen");

/* ---------- КОНФИГ ---------- */
const config = {
  driftRadius: 18,
  escapeLimit: 1,
  safeRadius: 180,
  imageProbability: 0.7 // 90% картинок
};

/* ---------- МАССИВ КАРТИНОК ---------- */
const popupImages = [
  "assets/cat1.jpg",
  "assets/cat2.jpg",
  "assets/monkey1.jpg",
  "assets/cat3.jpg",
  "assets/monkey2.jpg"
];

let currentImageIndex = 0; // циклический показ картинок
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

/* ---------- СОЗДАНИЕ КНОПОК ---------- */
function createNoButtons() {
  const area = window.innerWidth * window.innerHeight;
  let count = Math.max(15, Math.floor(area / 20000));

  // если телефон (узкий экран), увеличиваем количество кнопок
  if (window.innerWidth <= 768) {
    count = Math.floor(count * 1.8);
  }

  const positions = [];

  for (let i = 0; i < count; i++) {
    const btn = document.createElement("button");
    btn.className = "no-button";
    btn.textContent = randomNoText();
    btn.dataset.escapes = 0;

    placeOutsideSafeZone(btn, positions);
    positions.push({ x: parseFloat(btn.style.left), y: parseFloat(btn.style.top) });

    btn.addEventListener("pointerdown", () => handleNo(btn));

    noContainer.appendChild(btn);
    noButtons.push(btn);
  }
}

function placeOutsideSafeZone(btn, positions = []) {
  let x, y, distance;
  let safe = false;

  do {
    x = Math.random() * (window.innerWidth - 120);
    y = Math.random() * (window.innerHeight - 60);
    distance = Math.hypot(x - safeCenter.x, y - safeCenter.y);
    safe = distance >= config.safeRadius;

    // проверяем, чтобы не накладывалось на другие кнопки
    for (let pos of positions) {
      if (Math.hypot(x - pos.x, y - pos.y) < 60) { // минимальное расстояние
        safe = false;
        break;
      }
    }
  } while (!safe);

  btn.dataset.anchorX = x;
  btn.dataset.anchorY = y;
  btn.style.left = x + "px";
  btn.style.top = y + "px";
}

/* ---------- ПОВЕДЕНИЕ КНОПОК ---------- */
let currentZ = 10; // начальный z-index для негативных кнопок

function handleNo(btn) {
  // поднимаем кнопку поверх остальных
  currentZ++;
  btn.style.zIndex = currentZ;

  let escapes = Number(btn.dataset.escapes);

  if (escapes < config.escapeLimit) {
    btn.dataset.escapes = escapes + 1;
    relocate(btn);
  } else {
    vanish(btn);
  }
}

function relocate(btn) {
  placeOutsideSafeZone(btn, noButtons.map(b => ({
    x: parseFloat(b.style.left),
    y: parseFloat(b.style.top)
  })));
}

function vanish(btn) {
  btn.classList.add("fade");

  const x = parseFloat(btn.style.left);
  const y = parseFloat(btn.style.top);

  if (Math.random() < config.imageProbability && popupImages.length > 0) {
    spawnImage(x, y);
  } else {
    spawnPhrase(x, y);
  }
}

/* ---------- ТЕКСТ ---------- */
function spawnPhrase(x, y) {
  const phrase = document.createElement("div");
  phrase.className = "phrase";
  phrase.textContent = randomPhrase();
  phrase.style.left = x + "px";
  phrase.style.top = y + "px";

  noContainer.appendChild(phrase);
  setTimeout(() => phrase.remove(), 5000);
}

/* ---------- КАРТИНКИ ---------- */
function spawnImage(x, y) {
  if (popupImages.length === 0) return;

  const img = document.createElement("img");
  img.src = nextImage();
  img.className = "popup-image";

  // случайный угол и scale
  const angle = Math.random() * 40 - 20; // -20° ... +20°
  const scale = 0.8 + Math.random() * 0.4; // 0.8 ... 1.2

  img.style.left = x + "px";
  img.style.top = y + "px";

  img.style.transform = `rotate(${angle}deg) scale(${scale})`;
  img.style.animation = "imageFloat 5s forwards";

  noContainer.appendChild(img);
  setTimeout(() => img.remove(), 5000);
}

function nextImage() {
  const img = popupImages[currentImageIndex];
  currentImageIndex = (currentImageIndex + 1) % popupImages.length;
  return img;
}

/* ---------- ПЛАВАНИЕ ---------- */
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

/* ---------- YES ---------- */
function handleYes() {
  document.querySelector(".scene").style.opacity = "0";
  setTimeout(() => {
    finalScreen.classList.remove("hidden");
  }, 600);
}

function showFinalScreen() {
  finalScreen.classList.remove("hidden");

  // Стикеры Love is
  const stickers = [
    "assets/vklad1.png",
    "assets/vklad2.png",
    "assets/vklad1.png",
    "assets/vklad2.png",
    "assets/vklad1.png",
    "assets/vklad2.png",
    "assets/vklad1.png",
    "assets/vklad2.png",
    "assets/vklad1.png"
  ];

  const container = document.getElementById("stickers-container");
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  stickers.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.className = "sticker";

    // рандомная позиция и угол
    const x = Math.random() * (screenWidth - 80);
    const y = Math.random() * (screenHeight - 80);
    const angle = Math.random() * 60 - 30;

    img.style.left = x + "px";
    img.style.top = y + "px";
    img.style.transform = `rotate(${angle}deg)`;

    container.appendChild(img);
  });

  // Летающие сердечки
  const heartsContainer = document.getElementById("hearts-container");

  function spawnHeart() {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.innerHTML = "❤️";

    const x = Math.random() * (screenWidth - 30);
    const y = Math.random() * (screenHeight - 30);
    heart.style.left = x + "px";
    heart.style.top = y + "px";

    heartsContainer.appendChild(heart);

    setTimeout(() => heart.remove(), 4000);
  }

  // Спавним несколько сердечек каждые 0.5s
  const heartInterval = setInterval(spawnHeart, 500);

  // Останавливаем через 10 секунд
  setTimeout(() => clearInterval(heartInterval), 10000);
}

/* ---------- УТИЛИТЫ ---------- */
function randomNoText() {
  const variants = [
    "Нет 🙅‍♀️",
    "Неа ⛔️",
    "Тюю 🙄",
    "Ни за что 🫣",
    "Вряд ли 🫤",
    "Сомневаюсь 🤷‍♀️",
    "Не думаю 🤔",
    "Увы ❌",
    "Никогда 🙃",
    "Серьёзно? 😅",
    "Хмм… 🫤",
    "Не получится 🛑",
    "Пфф… 🙄",
    "Не сегодня 😬",
    "Ой нет 😳"
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

function randomPhrase() {
  const phrases = [
    "Упс, промахнулась!",
    "Попробуй ещё",
    "А кто разрешал нажимать? 😜",
    "Что-то пошло не так... 🤭",
    "Подумай над своим поведением!!!"
  ];
  return phrases[Math.floor(Math.random() * phrases.length)];
}

window.addEventListener("load", () => {
  setTimeout(() => {
    const loader = document.getElementById("loader");
    loader.classList.add("hidden");

    setTimeout(() => loader.remove(), 600);
  }, 1500);
});
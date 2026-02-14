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
    showFinalScreen();
  }, 600);
}

function showFinalScreen() {
  finalScreen.classList.remove("hidden");

  const stickersContainer = document.getElementById("stickers-container");
  const heartsContainer = document.getElementById("hearts-container");

  const stickerFiles = [
    "assets/vklad1.png",
    "assets/vklad2.png",
    "assets/vklad3.png",
    "assets/vklad4.png",
    "assets/vklad5.png"
  ];

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const stickerSize = 240;
  const textBlock = document.getElementById("final-title");
  const textRect = textBlock.getBoundingClientRect();

  const positions = [];

  // --- Размещение 5 уникальных стикеров ---
  stickerFiles.forEach(file => {
    let x, y, safe;
    let attempts = 0;

    do {
      x = Math.random() * (screenWidth - stickerSize - 20);
      y = Math.random() * (screenHeight - stickerSize - 20);

      // Проверка, чтобы не перекрывать текст
      safe = !(
        x + stickerSize > textRect.left &&
        x < textRect.right &&
        y + stickerSize > textRect.top &&
        y < textRect.bottom
      );

      // Проверка на перекрытие других стикеров
      positions.forEach(pos => {
        if (Math.hypot(x - pos.x, y - pos.y) < stickerSize * 0.9) {
          safe = false;
        }
      });

      attempts++;
    } while (!safe && attempts < 100);

    positions.push({ x, y });

    const img = document.createElement("img");
    img.src = file;
    img.className = "sticker";

    img.style.width = stickerSize + "px";
    img.style.height = stickerSize + "px";

    const angle = Math.random() * 40 - 20;
    img.style.left = x + "px";
    img.style.top = y + "px";
    img.style.transform = `rotate(${angle}deg)`;

    stickersContainer.appendChild(img);
  });

  // --- Летающие сердечки ---
  function spawnHeart() {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.textContent = "❤️";

    const x = Math.random() * (screenWidth - 30);
    heart.style.left = x + "px";
    heart.style.top = screenHeight + "px";

    const duration = 4000 + Math.random() * 3000;
    const scale = 0.8 + Math.random() * 0.6;
    heart.style.transform = `scale(${scale})`;

    heartsContainer.appendChild(heart);

    heart.animate([
      { transform: `translateY(0px) scale(${scale}) rotate(0deg)`, opacity: 0.8 },
      { transform: `translateY(-${screenHeight + 100}px) scale(${scale}) rotate(${Math.random()*30-15}deg)`, opacity: 0 }
    ], {
      duration: duration,
      easing: "linear",
      fill: "forwards"
    });

    setTimeout(() => heart.remove(), duration);
  }

  const heartInterval = setInterval(spawnHeart, 150);
  setTimeout(() => clearInterval(heartInterval), 12000);
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
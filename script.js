/* ---------- hearts (SVG) ---------- */
const heartSVG = `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="36" height="36" aria-hidden="true">
  <defs>
    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6ca0ff"/>
      <stop offset="100%" stop-color="#345bdb"/>
    </linearGradient>
  </defs>
  <path fill="url(#blueGradient)" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 
    4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 
    16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
</svg>
`;

window.addEventListener("load", () => {
  const bg = document.getElementById("heart-background");
  for (let i = 0; i < 24; i++) {
    const d = document.createElement("div");
    d.className = "heart";
    d.style.left = Math.random() * 100 + "vw";
    d.style.top = Math.random() * 90 + "vh";
    d.style.animationDelay = i * 0.15 + "s";
    d.innerHTML = heartSVG;
    bg.appendChild(d);
  }

  createNumberPad();
  updateDots();
});

/* ---------- passcode logic ---------- */
const correctPasscode = "2004";
let entered = "";
let onSlidEnvelopePage = false;

const passcodeDots = document.getElementById("passcode-dots");
const numberPad = document.getElementById("number-pad");
const errorMessage = document.getElementById("error-message");
const passcodeContainer = document.getElementById("passcode-container");
const envelope = document.getElementById("envelope");
const backArrow = document.getElementById("back-arrow");
const clickMeText = document.getElementById("click-me-text");
const letter = document.getElementById("letter");
const letterContent = document.getElementById("letter-content");
const letterClickMe = document.getElementById("letter-click-me");

let isLetterUnblurred = false;

// Order of hearts to pop
const popOrder = [
  ".heart-bottom2",
  ".heart-top1",
  ".heart-top3",
  ".heart-bottom1",
  ".heart-top2",
  ".heart-bottom3",
];
let popIndex = 0;

function updateDots() {
  passcodeDots.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    const dot = document.createElement("div");
    dot.className = "passcode-dot";
    if (i < entered.length) dot.classList.add("filled");
    passcodeDots.appendChild(dot);
  }
}

function showError() {
  errorMessage.style.visibility = "visible";
  setTimeout(() => (errorMessage.style.visibility = "hidden"), 1400);
}

function reset() {
  entered = "";
  updateDots();
}

function unlock() {
  passcodeContainer.style.opacity = "0";
  envelope.style.display = "block";
  envelope.style.opacity = "1";
  envelope.style.pointerEvents = "auto";
  setTimeout(() => {
    passcodeContainer.style.display = "none";
  }, 700);
  backArrow.classList.add("visible");
  onSlidEnvelopePage = false;
}

// Envelope click
envelope.addEventListener("click", () => {
  if (
    !clickMeText.classList.contains("fade-out") &&
    !envelope.classList.contains("slide-left")
  ) {
    clickMeText.classList.add("fade-out");
    setTimeout(() => {
      envelope.classList.add("slide-left");
      onSlidEnvelopePage = true;

      letter.style.opacity = "1";
      letter.style.pointerEvents = "auto";
      letter.style.transform = "translate(-50%, -50%) translateX(600px)";

      // Only reset hearts if letter never clicked before
      if (!isLetterUnblurred && popIndex === 0) {
        letterContent.classList.remove("unblurred");
        letterClickMe.classList.remove("fade-out");
      }
    }, 700);
  }
});

// Click anywhere on letter to pop hearts and eventually unblur
letter.addEventListener("click", () => {
  // Pop one heart per click if hearts remain
  if (popIndex < popOrder.length) {
    const heart = document.querySelector(popOrder[popIndex]);
    if (heart) {
      const style = window.getComputedStyle(heart);
      const matrix = style.transform;
      let angle = 0;

      if (matrix && matrix !== "none") {
        const values = matrix.match(/matrix.*\((.+)\)/)[1].split(", ");
        const a = parseFloat(values[0]);
        const b = parseFloat(values[1]);
        angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
      }

      heart.style.setProperty("--rot", angle + "deg");
      heart.classList.add("pop");

      setTimeout(() => {
        heart.remove();
      }, 400); // match CSS pop duration

      popIndex++;
    }
  } else if (!isLetterUnblurred && popIndex >= popOrder.length) {
    // Only unblur after all hearts popped
    letterContent.classList.add("unblurred");
    letterClickMe.classList.add("fade-out");
    isLetterUnblurred = true;
  }
});

function handleNumber(num) {
  if (entered.length >= 4) return;
  entered += String(num);
  updateDots();
  if (entered.length === 4) {
    setTimeout(() => {
      if (entered === correctPasscode) unlock();
      else {
        showError();
        reset();
      }
    }, 300);
  }
}

function createNumberPad() {
  for (let i = 1; i <= 9; i++) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = i;
    b.addEventListener("click", () => handleNumber(i));
    numberPad.appendChild(b);
  }
  const spacer = document.createElement("div");
  spacer.className = "spacer";
  numberPad.appendChild(spacer);
  const zero = document.createElement("button");
  zero.type = "button";
  zero.textContent = "0";
  zero.addEventListener("click", () => handleNumber(0));
  numberPad.appendChild(zero);
  const del = document.createElement("button");
  del.type = "button";
  del.textContent = "⌫";
  del.addEventListener("click", () => {
    if (entered.length > 0) entered = entered.slice(0, -1);
    updateDots();
  });
  numberPad.appendChild(del);
}

// --- FIXED BACK ARROW LOGIC ---
backArrow.addEventListener("click", () => {
  if (onSlidEnvelopePage) {
    onSlidEnvelopePage = false;

    backArrow.classList.add("visible");

    // Hide letter visually but keep hearts and popIndex intact
    letter.style.transition = "none";
    letter.style.opacity = "0";
    letter.style.transform = "translate(-50%, -50%) translateX(0)";
    letter.style.pointerEvents = "none";
    void letter.offsetWidth;
    letter.style.transition = "transform 1s ease, opacity 1s ease";

    envelope.classList.remove("slide-left");
    clickMeText.classList.remove("fade-out");
    envelope.style.opacity = "1";
    envelope.style.pointerEvents = "auto";
    envelope.style.display = "block";

    // Keep popIndex and isLetterUnblurred as is so hearts can still be popped
  } else {
    backArrow.classList.remove("visible");

    passcodeContainer.style.display = "block";
    passcodeContainer.style.opacity = "1";

    envelope.style.display = "none";
    envelope.style.opacity = "0";
    envelope.style.pointerEvents = "none";

    clickMeText.classList.remove("fade-out");

    letter.style.transition = "none";
    letter.style.opacity = "0";
    letter.style.transform = "translate(-50%, -50%) translateX(0)";
    letter.style.pointerEvents = "none";
    void letter.offsetWidth;
    letter.style.transition = "transform 1s ease, opacity 1s ease";

    reset();

    // Optional full reset if leaving passcode entirely
    popIndex = 0;
    isLetterUnblurred = false;
    letterContent.classList.remove("unblurred");
    letterClickMe.classList.remove("fade-out");
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") {
    handleNumber(Number(e.key));
  }
  if (e.key === "Backspace") {
    if (entered.length > 0) {
      entered = entered.slice(0, -1);
      updateDots();
    }
  }
});

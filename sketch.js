let cards = [];
let flippedCards = [];
let matchedCount = 0;
let score = 0;
let timer = 300; // default 5 minutes
let gameOver = false;
let gameStarted = false;

let catIcons = ["🐱", "😺", "😸", "😻", "😼", "🙀"];
let deck = [];

let particles = [];

let startButton;
let easyButton, mediumButton, hardButton;

function setup() {
  createCanvas(600, 600);
  textAlign(CENTER, CENTER);
  rectMode(CENTER);

  // Start button
  startButton = createButton("Start Game");
  startButton.position(10, 10);
  startButton.mousePressed(startGame);

  // Difficulty buttons
  easyButton = createButton("Easy (5 min)");
  easyButton.position(120, 10);
  easyButton.mousePressed(() => setDifficulty(300));

  mediumButton = createButton("Medium (3 min)");
  mediumButton.position(240, 10);
  mediumButton.mousePressed(() => setDifficulty(180));

  hardButton = createButton("Hard (2 min)");
  hardButton.position(360, 10);
  hardButton.mousePressed(() => setDifficulty(120));

  buildDeck();
  createCards();
}

function setDifficulty(seconds) {
  timer = seconds;
}

function startGame() {
  gameStarted = true;
  gameOver = false;
  score = 0;
  matchedCount = 0;
  flippedCards = [];
  particles = [];

  buildDeck();
  createCards();
}

function draw() {
  background(255, 235, 245);

  drawTitle();
  drawHUD();

  if (!gameStarted) {
    fill(255, 120, 160);
    textSize(30);
    text("Press Start to Begin!", width / 2, height / 2);
    return;
  }

  // Timer using frameCount
  if (!gameOver && frameCount % 60 === 0 && timer > 0) {
    timer--;
    if (timer === 0) gameOver = true;
  }

  for (let c of cards) {
    c.update();
    c.show();
  }

  updateParticles();

  if (matchedCount === deck.length && deck.length > 0) {
    gameOver = true;
    drawWinMessage();
  } else if (gameOver && matchedCount !== deck.length) {
    drawLoseMessage();
  }
}

function mousePressed() {
  if (!gameStarted || gameOver) return;

  for (let c of cards) {
    if (c.contains(mouseX, mouseY) && !c.matched && !c.flipped) {
      c.startFlip();
      flippedCards.push(c);

      if (flippedCards.length === 2) {
        setTimeout(checkMatch, 700);
      }
      break;
    }
  }
}

function buildDeck() {
  deck = [...catIcons, ...catIcons];
  shuffle(deck, true);
}

function createCards() {
  cards = [];
  let index = 0;
  let cols = 4;
  let rows = 3;
  let cardW = 120;
  let cardH = 150;

  let spacingX = 160;
  let spacingY = 190;
  let startX = 90;
  let startY = 180;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cards.push(
        new Card(
          startX + c * spacingX,
          startY + r * spacingY,
          cardW,
          cardH,
          deck[index]
        )
      );
      index++;
    }
  }
}

function checkMatch() {
  let [a, b] = flippedCards;

  if (a.icon === b.icon) {
    a.matched = true;
    b.matched = true;
    matchedCount += 2;
    score += 10;

    spawnHearts(a.x, a.y);
    spawnHearts(b.x, b.y);
  } else {
    a.startFlipBack();
    b.startFlipBack();
  }

  flippedCards = [];
}

function drawTitle() {
  fill(255, 120, 180);
  textSize(40);
  text("🐾 Matching Cat Game 🐾", width / 2, 70);
}

function drawHUD() {
  let mins = floor(timer / 60);
  let secs = timer % 60;
  let displayTime = nf(mins, 1) + ":" + nf(secs, 2);

  fill(255, 100, 160);
  textSize(24);
  text(`Score: ${score}`, width / 2, 110);

  fill(255, 80, 120);
  textSize(24);
  text(`Time: ${displayTime}`, width / 2, 140);
}

function drawWinMessage() {
  spawnWinHearts();

  fill(255, 200, 230);
  rect(width / 2, height / 2, 400, 200, 20);

  fill(255, 80, 150);
  textSize(40);
  text("You Win! 😻", width / 2, height / 2);
}

function drawLoseMessage() {
  spawnLoseEmojis();

  fill(255, 200, 230);
  rect(width / 2, height / 2, 400, 200, 20);

  fill(255, 80, 150);
  textSize(40);
  text("Time's Up! 😿", width / 2, height / 2);
}

// ---------------- PARTICLES ----------------

function spawnHearts(x, y) {
  for (let i = 0; i < 20; i++) {
    particles.push({
      x,
      y,
      vx: random(-2, 2),
      vy: random(-3, -1),
      life: 60,
      emoji: "💖",
      size: random(10, 18)
    });
  }
}

function spawnWinHearts() {
  for (let i = 0; i < 25; i++) {
    particles.push({
      x: width / 2,
      y: height / 2,
      vx: random(-2, 2),
      vy: random(-4, -1),
      life: 70,
      emoji: "❤️",
      size: random(20, 30)
    });
  }
}

function spawnLoseEmojis() {
  let lossEmojis = ["👎", "😿", "💔", "😭"];

  for (let i = 0; i < 30; i++) {
    particles.push({
      x: width / 2,
      y: height / 2,
      vx: random(-2, 2),
      vy: random(1, 4),
      life: 70,
      emoji: random(lossEmojis),
      size: random(20, 32)
    });
  }
}

function updateParticles() {
  for (let p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    textSize(p.size);
    fill(255, 100, 160, p.life * 4);
    text(p.emoji, p.x, p.y);
  }

  particles = particles.filter(p => p.life > 0);
}

// ---------------- CARD CLASS ----------------

class Card {
  constructor(x, y, w, h, icon) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.icon = icon;
    this.flipped = false;
    this.matched = false;

    this.flipProgress = 0;
    this.flipBack = false;
  }

  startFlip() {
    this.flipProgress = 0;
    this.flipped = true;
  }

  startFlipBack() {
    this.flipBack = true;
  }

  update() {
    if (this.flipped && this.flipProgress < 1) {
      this.flipProgress += 0.1;
    }

    if (this.flipBack) {
      this.flipProgress -= 0.1;
      if (this.flipProgress <= 0) {
        this.flipBack = false;
        this.flipped = false;
      }
    }
  }

  contains(px, py) {
    return (
      px > this.x - this.w / 2 &&
      px < this.x + this.w / 2 &&
      py > this.y - this.h / 2 &&
      py < this.y + this.h / 2
    );
  }

  show() {
    push();
    translate(this.x, this.y);

    let scaleX = abs(cos(this.flipProgress * PI));
    scale(scaleX, 1);

    fill(this.flipped || this.matched ? 255 : 255, 230, 245);
    stroke(255, 150, 200);
    strokeWeight(4);
    rect(0, 0, this.w, this.h, 30);

    if (this.flipped || this.matched) {
      textSize(45);
      fill(255, 100, 160);
      text(this.icon, 0, -5);
    }

    pop();
  }
}

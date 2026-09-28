const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const healthBarEl = document.getElementById('healthBar');
const startOverlay = document.getElementById('startOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalScoreEl = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

const WORLD = {
  width: canvas.width,
  height: canvas.height,
};

const state = {
  running: false,
  gameOver: false,
  score: 0,
  health: 100,
  timeLeft: 60,
  shotCooldown: 0,
  enemyTimer: 0,
  lastTime: 0,
  pointerX: WORLD.width / 2,
  pointerActive: false,
};

const player = {
  x: WORLD.width / 2,
  y: WORLD.height - 90,
  radius: 20,
  speed: 5.5,
  shootRate: 0.25,
};

const bullets = [];
const enemies = [];
const particles = [];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function resetGame() {
  state.running = true;
  state.gameOver = false;
  state.score = 0;
  state.health = 100;
  state.timeLeft = 60;
  state.shotCooldown = 0;
  state.enemyTimer = 0;
  state.pointerX = WORLD.width / 2;
  state.pointerActive = false;
  player.x = WORLD.width / 2;
  bullets.length = 0;
  enemies.length = 0;
  particles.length = 0;
  scoreEl.textContent = '0';
  timerEl.textContent = '60';
  healthBarEl.style.width = '100%';
  gameOverOverlay.classList.add('hidden');
  startOverlay.classList.add('hidden');
}

function endGame() {
  state.running = false;
  state.gameOver = true;
  finalScoreEl.textContent = `Skor: ${state.score}`;
  gameOverOverlay.classList.remove('hidden');
}

function spawnEnemy() {
  const size = 18 + Math.random() * 14;
  const x = 24 + Math.random() * (WORLD.width - 48);
  const speed = 1.1 + Math.random() * 1.5 + (60 - state.timeLeft) * 0.015;

  enemies.push({
    x,
    y: -30,
    radius: size,
    speed,
    color: Math.random() > 0.52 ? '#ff6b57' : '#ff8a3d',
  });
}

function shoot() {
  if (!state.running || state.gameOver) return;

  bullets.push({
    x: player.x,
    y: player.y - 22,
    radius: 5,
    vy: -7,
    color: '#6fe9ff',
  });
}

function createBurst(x, y, color) {
  for (let i = 0; i < 10; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      radius: 2 + Math.random() * 2,
      life: 20 + Math.random() * 20,
      color,
    });
  }
}

function update(dt) {
  if (!state.running) return;

  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    endGame();
    return;
  }

  timerEl.textContent = Math.ceil(state.timeLeft).toString();

  const pointerMove = state.pointerActive ? (state.pointerX - player.x) * 0.12 : 0;
  player.x += pointerMove;
  player.x = clamp(player.x, 24, WORLD.width - 24);

  state.shotCooldown -= dt;
  if (state.pointerActive && state.shotCooldown <= 0) {
    shoot();
    state.shotCooldown = player.shootRate;
  }

  state.enemyTimer -= dt;
  if (state.enemyTimer <= 0) {
    spawnEnemy();
    state.enemyTimer = Math.max(0.5, 1.3 - state.score * 0.005);
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.y += b.vy * 60 * dt;
    if (b.y < -30) bullets.splice(i, 1);
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.y += e.speed * 60 * dt;

    if (e.y - e.radius > WORLD.height + 10) {
      enemies.splice(i, 1);
      state.health -= 10;
      if (state.health <= 0) {
        state.health = 0;
        healthBarEl.style.width = '0%';
        endGame();
        return;
      }
      healthBarEl.style.width = `${state.health}%`;
      continue;
    }

    for (let j = bullets.length - 1; j >= 0; j--) {
      const b = bullets[j];
      const dx = e.x - b.x;
      const dy = e.y - b.y;
      const distance = Math.hypot(dx, dy);

      if (distance < e.radius + b.radius) {
        bullets.splice(j, 1);
        enemies.splice(i, 1);
        state.score += 10;
        scoreEl.textContent = state.score.toString();
        createBurst(e.x, e.y, e.color);
        break;
      }
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * 60 * dt;
    p.y += p.vy * 60 * dt;
    p.life -= dt * 60;
    if (p.life <= 0) particles.splice(i, 1);
  }

  healthBarEl.style.width = `${state.health}%`;
}

function drawBackground() {
  ctx.clearRect(0, 0, WORLD.width, WORLD.height);

  const gradient = ctx.createLinearGradient(0, 0, 0, WORLD.height);
  gradient.addColorStop(0, '#091931');
  gradient.addColorStop(0.45, '#0e2238');
  gradient.addColorStop(1, '#070d15');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  ctx.strokeStyle = 'rgba(118, 177, 255, 0.12)';
  ctx.lineWidth = 1;
  for (let y = 0; y < WORLD.height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WORLD.width, y);
    ctx.stroke();
  }

  for (let x = 0; x < WORLD.width; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, WORLD.height);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(0, WORLD.height - 110, WORLD.width, 110);
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);

  ctx.fillStyle = '#74dbff';
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(16, 18);
  ctx.lineTo(0, 12);
  ctx.lineTo(-16, 18);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#dfefff';
  ctx.fillRect(-4, 10, 8, 18);
  ctx.restore();

  ctx.strokeStyle = 'rgba(116, 219, 255, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(player.x, player.y - 30);
  ctx.lineTo(player.x, player.y - 44);
  ctx.stroke();
}

function drawBullets() {
  bullets.forEach((b) => {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawEnemies() {
  enemies.forEach((e) => {
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.roundRect(e.x - e.radius, e.y - e.radius, e.radius * 2, e.radius * 2, 8);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(e.x - e.radius * 0.6, e.y - e.radius * 0.5, e.radius * 1.2, 6);
  });
}

function drawParticles() {
  particles.forEach((p) => {
    ctx.globalAlpha = Math.max(0, p.life / 35);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawCrosshair() {
  if (!state.running || state.gameOver) return;
  const x = state.pointerX;
  ctx.strokeStyle = 'rgba(112, 234, 255, 0.75)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 12, WORLD.height - 150);
  ctx.lineTo(x + 12, WORLD.height - 150);
  ctx.moveTo(x, WORLD.height - 162);
  ctx.lineTo(x, WORLD.height - 138);
  ctx.stroke();
}

function render() {
  drawBackground();
  drawPlayer();
  drawBullets();
  drawEnemies();
  drawParticles();
  drawCrosshair();
}

function frame(ts) {
  const dt = Math.min((ts - state.lastTime) / 1000 || 0.016, 0.033);
  state.lastTime = ts;

  update(dt);
  render();
  requestAnimationFrame(frame);
}

canvas.addEventListener('pointermove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * WORLD.width;
  state.pointerX = clamp(x, 20, WORLD.width - 20);
  state.pointerActive = true;
  player.x = state.pointerX;
});

canvas.addEventListener('pointerdown', () => {
  if (!state.running) {
    resetGame();
  }
  state.pointerActive = true;
  shoot();
  state.shotCooldown = 0.12;
});

canvas.addEventListener('pointerleave', () => {
  state.pointerActive = false;
});

startBtn.addEventListener('click', () => {
  resetGame();
});

restartBtn.addEventListener('click', () => {
  resetGame();
});

state.lastTime = performance.now();
requestAnimationFrame(frame);

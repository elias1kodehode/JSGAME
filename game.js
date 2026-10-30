const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const balls = [];
const arena = {
  width: 800,
  height: 600,
};
const room = {
  depth: 120,
};
const margin = 120;
const scene = {
  width: arena.width + margin * 2,
  height: arena.height + margin * 2,
};
const sceneWrapper = document.querySelector(".scene-wrapper");
const playArea = document.querySelector(".play-area");
const backgroundCanvas = document.getElementById("room-background");
const foregroundCanvas = document.getElementById("room-foreground");
const gameLayer = document.querySelector(".game-layer");
const topHud = document.querySelector(".top-hud");
const controls = document.getElementById("controls");
window.addEventListener("resize", resizeScene);

function resizeScene() {
  const availableHeight =
    window.innerHeight - (topHud.offsetHeight + controls.offsetHeight + 32);

  const scale = Math.min(
    1,
    window.innerWidth / scene.width,
    availableHeight / scene.height,
  );
  const wrapperWidth = scene.width * scale;
  const wrapperHeight = scene.height * scale;
  sceneWrapper.style.width = `${wrapperWidth}px`;
  sceneWrapper.style.height = `${wrapperHeight}px`;
  playArea.style.transform = `scale(${scale})`;
  console.log({
    scale,
    wrapperWidth,
    wrapperHeight,
  });
}
resizeScene();

gameLayer.style.width = `${arena.width}px`;
gameLayer.style.height = `${arena.height}px`;
backgroundCanvas.width = foregroundCanvas.width = scene.width;
backgroundCanvas.height = foregroundCanvas.height = scene.height;
playArea.style.width = `${scene.width}px`;
playArea.style.height = `${scene.height}px`;

const fgCtx = foregroundCanvas.getContext("2d");
const roomColors = {
  foreground: {
    floor: "#71849D",
    ceiling: "#36465C",
    leftWall: "#5C718A",
    rightWall: "#40546D",
  },
  background: {
    floor: "#95A7BA",
    ceiling: "#63778F",
    leftWall: "#8298B0",
    rightWall: "#677E99",
    backWall: "#B7C7D7",
  },
};
function drawForeground() {
  fgCtx.beginPath();
  fgCtx.moveTo(margin, margin + arena.height);
  fgCtx.lineTo(margin + arena.width, margin + arena.height);
  fgCtx.lineTo(scene.width, scene.height);
  fgCtx.lineTo(0, scene.height);
  fgCtx.closePath();
  fgCtx.fillStyle = roomColors.foreground.floor;
  fgCtx.fill();

  fgCtx.beginPath();
  fgCtx.moveTo(0, 0);
  fgCtx.lineTo(margin, margin);
  fgCtx.lineTo(margin, margin + arena.height);
  fgCtx.lineTo(0, scene.height);
  fgCtx.closePath();
  fgCtx.fillStyle = roomColors.foreground.leftWall;
  fgCtx.fill();

  fgCtx.beginPath();
  fgCtx.moveTo(0, 0);
  fgCtx.lineTo(margin, margin);
  fgCtx.lineTo(margin + arena.width, margin);
  fgCtx.lineTo(scene.width, 0);
  fgCtx.closePath();
  fgCtx.fillStyle = roomColors.foreground.ceiling;
  fgCtx.fill();

  fgCtx.beginPath();
  fgCtx.moveTo(scene.width, 0);
  fgCtx.lineTo(arena.width + margin, margin);
  fgCtx.lineTo(arena.width + margin, arena.height + margin);
  fgCtx.lineTo(scene.width, scene.height);
  fgCtx.closePath();
  fgCtx.fillStyle = roomColors.foreground.rightWall;
  fgCtx.fill();
}
drawForeground();
const bgCtx = backgroundCanvas.getContext("2d");
function drawBackground() {
  bgCtx.beginPath();
  bgCtx.moveTo(margin, margin);
  bgCtx.lineTo(margin + room.depth, margin + room.depth);
  bgCtx.lineTo(margin + arena.width - room.depth, margin + room.depth);
  bgCtx.lineTo(margin + arena.width, margin);
  bgCtx.closePath();
  bgCtx.fillStyle = roomColors.background.ceiling;
  bgCtx.fill();

  bgCtx.beginPath();
  bgCtx.moveTo(margin, margin);
  bgCtx.lineTo(margin + room.depth, margin + room.depth);
  bgCtx.lineTo(margin + room.depth, margin + arena.height - room.depth);
  bgCtx.lineTo(margin, margin + arena.height);
  bgCtx.closePath();
  bgCtx.fillStyle = roomColors.background.leftWall;
  bgCtx.fill();

  bgCtx.beginPath();
  bgCtx.moveTo(margin, margin + arena.height);
  bgCtx.lineTo(margin + arena.width, margin + arena.height);
  bgCtx.lineTo(
    margin + arena.width - room.depth,
    margin + arena.height - room.depth,
  );
  bgCtx.lineTo(margin + room.depth, margin + arena.height - room.depth);
  bgCtx.closePath();
  bgCtx.fillStyle = roomColors.background.floor;
  bgCtx.fill();

  bgCtx.beginPath();
  bgCtx.moveTo(margin + arena.width, margin);
  bgCtx.lineTo(margin + arena.width - room.depth, margin + room.depth);
  bgCtx.lineTo(
    margin + arena.width - room.depth,
    margin + arena.height - room.depth,
  );
  bgCtx.lineTo(margin + arena.width, margin + arena.height);
  bgCtx.closePath();
  bgCtx.fillStyle = roomColors.background.rightWall;
  bgCtx.fill();

  bgCtx.fillStyle = "#B7C7D7";
  bgCtx.fillRect(
    margin + room.depth,
    margin + room.depth,
    arena.width - 2 * room.depth,
    arena.height - 2 * room.depth,
  );
}
drawBackground();
const player = {
  height: 50,
  width: 30,
  x: 0,
  y: arena.height - 50,
  vx: 0, // px/s
  acceleration: 500, // px/s^2
  deceleration: 700, // px/s^2
  reversalMultiplier: 2, //
  maxSpeed: 300, // px/s
  restitution: 0.5,
  facing: "right",
  invincibility: 1,
  invincibilityRemaining: 0,
};
const game = {
  survivalTime: 0,
  currency: 0,
  endCurrency: 0,
  longestSurvivalTime: Number(localStorage.getItem("longestSurvivalTime") ?? 0),
  bankedCurrency: Number(localStorage.getItem("bankedCurrency") ?? 0),
  lives: 1,
  state: "playing",
  spawnInterval: 10,
  nextSpawnTime: 10,
  ballsPerSpawn: 1,
};
const upgrades = {
  //player
  lives: 0,
  invincibility: 0,
  //movement
  acceleration: 0,
  braking: 0,
  maxSpeed: 0,
  //Harpoon
  maxHarpoons: 0,
  harpoonAcceleration: 0,
  harpoonDuration: 0,
  harpoonPierce: 0,
};
const harpoonStats = {
  maxHarpoons: 1,
  harpoonAcceleration: 1000,
  harpoonDuration: 2,
  harpoonPierce: 0,
};
const upgradeConfig = {
  lives: {
    bonusPerLevel: 1,
    baseCost: 8,
    maxLevel: 10,
  },
  invincibility: {
    bonusPerLevel: 0.5,
    baseCost: 50,
    maxLevel: 4,
  },
  acceleration: {
    bonusPerLevel: 50,
    baseCost: 5,
    maxLevel: 20,
  },
  braking: {
    bonusPerLevel: 50,
    baseCost: 5,
    maxLevel: 20,
  },
  maxSpeed: {
    bonusPerLevel: 25,
    baseCost: 5,
    maxLevel: 20,
  },
  maxHarpoons: {
    bonusPerLevel: 1,
    baseCost: 15,
    maxLevel: 5,
  },
  harpoonAcceleration: {
    bonusPerLevel: 100,
    baseCost: 10,
    maxLevel: 10,
  },
  harpoonDuration: {
    bonusPerLevel: 0.5,
    baseCost: 10,
    maxLevel: 10,
  },
  harpoonPierce: {
    bonusPerLevel: 1,
    baseCost: 35,
    maxLevel: 5,
  },
};
const baseStats = {
  lives: 1,
  invincibility: 1,
  acceleration: 500,
  braking: 700,
  maxSpeed: 300,
  maxHarpoons: 1,
  harpoonAcceleration: 1000,
  harpoonDuration: 2,
  harpoonPierce: 0,
};
let harpoon = null;
let harpoons = [];
const coins = [];
let movingRight = false;
let movingLeft = false;

const gravity = 1000;
const bounceSpeed = 400;
let lastTime = 0;
// !PLAYERSTATS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function applyUpgrades() {
  game.lives = calculateStat("lives");
  player.invincibility = calculateStat("invincibility");
  player.acceleration = calculateStat("acceleration");
  player.deceleration = calculateStat("braking");
  player.maxSpeed = calculateStat("maxSpeed");
  harpoonStats.maxHarpoons = calculateStat("maxHarpoons");
  harpoonStats.harpoonAcceleration = calculateStat("harpoonAcceleration");
  harpoonStats.harpoonDuration = calculateStat("harpoonDuration");
  harpoonStats.harpoonPierce = calculateStat("harpoonPierce");

  // for (let key in upgrades) {
  //   if (upgradeConfig[key] !== undefined) {
  //     player[key] =
  //       baseStats[key] + upgrades[key] * upgradeConfig[key].bonusPerLevel;
  //   }
  // }
}
function calculateStat(key) {
  return baseStats[key] + upgrades[key] * upgradeConfig[key].bonusPerLevel;
}
// !GAMELOOP !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function gameLoop(timestamp) {
  if (!lastTime) {
    lastTime = timestamp;
  }
  let dt = (timestamp - lastTime) * 0.001;
  if (dt >= 0.1) {
    dt = 0;
  }
  lastTime = timestamp;

  if (game.state === "playing") {
    updateGame(dt);
    invincibilityTimer(dt);
    // DIAG recordPlayerVelocity(player, dt);
    // DIAG drawVelocityGraph();
    showTime();
  }
  drawGame();
  requestAnimationFrame(gameLoop);
}

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !UPDATE GAME!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function updateGame(dt) {
  const collisionIterations = 3;

  balls.forEach((ball) => {
    updateBall(ball, dt);
  });
  updatePlayer(player, dt);
  for (let index = 0; index < collisionIterations; index++) {
    checkAllBallCollisions(balls);
  }
  balls.forEach((ball) => {
    correctBallBoundaries(ball);
  });

  updateHarpoons(dt);
  if (
    player.invincibilityRemaining === 0 &&
    balls.some((ball) => checkPlayerObjectCollision(player, ball))
  ) {
    game.lives--;
    updateLives();
    if (game.lives === 0) {
      endGame();
      return;
    }
    player.invincibilityRemaining = player.invincibility;
  }
  updateCoins(dt);
  //DIAG COMMENT OUT
  //updatePlayerInfo(player);
  updateSpawning();
  game.survivalTime += dt;
}

function updateHarpoons(dt) {
  for (let i = harpoons.length - 1; i >= 0; i--) {
    if (updateHarpoon(harpoons[i], dt)) {
      harpoons.splice(i, 1);
    } else {
      const hitBall = balls.find((ball) => {
        return checkHarpoonBallCollision(harpoons[i], ball);
      });
      if (hitBall) {
        balls.splice(balls.indexOf(hitBall), 1);
        if (harpoons[i].pierce === 0) {
          harpoons.splice(i, 1);
        } else {
          harpoons[i].pierce--;
        }
        if (hitBall.radius > 10) {
          balls.push(...splitBall(hitBall));
        } else {
          spawnCoin(hitBall.x, hitBall.y);
        }
      }
    }
  }
}

function updateSpawning() {
  if (game.survivalTime >= game.nextSpawnTime) {
    for (let i = 0; i < game.ballsPerSpawn; i++) {
      const randomVx = Math.random() < 0.5 ? -200 : 200;
      const randomX = Math.floor(Math.random() * (arena.width - 40 - 40) + 40);
      balls.push({
        x: randomX,
        y: 40,
        radius: 40,
        vx: randomVx,
        vy: 0,
      });
    }
    game.nextSpawnTime += game.spawnInterval;
  }
}

// !DRAW GAME!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  balls.forEach((ball) => {
    drawBall(ball);
  });
  drawCoins();
  drawHarpoons();
  drawPlayer(player);
}
function drawHarpoons() {
  harpoons.forEach((harpoon) => {
    drawHarpoon(harpoon);
  });
}
// !STORAGE!!!!!!!!!!!!!!!!!!!!!
function storeToLocal(key, value) {}
// !GAME STATES!!!!!!!!!!!!!
function endGame() {
  if (game.state === "playing") {
    game.state = "gameOver";
    game.bankedCurrency += game.currency;
    game.endCurrency = game.currency;
    game.currency = 0;
    if (game.survivalTime > game.longestSurvivalTime) {
      game.longestSurvivalTime = game.survivalTime;
      storeLongestSurvivalTime();
    }
    storeBankedCurrency();
    console.log("Banked currency: " + game.bankedCurrency);
    console.log("Acceleration: " + player.acceleration);
    console.log("Deceleration: " + player.deceleration);
    console.log("Lives: " + game.lives);
    console.log("maxHarpoons: " + harpoonStats.maxHarpoons);
    console.log("maxSpeed: " + player.maxSpeed);
    console.log("harpoonAcceleration: " + harpoonStats.harpoonAcceleration);
    console.log("harpoonDuration: " + harpoonStats.harpoonDuration);

    console.log(": " + player);
  }
  updateUi();
}
function storeLongestSurvivalTime() {
  localStorage.setItem("longestSurvivalTime", game.longestSurvivalTime);
}
function restartGame() {
  game.ballsPerSpawn = 1;
  game.nextSpawnTime = game.spawnInterval;
  game.survivalTime = 0;
  game.currency = 0;
  player.x = 0;
  player.vx = 0;
  movingLeft = false;
  movingRight = false;
  harpoons.length = 0;
  coins.length = 0;
  initializeBalls();
  applyUpgrades();
  game.state = "playing";
  updateUi();
}

function initializeBalls() {
  balls.length = 0;
  balls.push({
    x: 200,
    y: 100,
    radius: 40,
    vx: 200,
    vy: 0,
  });
}
// !UI!!!!!!!!!!!!!
const restartButton = document.getElementById("restart-button");
restartButton.addEventListener("click", restartGame);

const shopButton = document.getElementById("shop-button");
shopButton.addEventListener("click", openShop);

const exitShopButton = document.getElementById("shop-back-button");
exitShopButton.addEventListener("click", closeShop);

function updateUi() {
  const overlay = document.getElementById("game-over-overlay");
  overlay.classList.toggle("visible", game.state === "gameOver");
  document.getElementById("survival-time-text").innerText =
    timer.innerText + " (" + fixTime(game.longestSurvivalTime) + ")";
  document.getElementById("coins-acquired-text").innerText = game.endCurrency;
  const shopOverlay = document.getElementById("shop-overlay");
  shopOverlay.classList.toggle("visible", game.state === "shop");
  updateCurrency();
  updateLives();
}
function fixTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
function openShop() {
  game.state = "shop";
  populateShop();
  updateUi();
}
function closeShop() {
  game.state = "gameOver";
  updateUi();
}
function populateShop() {
  const container = document.getElementById("shop-container");
  container.replaceChildren();
  for (const [key, config] of Object.entries(upgradeConfig)) {
    const card = document.createElement("div");
    const buyButton = document.createElement("button");
    buyButton.innerText = `${config.baseCost} 🪙`;

    card.textContent = `${upgrades[key]}/${config.maxLevel} ${key}`;
    buyButton.addEventListener("click", () => {
      if (
        game.bankedCurrency >= config.baseCost &&
        upgrades[key] < config.maxLevel
      ) {
        game.bankedCurrency -= config.baseCost;
        upgrades[key] += 1;
        populateShop();
        updateUi();
        storeBankedCurrency();
        storeStatsToLocal();
      }
    });
    card.appendChild(buyButton);
    container.append(card);
    console.log(key + " costs " + config.baseCost + " coins");
  }
  container.append(exitShopButton);
}
function storeStatsToLocal() {
  console.log(JSON.stringify(upgrades));
  const upgradeString = JSON.stringify(upgrades);
  localStorage.setItem("upgrades", upgradeString);
}
function storeBankedCurrency() {
  localStorage.setItem("bankedCurrency", game.bankedCurrency);
}
function getStatsFromLocal() {
  const upgradesFromString = JSON.parse(localStorage.getItem("upgrades"));
  if (upgradesFromString !== null) {
    for (let key in upgrades) {
      upgrades[key] = upgradesFromString[key];
    }
  }
}
const resetAllUpgradesButton = document.getElementById("reset-progress-button");
resetAllUpgradesButton.addEventListener("click", resetAllUpgrades);
function resetAllUpgrades() {
  for (let key in upgrades) {
    upgrades[key] = 0;
  }
  game.bankedCurrency = 0;
  storeBankedCurrency();
  game.longestSurvivalTime = 0;
  storeLongestSurvivalTime();
  storeStatsToLocal();
  updateUi();
}
function buyUpgrade(key) {}
// !COINS!!!!!!!!!!!!!!!
function spawnCoin(x, y) {
  coins.push({
    x: x,
    y: y,
    radius: 8,
    vx: 0,
    vy: 0,
    restitution: 0.3,
    value: 1,
  });
}
function drawCoin(coin) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, coin.radius, 0, 2 * Math.PI);
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.restore();
}
function drawCoins() {
  coins.forEach((coin) => {
    drawCoin(coin);
  });
}
function updateCoin(coin, dt) {
  coin.vy += gravity * dt;
  coin.y += coin.vy * dt;
  if (coin.y + coin.radius >= arena.height) {
    if (Math.abs(coin.vy) <= 30) {
      coin.vy = 0;
      coin.y = arena.height - coin.radius;
    } else {
      coin.vy = -(coin.vy * coin.restitution);
      coin.y = arena.height - coin.radius;
    }
  }
}
function updateCoins(dt) {
  for (let i = coins.length - 1; i >= 0; i--) {
    updateCoin(coins[i], dt);
    if (checkPlayerObjectCollision(player, coins[i])) {
      game.currency += coins[i].value;
      coins.splice(i, 1);
      updateCurrency();
    }
  }
}

// !TIMER!!!!!!!!!!!!!
let timer = document.getElementById("survival-time");
function showTime() {
  const minutes = Math.floor(game.survivalTime / 60);
  const seconds = Math.floor(game.survivalTime % 60);
  timer.innerText = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateLives() {
  document.getElementById("life-container").innerText =
    "❤️".repeat(game.lives) + "🖤".repeat(calculateStat("lives") - game.lives);
}

function updateCurrency() {
  document.getElementById("currency").innerText =
    `${game.currency}🪙 (${game.bankedCurrency}💰)`;
}

// BALL !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// const ballSprite = {
//   10: createBallSprite(20),
//   20: createBallSprite(40),
//   40: createBallSprite(80),
// };
const light = {
  x: arena.width / 2,
  y: -margin / 2,
  z: 150,
};
function drawBall(ball) {
  // ctx.beginPath();
  // ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
  // ctx.stroke();

  const dx = light.x - ball.x;
  const dy = light.y - ball.y;
  const L = Math.hypot(dx, dy, light.z);
  const lx = dx / L;
  const ly = dy / L;
  const lz = light.z / L;
  const intensity = Math.max(0, 1 - L / 1000);

  const ballSprite = ballSprites[ball.radius];

  updateBallSprite(ballSprite, lx, ly, lz, intensity);

  ctx.drawImage(
    ballSprite.canvas,
    ball.x - ball.radius,
    ball.y - ball.radius,
    ball.radius * 2,
    ball.radius * 2,
  );
}
function splitBall(parent) {
  const leftChild = {
    x: parent.x - parent.radius / 2,
    y: parent.y,
    vx: parent.vx / 2,
    vy: parent.vy / 2,
    radius: parent.radius / 2,
  };
  const rightChild = {
    x: parent.x + parent.radius / 2,
    y: parent.y,
    vx: parent.vx / 2,
    vy: parent.vy / 2,
    radius: parent.radius / 2,
  };
  const splitImpulse = 150;
  leftChild.vx -= splitImpulse;
  rightChild.vx += splitImpulse;
  const verticalSplitImpulse = 300;
  leftChild.vy -= verticalSplitImpulse;
  rightChild.vy -= verticalSplitImpulse;

  return [leftChild, rightChild];
}

function checkBallBallCollision(ballA, ballB) {
  const distance = Math.sqrt(
    (ballB.x - ballA.x) ** 2 + (ballB.y - ballA.y) ** 2,
  );

  const normalVectorX = (ballB.x - ballA.x) / distance;
  const normalVectorY = (ballB.y - ballA.y) / distance;

  const relativeVx = ballB.vx - ballA.vx;
  const relativeVy = ballB.vy - ballA.vy;

  const relativeDot = normalVectorX * relativeVx + normalVectorY * relativeVy;

  if (distance <= ballA.radius + ballB.radius) {
    return { distance, normalVectorX, normalVectorY, relativeDot };
  } else {
    return null;
  }
}
function resolveBallCollision(ballA, ballB, collision) {
  const massA = ballA.radius ** 2;
  const massB = ballB.radius ** 2;
  const e = 1;
  const collisionImpulse =
    -((1 + e) * collision.relativeDot) / (1 / massA + 1 / massB);

  const overlap = ballA.radius + ballB.radius - collision.distance;
  const correctionA = overlap * (massB / (massA + massB));
  const correctionB = overlap * (massA / (massA + massB));

  ballA.x += -(correctionA * collision.normalVectorX);
  ballB.x += correctionB * collision.normalVectorX;
  ballA.y += -(correctionA * collision.normalVectorY);
  ballB.y += correctionB * collision.normalVectorY;

  if (collision.relativeDot >= 0) {
    //NO IMPULSE BALLS ARE NOT APPROACHING EACHOTHER
  } else {
    ballA.vx += -(collisionImpulse / massA) * collision.normalVectorX;
    ballB.vx += (collisionImpulse / massB) * collision.normalVectorX;
    ballA.vy += -(collisionImpulse / massA) * collision.normalVectorY;
    ballB.vy += (collisionImpulse / massB) * collision.normalVectorY;
  }
}
function checkAllBallCollisions(balls) {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const collision = checkBallBallCollision(balls[i], balls[j]);
      if (collision) {
        resolveBallCollision(balls[i], balls[j], collision);
      }
    }
  }
}
function correctBallBoundaries(ball) {
  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    if (ball.vx < 0) {
      ball.vx = -ball.vx;
    }
  }
  if (ball.x + ball.radius > arena.width) {
    ball.x = arena.width - ball.radius;
    if (ball.vx > 0) {
      ball.vx = -ball.vx;
    }
  }
  if (ball.y + ball.radius > arena.height) {
    ball.y = arena.height - ball.radius;
    if (ball.vy > 0) {
      ball.vy = -ball.vy;
    }
  }
}
// BALL !!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// PLAYER COLLISION !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function checkPlayerObjectCollision(player, object) {
  const closestX = Math.min(
    Math.max(object.x, player.x),
    player.x + player.width,
  );
  const closestY = Math.min(
    Math.max(object.y, player.y),
    player.y + player.height,
  );

  return (
    Math.sqrt((closestX - object.x) ** 2 + (closestY - object.y) ** 2) <=
    object.radius
  );
}
// PLAYER COLLISION !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function invincibilityTimer(dt) {
  player.invincibilityRemaining = Math.max(
    player.invincibilityRemaining - dt,
    0,
  );
}
// PLAYER !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function drawPlayer(player) {
  ctx.save();

  if (player.invincibilityRemaining !== 0) {
    ctx.globalAlpha =
      0.65 + 0.3 * Math.sin(2 * Math.PI * 3 * player.invincibilityRemaining);
  }
  let eyeX;
  const eyeY = player.y + 5;
  if (player.facing === "left") {
    eyeX = player.x + 4;
  } else if (player.facing === "right") {
    eyeX = player.x + player.width - 4;
  }
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, 3, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.restore();
}
function updatePlayer(player, dt) {
  // NEW MOVEMENT

  if (movingLeft === movingRight) {
    // break
    if (player.vx > 0) {
      player.vx = Math.max(0, player.vx - player.deceleration * dt);
    } else if (player.vx < 0) {
      player.vx = Math.min(0, player.vx + player.deceleration * dt);
    } else {
      player.vx = 0;
    }
  } else {
    if (movingRight) {
      //reversal check

      if (player.vx < 0) {
        player.vx += player.acceleration * player.reversalMultiplier * dt;
      } else {
        player.vx += player.acceleration * dt;
      }
      if (player.vx > player.maxSpeed) {
        player.vx = player.maxSpeed;
      }
    } else {
      //Moving Left

      if (player.vx > 0) {
        player.vx -= player.acceleration * player.reversalMultiplier * dt;
      } else {
        player.vx -= player.acceleration * dt;
      }
      if (player.vx < -player.maxSpeed) {
        player.vx = -player.maxSpeed;
      }
    }
  }

  // PLAYER MOVEMENT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  player.x += player.vx * dt;

  // COLLISION!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  if (player.x + player.width >= arena.width && player.vx > 0) {
    player.x = arena.width - player.width;
    player.vx = -player.vx * player.restitution;
  }
  if (player.x <= 0 && player.vx < 0) {
    player.x = 0;
    player.vx = -player.vx * player.restitution;
  }
}
// PLAYER !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// HARPOON !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

function shootHarpoon(player) {
  let shootY = player.y;
  let shootX;
  let tip = shootY;
  let speed = 0;
  let acceleration = harpoonStats.harpoonAcceleration;
  let duration = harpoonStats.harpoonDuration;
  let pierce = harpoonStats.harpoonPierce;
  let timer = 0;
  if (player.facing === "right") {
    shootX = player.x + player.width;
  }
  if (player.facing === "left") {
    shootX = player.x;
  }

  return {
    shootX,
    shootY,
    tip,
    speed,
    acceleration,
    duration,
    pierce,
    timer,
  };
}
function checkHarpoonBallCollision(harpoon, ball) {
  const closestY = Math.min(Math.max(ball.y, harpoon.tip), arena.height);
  const closestX = harpoon.shootX;
  return (
    Math.sqrt((closestX - ball.x) ** 2 + (closestY - ball.y) ** 2) <=
    ball.radius
  );
}
function drawHarpoon(harpoon) {
  ctx.beginPath();
  ctx.moveTo(harpoon.shootX, arena.height);
  ctx.lineTo(harpoon.shootX, harpoon.tip);
  ctx.stroke();
}
function updateHarpoon(harpoon, dt) {
  if (harpoon.tip > 0) {
    harpoon.speed += harpoon.acceleration * dt;
    harpoon.tip -= harpoon.speed * dt;
    return false;
  } else {
    harpoon.speed = 0;
    harpoon.tip = 0;
    if (harpoon.timer < harpoon.duration) {
      harpoon.timer += dt;
      return false;
    } else {
      return true;
    }
  }
}

// HARPOON !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// KEY HANDLING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
document.addEventListener("keydown", (event) => {
  event.preventDefault();
  if (game.state === "playing") {
    if (event.key === "ArrowRight" || event.key === "d") {
      movingRight = true;
      if (!event.repeat) {
        player.facing = "right";
      }
    }
    if (event.key === "ArrowLeft" || event.key === "a") {
      movingLeft = true;
      if (!event.repeat) {
        player.facing = "left";
      }
    }
    if (event.key === " ") {
      if (!event.repeat) {
        if (harpoons.length < harpoonStats.maxHarpoons) {
          harpoons.push(shootHarpoon(player));
        }
      }
    }
    if (event.key === "Enter") {
      balls.push({
        x: Math.floor(Math.random() * 100) + 100,
        y: Math.floor(Math.random() * 100) + 100,
        radius: 40,
        vx: Math.floor(Math.random() * 100) + 100,
        vy: 0,
      });
    }
  } else if (game.state === "gameOver") {
    if (event.key === "Enter") {
      restartGame();
    }
  }
});
document.addEventListener("keyup", (event) => {
  event.preventDefault();
  if (event.key === "ArrowRight" || event.key === "d") {
    movingRight = false;
    if (movingLeft) {
      player.facing = "left";
    }
  }
  if (event.key === "ArrowLeft" || event.key === "a") {
    movingLeft = false;
    if (movingRight) {
      player.facing = "right";
    }
  }
});
// KEY HANDLING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

let highestPoint = arena.height;
function updateBall(ball, dt) {
  const y0 = ball.y;
  const vy0 = ball.vy;
  const x0 = ball.x;

  ball.vy += gravity * dt;
  ball.x += ball.vx * dt;

  ball.y = y0 + vy0 * dt + 0.5 * gravity * dt ** 2;

  handleHorizontalCollision(ball, x0, dt);
  if (ball.y < highestPoint) {
    highestPoint = ball.y;
  }
  if (ball.y + ball.radius >= arena.height) {
    // console.log("Impact velocity before:", ball.vy);
    // console.log("Floor penetration:", ball.y + ball.radius - canvas.height);
    const D =
      vy0 ** 2 - 4 * (0.5 * gravity) * (y0 - arena.height + ball.radius);
    const t1 = (-vy0 + Math.sqrt(D)) / gravity;
    const t2 = (-vy0 - Math.sqrt(D)) / gravity;
    let collisionTime;
    if (t1 > 0 && t1 <= dt) {
      collisionTime = t1;
    }
    if (t2 > 0 && t2 <= dt) {
      collisionTime = t2;
    }
    if (collisionTime !== undefined) {
      const remainingTime = dt - collisionTime;
      const impactVelocity = vy0 + gravity * collisionTime;
      const reboundVelocity = -impactVelocity;
      const impactY = arena.height - ball.radius;
      ball.y =
        impactY +
        reboundVelocity * remainingTime +
        0.5 * gravity * remainingTime ** 2;
      ball.vy = reboundVelocity + gravity * remainingTime;
      // console.log("HIT: Impact velocity:", impactVelocity);
      // console.log("HIT: Rebound velocity" + reboundVelocity);
      // console.log("HIT: Highest point during bounce: " + highestPoint);
      highestPoint = arena.height;
      const t = -reboundVelocity / gravity;
      const highestPointTheoretical =
        impactY + reboundVelocity * t + 0.5 * (gravity * t ** 2);
      // console.log("HIT: Theoretical height: " + highestPointTheoretical);
    }
  }
  // if (ball.x + ball.radius >= canvas.width || ball.x - ball.radius <= 0) {
  //   handleHorizontalCollision(ball, x0, dt);
  // }
  // if (ball.x + ball.radius >= canvas.width) {
  //   ball.x = canvas.width - ball.radius;
  //   ball.vx = -ball.vx;
  // }
  // if (ball.x - ball.radius <= 0) {
  //   ball.x = 0 + ball.radius;
  //   ball.vx = -ball.vx;
  // }
  if (ball.y - ball.radius <= 0) {
    ball.y = 0 + ball.radius;
    ball.vy = -ball.vy;
  }
}

function handleHorizontalCollision(ball, x0, dt) {
  const collisionX = ball.vx > 0 ? canvas.width - ball.radius : ball.radius;
  if (ball.vx !== 0) {
    const collisionTime = (collisionX - x0) / ball.vx;
    if (collisionTime >= 0 && collisionTime <= dt) {
      ball.x = collisionX;
      ball.vx = -ball.vx;
      ball.x += ball.vx * (dt - collisionTime);
    }
  }
}

// DIAGNOSTICS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// const playerXInfo = document.getElementById("player-x");
// const playerVxInfo = document.getElementById("player-vx");
// const playerAcceleration = document.getElementById("player-acceleration");

// function updatePlayerInfo(player) {
//   playerXInfo.innerText = player.x.toFixed(2);
//   playerVxInfo.innerText = player.vx.toFixed(2);
//   playerAcceleration.innerText = player.acceleration;
// }

// const accelerationSlider = document.getElementById("acceleration-slider");
// const accelerationDisplay = document.getElementById("acceleration-value");
// const decelerationSlider = document.getElementById("deceleration-slider");
// const decelerationDisplay = document.getElementById("deceleration-value");

// accelerationSlider.addEventListener("change", () => {
//   player.acceleration = accelerationSlider.value;
//   accelerationDisplay.innerText = player.acceleration;
// });

// decelerationSlider.addEventListener("change", () => {
//   player.deceleration = decelerationSlider.value;
//   decelerationDisplay.innerText = player.deceleration;
// });

// !!!!!!!!!! GRAPH !!!!!!!!!!!!!!!!!!!!!!!!!!

// let sampleTimer = 0;
// const sampleInterval = 0.0333;
// const velocityHistory = [];
// const historyDuration = 10;
// const maxSamples = Math.round(historyDuration / sampleInterval);
// function recordPlayerVelocity(player, dt) {
//   sampleTimer += dt;

//   if (sampleTimer >= sampleInterval) {
//     velocityHistory.push(player.vx);
//     sampleTimer -= sampleInterval;
//     if (velocityHistory.length > maxSamples) {
//       velocityHistory.shift();
//     }
//   }
// }

// const graphCanvas = document.getElementById("velocity-graph");
// const graphCtx = graphCanvas.getContext("2d");
// function drawVelocityGraph() {
//   graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
//   const graphingRatio = -(graphCanvas.height / (player.maxSpeed * 2));

//   graphCtx.beginPath();
//   graphCtx.moveTo(0, graphCanvas.height / 2);
//   graphCtx.lineTo(graphCanvas.width, graphCanvas.height / 2);
//   graphCtx.stroke();
//   let graphX = graphCanvas.width;
//   const graphGap = graphCanvas.width / maxSamples;
//   graphCtx.beginPath();
//   for (let index = velocityHistory.length - 1; index >= 0; index--) {
//     const graphY =
//       graphingRatio * velocityHistory[index] + graphCanvas.height / 2;
//     if (index === velocityHistory.length - 1) {
//       graphCtx.moveTo(graphX, graphY);
//     } else {
//       graphCtx.lineTo(graphX, graphY);
//     }

//     //DRAW
//     graphX -= graphGap;
//   }
//   graphCtx.stroke();
// }
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
getStatsFromLocal();
applyUpgrades();
updateLives();
updateCurrency();
initializeBalls();
requestAnimationFrame(gameLoop);

// !GRAPHICS!!!!!!!!!!!!!!!!!!!!!!!!!!

function createBallSprite(size) {
  const spriteCanvas = document.createElement("canvas");
  spriteCanvas.height = size;
  spriteCanvas.width = size;
  const spriteCtx = spriteCanvas.getContext("2d");
  const imageData = spriteCtx.createImageData(size, size);
  const normals = [];

  const center = (size - 1) / 2;
  const radius = size / 2;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const dx = i - center;
      const dy = j - center;

      if (dx ** 2 + dy ** 2 <= radius ** 2) {
        const z = Math.sqrt(radius ** 2 - dx ** 2 - dy ** 2);

        //NormalVector
        const nx = dx / radius;
        const ny = dy / radius;
        const nz = z / radius;
        const index = (j * size + i) * 4;

        normals.push({ index, nx, ny, nz });
        //   const lightness = 15 + 50 * brightness;
        //   spriteCtx.fillStyle = `hsl(215, 85%, ${lightness}%)`;
        //   spriteCtx.fillRect(i, j, 1, 1);
      }
    }
  }
  return {
    canvas: spriteCanvas,
    ctx: spriteCtx,
    imageData: imageData,
    size: size,
    normals: normals,
  };
}

function updateBallSprite(sprite, lx, ly, lz, intensity) {
  const { data } = sprite.imageData;
  for (const normal of sprite.normals) {
    const { nx, ny, nz, index } = normal;
    const diffuse = Math.max(0, nx * lx + ny * ly + nz * lz);
    const brightness = diffuse * intensity;
    const red = 12 + (65 - 12) * brightness;
    const green = 30 + (150 - 30) * brightness;
    const blue = 65 + (255 - 65) * brightness;

    data[index] = red;
    data[index + 1] = green;
    data[index + 2] = blue;
    data[index + 3] = 255;
  }
  sprite.ctx.putImageData(sprite.imageData, 0, 0);
}

const ballSprites = {
  10: createBallSprite(20),
  20: createBallSprite(40),
  40: createBallSprite(80),
};

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const balls = [];
const player = {
  height: 50,
  width: 30,
  x: 0,
  y: canvas.height - 50,
  vx: 0, // px/s
  acceleration: 500, // px/s^2
  deceleration: 700, // px/s^2
  reversalMultiplier: 2, //
  maxSpeed: 300, // px/s
  restitution: 0.5,
  facing: "right",
  maxHarpoons: 1,
};
const game = {
  survivalTime: 0,
  currency: 0,
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
  harpoonSpeed: 0,
  harpoonDuration: 0,
  harpoonPierce: 0,
};
const upgradeConfig = {
  acceleration: {
    bonusPerLevel: 50,
    baseCost: 5,
    maxLevel: 20,
  },
};
const baseStats = {
  acceleration: 500,
  braking: 700,
  maxSpeed: 300,
};
let harpoon = null;
let harpoons = [];
const coins = [];
let movingRight = false;
let movingLeft = false;

const gravity = 1000;
const bounceSpeed = 400;
let lastTime = 0;

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
    recordPlayerVelocity(player, dt);
    drawVelocityGraph();
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
  if (balls.some((ball) => checkPlayerObjectCollision(player, ball))) {
    endGame();
    return;
  }
  updateCoins(dt);
  updatePlayerInfo(player);
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
        harpoons.splice(i, 1);
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
      const randomX = Math.floor(Math.random() * (canvas.width - 40 - 40) + 40);
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
    localStorage.setItem("bankedCurrency", game.bankedCurrency);
    console.log(game.bankedCurrency);
  }
  updateUi();
}
function restartGame() {
  game.ballsPerSpawn = 1;
  game.nextSpawnTime = game.spawnInterval;
  game.survivalTime = 0;
  game.currency = 0;
  player.x = 0;
  player.vx = 0;
  player.movingLeft = false;
  player.movingRight = false;
  harpoons.length = 0;
  coins.length = 0;
  initializeBalls();
  game.state = "playing";
  updateUi();
}
const restartButton = document.getElementById("restart-button");
restartButton.addEventListener("click", restartGame);

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
function updateUi() {
  const overlay = document.getElementById("game-over-overlay");
  overlay.classList.toggle("visible", game.state === "gameOver");
  document.getElementById("survival-time-text").innerText = timer.innerText;
  document.getElementById("coins-acquired-text").innerText = game.currency;
}
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
  if (coin.y + coin.radius >= canvas.height) {
    if (Math.abs(coin.vy) <= 30) {
      coin.vy = 0;
      coin.y = canvas.height - coin.radius;
    } else {
      coin.vy = -(coin.vy * coin.restitution);
      coin.y = canvas.height - coin.radius;
    }
  }
}
function updateCoins(dt) {
  for (let i = coins.length - 1; i >= 0; i--) {
    updateCoin(coins[i], dt);
    if (checkPlayerObjectCollision(player, coins[i])) {
      game.currency += coins[i].value;
      coins.splice(i, 1);
      console.log(game.currency);
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
// BALL !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function drawBall(ball) {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
  ctx.stroke();
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
  if (ball.x + ball.radius > canvas.width) {
    ball.x = canvas.width - ball.radius;
    if (ball.vx > 0) {
      ball.vx = -ball.vx;
    }
  }
  if (ball.y + ball.radius > canvas.height) {
    ball.y = canvas.height - ball.radius;
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

// PLAYER !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function drawPlayer(player) {
  // const isHit = checkPlayerBallCollision(player, ball);

  // if (isHit) {
  //   ctx.fillStyle = "red";
  // } else {
  //   ctx.fillStyle = "blue";
  // }

  ctx.fillRect(player.x, player.y, player.width, player.height);
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
  if (player.x + player.width >= canvas.width && player.vx > 0) {
    player.x = canvas.width - player.width;
    player.vx = -player.vx * player.restitution;
  }
  if (player.x <= 0 && player.vx < 0) {
    player.x = 0;
    player.vx = -player.vx * player.restitution;
  }

  // SpeedlimitCHECK
  // if (-player.maxSpeed > player.vx && player.vx < player.maxSpeed) {
  // }

  // if (player.vx < 0 && movingRight) {
  //   player.vx += player.acceleration * player.reversalMultiplier * dt;
  // } else if (movingRight) {
  //   player.vx += player.acceleration * dt;
  // }

  // if (movingLeft) {
  //   player.vx -= player.acceleration * dt;
  // }
  // if (player.vx > player.maxSpeed) {
  //   player.vx = player.maxSpeed;
  // }
  // if (player.vx < -player.maxSpeed) {
  //   player.vx = -player.maxSpeed;
  // }

  // player.x += player.vx * dt;

  // if (player.vx > 0 && movingLeft) {
  //   // Reversing from right to left
  // }
  // if (movingLeft === movingRight) {
  // if (player.vx > 0) {
  //   player.vx = Math.max(0, player.vx - player.deceleration * dt);
  // } else if (player.vx < 0) {
  //   player.vx = Math.min(0, player.vx + player.deceleration * dt);
  // } else {
  //   player.vx = 0;
  // }
  // }
  // console.log({
  //   x: player.x,
  //   vx: player.vx,
  //   restitution: player.restitution,
  // });
}
// PLAYER !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// HARPOON !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

function shootHarpoon(player) {
  let shootY = player.y;
  let shootX;
  let tip = shootY;
  let speed = 0;
  let acceleration = 1000;
  let duration = 2;
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
    timer,
  };
}
function checkHarpoonBallCollision(harpoon, ball) {
  const closestY = Math.min(Math.max(ball.y, harpoon.tip), canvas.height);
  const closestX = harpoon.shootX;
  return (
    Math.sqrt((closestX - ball.x) ** 2 + (closestY - ball.y) ** 2) <=
    ball.radius
  );
}
function drawHarpoon(harpoon) {
  ctx.beginPath();
  ctx.moveTo(harpoon.shootX, canvas.height);
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
    if (event.key === "ArrowRight") {
      movingRight = true;
      if (!event.repeat) {
        player.facing = "right";
      }
    }
    if (event.key === "ArrowLeft") {
      movingLeft = true;
      if (!event.repeat) {
        player.facing = "left";
      }
    }
    if (event.key === " ") {
      if (!event.repeat) {
        if (harpoons.length < player.maxHarpoons) {
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
  }
});
document.addEventListener("keyup", (event) => {
  event.preventDefault();
  if (event.key === "ArrowRight") {
    movingRight = false;
    if (movingLeft) {
      player.facing = "left";
    }
  }
  if (event.key === "ArrowLeft") {
    movingLeft = false;
    if (movingRight) {
      player.facing = "right";
    }
  }
});
// KEY HANDLING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

let highestPoint = canvas.height;
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
  if (ball.y + ball.radius >= canvas.height) {
    // console.log("Impact velocity before:", ball.vy);
    // console.log("Floor penetration:", ball.y + ball.radius - canvas.height);
    const D =
      vy0 ** 2 - 4 * (0.5 * gravity) * (y0 - canvas.height + ball.radius);
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
      const impactY = canvas.height - ball.radius;
      ball.y =
        impactY +
        reboundVelocity * remainingTime +
        0.5 * gravity * remainingTime ** 2;
      ball.vy = reboundVelocity + gravity * remainingTime;
      // console.log("HIT: Impact velocity:", impactVelocity);
      // console.log("HIT: Rebound velocity" + reboundVelocity);
      // console.log("HIT: Highest point during bounce: " + highestPoint);
      highestPoint = canvas.height;
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
const playerXInfo = document.getElementById("player-x");
const playerVxInfo = document.getElementById("player-vx");
const playerAcceleration = document.getElementById("player-acceleration");

function updatePlayerInfo(player) {
  playerXInfo.innerText = player.x.toFixed(2);
  playerVxInfo.innerText = player.vx.toFixed(2);
  playerAcceleration.innerText = player.acceleration;
}

const accelerationSlider = document.getElementById("acceleration-slider");
const accelerationDisplay = document.getElementById("acceleration-value");
const decelerationSlider = document.getElementById("deceleration-slider");
const decelerationDisplay = document.getElementById("deceleration-value");

accelerationSlider.addEventListener("change", () => {
  player.acceleration = accelerationSlider.value;
  accelerationDisplay.innerText = player.acceleration;
});

decelerationSlider.addEventListener("change", () => {
  player.deceleration = decelerationSlider.value;
  decelerationDisplay.innerText = player.deceleration;
});

// !!!!!!!!!! GRAPH !!!!!!!!!!!!!!!!!!!!!!!!!!

let sampleTimer = 0;
const sampleInterval = 0.0333;
const velocityHistory = [];
const historyDuration = 10;
const maxSamples = Math.round(historyDuration / sampleInterval);
function recordPlayerVelocity(player, dt) {
  sampleTimer += dt;

  if (sampleTimer >= sampleInterval) {
    velocityHistory.push(player.vx);
    sampleTimer -= sampleInterval;
    if (velocityHistory.length > maxSamples) {
      velocityHistory.shift();
    }
  }
}

const graphCanvas = document.getElementById("velocity-graph");
const graphCtx = graphCanvas.getContext("2d");
function drawVelocityGraph() {
  graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
  const graphingRatio = -(graphCanvas.height / (player.maxSpeed * 2));

  graphCtx.beginPath();
  graphCtx.moveTo(0, graphCanvas.height / 2);
  graphCtx.lineTo(graphCanvas.width, graphCanvas.height / 2);
  graphCtx.stroke();
  let graphX = graphCanvas.width;
  const graphGap = graphCanvas.width / maxSamples;
  graphCtx.beginPath();
  for (let index = velocityHistory.length - 1; index >= 0; index--) {
    const graphY =
      graphingRatio * velocityHistory[index] + graphCanvas.height / 2;
    if (index === velocityHistory.length - 1) {
      graphCtx.moveTo(graphX, graphY);
    } else {
      graphCtx.lineTo(graphX, graphY);
    }

    //DRAW
    graphX -= graphGap;
  }
  graphCtx.stroke();
}
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
initializeBalls();
requestAnimationFrame(gameLoop);

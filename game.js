const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const balls = [
  {
    x: 200,
    y: 100,
    radius: 40,
    vx: 200,
    vy: 0,
  },
];
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
let harpoon = null;
let harpoons = [];
let movingRight = false;
let movingLeft = false;

const gravity = 1000;
const bounceSpeed = 400;
let lastTime = 0;
let running = true;

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
  if (running) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    balls.forEach((ball) => {
      updateBall(ball, dt);
      checkPlayerBallCollision(player, ball);
    });
    checkAllBallCollisions(balls);
    balls.forEach((ball) => {
      drawBall(ball);
    });

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
          }
        } else {
          drawHarpoon(harpoons[i]);
        }
      }
    }

    updatePlayer(player, dt);
    drawPlayer(player);

    updatePlayerInfo(player);

    recordPlayerVelocity(player, dt);
    drawVelocityGraph();
    requestAnimationFrame(gameLoop);
  }
}

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

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
  if (relativeDot < 0) {
    //Collision
  }
  if (distance <= ballA.radius + ballB.radius) {
    return true;
  } else {
    return false;
  }
}
function checkAllBallCollisions(balls) {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      if (checkBallBallCollision(balls[i], balls[j])) {
        console.log("balls!");
      }
    }
  }
}
// BALL !!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// PLAYER COLLISION !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function checkPlayerBallCollision(player, ball) {
  // if (
  //   ball.x + ball.radius >= player.x &&
  //   ball.x - ball.radius <= player.x + player.width &&
  //   ball.y + ball.radius >= player.y &&
  //   ball.y - ball.radius <= player.y + player.height
  // ) {
  //   console.log("X HIT");
  // }

  const closestX = Math.min(
    Math.max(ball.x, player.x),
    player.x + player.width,
  );
  const closestY = Math.min(
    Math.max(ball.y, player.y),
    player.y + player.height,
  );

  return (
    Math.sqrt((closestX - ball.x) ** 2 + (closestY - ball.y) ** 2) <=
    ball.radius
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
requestAnimationFrame(gameLoop);

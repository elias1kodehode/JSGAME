const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const ball = {
  x: 200,
  y: 100,
  radius: 20,
  vx: 200,
  vy: 0,
};
const gravity = 1000;
const bounceSpeed = 400;
let lastTime = 0;
let running = true;

function gameLoop(timestamp) {
  if (!lastTime) {
    lastTime = timestamp;
  }
  const dt = (timestamp - lastTime) * 0.001;
  lastTime = timestamp;
  console.log(timestamp);
  if (running) {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateBall(ball, dt);
    drawBall(ball);
    requestAnimationFrame(gameLoop);
    // if (ball.y > canvas.height || ball.x > canvas.width) {
    //   running = false;
    // }
  }
}

function drawBall(ball) {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
  ctx.stroke();
}

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
    console.log("Impact velocity before:", ball.vy);
    console.log("Floor penetration:", ball.y + ball.radius - canvas.height);
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
      console.log("HIT: Impact velocity:", impactVelocity);
      console.log("HIT: Rebound velocity" + reboundVelocity);
      console.log("HIT: Highest point during bounce: " + highestPoint);
      highestPoint = canvas.height;
      const t = -reboundVelocity / gravity;
      const highestPointTheoretical =
        impactY + reboundVelocity * t + 0.5 * (gravity * t ** 2);
      console.log("HIT: Theoretical height: " + highestPointTheoretical);
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

requestAnimationFrame(gameLoop);

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const ball = {
  x: 100,
  y: 100,
  radius: 20,
  vx: 200,
  vy: 0,
};
const gravity = 600;
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
  ball.vy += gravity * dt;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.y < highestPoint) {
    highestPoint = ball.y;
  }
  if (ball.y + ball.radius >= canvas.height) {
    console.log("Impact velocity before:", ball.vy);
    console.log("Floor penetration:", ball.y + ball.radius - canvas.height);

    const timeSinceCollision = (ball.y + ball.radius - canvas.height) / ball.vy;
    ball.y = canvas.height - ball.radius;
    ball.vy = -ball.vy;
    ball.y += ball.vy * timeSinceCollision;
    console.log("Impact velocity after:", ball.vy);
    console.log("Highest point during bounce: " + highestPoint);
    highestPoint = canvas.height;
  }
  if (ball.x + ball.radius >= canvas.width) {
    ball.x = canvas.width - ball.radius;
    ball.vx = -ball.vx;
  }
  if (ball.x - ball.radius <= 0) {
    ball.x = 0 + ball.radius;
    ball.vx = -ball.vx;
  }
  if (ball.y - ball.radius <= 0) {
    ball.y = 0 + ball.radius;
    ball.vy = -ball.vy;
  }
}

requestAnimationFrame(gameLoop);

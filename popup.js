const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const box = 40;
let direction = "RIGHT";
let nextDirection = "RIGHT";
let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;
document.getElementById("high-score").innerText = "High score: " + highScore;

let moveDelay = 50; // ms
let snake = [
  { x: 6 * box, y: 6 * box },
  { x: 5 * box, y: 6 * box },
  { x: 4 * box, y: 6 * box },
  { x: 3 * box, y: 6 * box }
];
let prevSnake = JSON.parse(JSON.stringify(snake));
let food = spawnFood();
let lastMoveTime = performance.now();

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && direction !== "DOWN") nextDirection = "UP";
  else if (e.key === "ArrowDown" && direction !== "UP") nextDirection = "DOWN";
  else if (e.key === "ArrowLeft" && direction !== "RIGHT") nextDirection = "LEFT";
  else if (e.key === "ArrowRight" && direction !== "LEFT") nextDirection = "RIGHT";
});

function spawnFood() {
  let foodPosition;
  let maxX = Math.floor(canvas.width / box);
  let maxY = Math.floor(canvas.height / box);
  do {
    foodPosition = {
      x: Math.floor(Math.random() * maxX) * box,
      y: Math.floor(Math.random() * maxY) * box
    };
    // Ensure food does not spawn on the snake
  } while (snake.some(seg => seg.x === foodPosition.x && seg.y === foodPosition.y));
  return foodPosition;
}

function moveSnake() {
  prevSnake = JSON.parse(JSON.stringify(snake));
  direction = nextDirection;

  let head = { x: snake[0].x, y: snake[0].y };
  if (direction === "UP") head.y -= box;
  if (direction === "DOWN") head.y += box;
  if (direction === "LEFT") head.x -= box;
  if (direction === "RIGHT") head.x += box;

  // Collision
  if (
    head.x < 0 || head.x >= canvas.width ||
    head.y < 0 || head.y >= canvas.height ||
    snake.slice(1).some(seg => seg.x === head.x && seg.y === head.y)
  ) {
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("snakeHighScore", highScore);
    }
    score = 0;
    snake = [
      { x: 6 * box, y: 6 * box },
      { x: 5 * box, y: 6 * box },
      { x: 4 * box, y: 6 * box },
      { x: 3 * box, y: 6 * box }
    ];
    prevSnake = JSON.parse(JSON.stringify(snake));
    direction = "RIGHT";
    nextDirection = "RIGHT";
    food = spawnFood();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    food = spawnFood();
  } else {
    snake.pop();
  }

  document.getElementById("score").innerText = score;
  document.getElementById("high-score").innerText = "High score: " + highScore;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function drawSnake(interp) {
  for (let i = 0; i < snake.length; i++) {
    let sx = lerp(prevSnake[i]?.x ?? snake[i].x, snake[i].x, interp);
    let sy = lerp(prevSnake[i]?.y ?? snake[i].y, snake[i].y, interp);

    ctx.fillStyle = "blue";
    if (i === 0) ctx.fillStyle = "blue"; // Head of the snake
    else if (i === snake.length - 1) ctx.fillStyle = "lightblue"; // Tail of the snake
    ctx.fillRect(sx, sy, box, box);

    if (i === 0) {
      ctx.fillStyle = "white";
      ctx.fillRect(sx + 4, sy + 4, 4, 4);
      ctx.fillRect(sx + 12, sy + 4, 4, 4);
    }
  }
}

function drawFood() {
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);
}

function gameLoop(now) {
  let delta = now - lastMoveTime;

  if (delta >= moveDelay) {
    moveSnake();
    lastMoveTime = now;
    delta = 0;
  }

  const interp = delta / moveDelay;

  // Clear canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawSnake(interp);
  drawFood();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

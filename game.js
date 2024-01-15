
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 200;

class Dino {
    constructor() {
        this.width = 50; // Set the width of the dino
        this.originalHeight = 50; // Set the original height
        this.crouchHeight = 30; // Set the crouch height
        this.height = this.originalHeight; // Current height, can change if crouching
        this.x = 10; // Dino's horizontal position
        this.y = canvas.height - this.height; // Dino's vertical position
        this.vy = 0; // Vertical velocity for jumping
        this.gravity = 0.5; // Gravity effect
        this.jumpStrength = -11; // Strength of the jump
        this.isOnGround = true; // Is the dino on the ground
        this.isCrouching = false; // Is the dino crouching

        // Animation properties
        this.frames = [new Image(), new Image()];
        this.frames[0].src = 'dino1.png';
        this.frames[1].src = 'dino2.png';
        this.currentFrameIndex = 0;
        this.frameChangeInterval = 10;
        this.frameChangeCounter = 0;
    }

    jump() {
        if (this.isOnGround && !this.isCrouching) {
            this.vy = this.jumpStrength;
            this.isOnGround = false;
        }
    }

    crouch() {
        if (this.isOnGround) {
            this.isCrouching = true;
            this.height = this.crouchHeight;
            this.y = canvas.height - this.height;
        }
    }

    standUp() {
        this.isCrouching = false;
        this.height = this.originalHeight;
        this.y = canvas.height - this.height;
    }

    update() {
        // Jumping logic
        if (!this.isOnGround) {
            this.vy += this.gravity;
            this.y += this.vy;
            if (this.y > canvas.height - this.height) {
                this.y = canvas.height - this.height;
                this.isOnGround = true;
            }
        }

        // Animation logic
        this.frameChangeCounter++;
        if (this.frameChangeCounter >= this.frameChangeInterval) {
            this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
            this.frameChangeCounter = 0;
        }
    }

    draw() {
        const currentFrame = this.frames[this.currentFrameIndex];
        ctx.drawImage(currentFrame, this.x, this.y, this.width, this.height);
    }
}


class Obstacle {
    constructor() {
        this.width = 20;
        this.height = 40;
        this.x = canvas.width;
        this.y = canvas.height - this.height;
        this.speed = 3;
        this.texture = new Image();
        this.texture.src = 'log.png';
    }

    update() {
        this.x -= this.speed;
    }

    draw() {
        ctx.drawImage(this.texture, this.x, this.y, this.width, this.height);
    }
}

class FlyingObstacle {
    constructor() {
        this.width = 60;
        this.height = 25;
        this.y = canvas.height - dino.crouchHeight - 25;
        this.x = canvas.width;
        this.speed = 3;
        this.texture = new Image();
        this.texture.src = 'cloud.png';
    }

    update() {
        this.x -= this.speed;
    }

    draw() {
        ctx.drawImage(this.texture, this.x, this.y, this.width, this.height);
    }
}

function handleObstacles() {
    if (frame % 120 === 0) {
        obstacles.push(new Obstacle());

        const flyingObstacle = new FlyingObstacle();
        obstacles.push(flyingObstacle);
    }
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].update();
        obstacles[i].draw();

        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            i--;
        } else if (!dino.isCrouching &&
            dino.x < obstacles[i].x + obstacles[i].width &&
            dino.x + dino.width > obstacles[i].x &&
            dino.y < obstacles[i].y + obstacles[i].height &&
            dino.y + dino.height > obstacles[i].y
        ) {
            gameOver = true;
        }
    }
}

const dino = new Dino();
const obstacles = [];
let gameSpeed = 1;
let frame = 0;
let gameOver = false;

let lastObstacleX = canvas.width;

function handleObstacles() {
    if (frame % 90 === 0) {
        // Calculate a random gap size
        const minGapSize = 3 * dino.width;
        const maxGapSize = 5 * dino.width;
        const gapSize = Math.floor(Math.random() * (maxGapSize - minGapSize + 1)) + minGapSize;

        // Create a regular obstacle with the calculated gap
        const obstacle = new Obstacle();
        obstacle.x = lastObstacleX + gapSize;
        lastObstacleX = obstacle.x;
        obstacles.push(obstacle);

        // Randomly choose whether to create a flying obstacle
        if (Math.random() > 0.5) {
            const flyingObstacle = new FlyingObstacle();
            flyingObstacle.x = lastObstacleX + gapSize;
            obstacles.push(flyingObstacle);
        }
    }
    
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].update();
        obstacles[i].draw();

        // Calculate hitbox dimensions for the crouching dino
        const dinoHitboxWidth = dino.width * 0.85;
        const dinoHitboxHeight = dino.height * 0.5;

        // Check for collision with both standing and crouching dino
        if ((!dino.isCrouching &&
            dino.x < obstacles[i].x + obstacles[i].width &&
            dino.x + dinoHitboxWidth > obstacles[i].x &&
            dino.y < obstacles[i].y + obstacles[i].height &&
            dino.y + dino.height > obstacles[i].y)
            ||
            (dino.isCrouching &&
            dino.x < obstacles[i].x + obstacles[i].width &&
            dino.x + dinoHitboxWidth > obstacles[i].x &&
            dino.y < obstacles[i].y + obstacles[i].height &&
            dino.y + dinoHitboxHeight > obstacles[i].y)
        ) {
            gameOver = true;
        }
    }
}

let score = 0;
let startTime = Date.now();

function updateScore() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    score = Math.floor(elapsedTime / 100); // Score increases by 1 every 100 milliseconds
}

let lastSpeedIncreaseTime = Date.now();

function increaseSpeed() {
    const currentTime = Date.now();
    if (currentTime - lastSpeedIncreaseTime >= 1000) { // Check if 1000 ms (1 second) has passed
        gameSpeed += 0.5 * gameSpeed; // Increase the game speed by 5%
        lastSpeedIncreaseTime = currentTime;
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dino.update();
    dino.draw();

    handleObstacles();

    updateScore(); // Update the score

    increaseSpeed(); // Check and increase game speed

    // Display the score on the canvas
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 20);

    if (!gameOver) {
        requestAnimationFrame(animate);
    } else {
        ctx.fillStyle = 'red';
        ctx.font = '30px Arial';
        ctx.fillText('F5 to restart', canvas.width / 2 - 80, canvas.height / 2);
    }

    frame++;
}

animate();

window.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowUp' && !gameOver) {
        dino.jump();
    }
    if (e.key === 'ArrowDown' && !gameOver) {
        dino.crouch();
    }
});

window.addEventListener('keyup', function(e) {
    if (e.key === 'ArrowDown' && !gameOver) {
        dino.standUp();
    }
});

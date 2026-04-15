const board = document.querySelector('.board');
const startButton = document.querySelector('.btn-start');
const modal = document.querySelector('.modal');
const startGameModal = document.querySelector('.start-game');
const gameOverModal = document.querySelector('.game-over');
const restartButton = document.querySelector('.btn-restart');
const highScoreElement = document.querySelector('.high-score');
const scoreElement = document.querySelector('.score');
const timeElement = document.querySelector('.time');

const blockWidth = 30;
const blockHeight = 30;

let isPaused = false;

let highScore = localStorage.getItem("highScore") || 0;
let score = 0;
let time = `00-00`;

highScoreElement.innerText = highScore;

const blocks = [];
let snake = [{ x: 1, y: 3 }, { x: 1, y: 4 }];

const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);

let intervalId = null;
let timerIntervalId = null;

let food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) };

let direction = 'right';

for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const block = document.createElement('div');
        block.classList.add('block');
        board.appendChild(block);
        blocks[`${row}-${col}`] = block;
    }
}

function render() {
    if(isPaused) return;
    
    let head = null;
    blocks[`${food.x}-${food.y}`].classList.add('food');

    //for moving the snake left,right,up,down
    if (direction === 'left') {
        head = { x: snake[0].x, y: snake[0].y - 1 };
    } else if (direction === 'right') {
        head = { x: snake[0].x, y: snake[0].y + 1 };
    } else if (direction === 'up') {
        head = { x: snake[0].x - 1, y: snake[0].y };
    } else if (direction === 'down') {
        head = { x: snake[0].x + 1, y: snake[0].y };
    }

    //when snake hits the wall 
    if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
        clearInterval(intervalId);
        clearInterval(timerIntervalId);
        modal.style.display = 'flex';
        startGameModal.style.display = 'none';
        gameOverModal.style.display = 'flex';
        return;
    }

    //food consume and increase length 
    if (head.x == food.x && head.y == food.y) {
        blocks[`${food.x}-${food.y}`].classList.remove('food');
        food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) };
        blocks[`${food.x}-${food.y}`].classList.add('food');
        snake.unshift(head);  //this is increase the length of snake

        //score update
        score += 10;
        scoreElement.innerText = score;

        //highscore update
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore.toString());
        }
        return;  //gpt help
    }

    //snake self-collision detection
    // if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    //     clearInterval(intervalId);
    //     modal.style.display = 'flex';
    //     startGameModal.style.display = 'none';
    //     gameOverModal.style.display = 'flex';
    //     return;
    // }

    //when snake move forword the remanining space will free 
    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.remove('fill');
    })

    snake.unshift(head);
    snake.pop();

    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.add('fill');
    })
}

startButton.addEventListener('click', startGame);

function startGame() {
    modal.style.display = 'none';
    intervalId = setInterval(() => { render(); }, 200);

    timerIntervalId = setInterval(() => {
        let [min, sec] = time.split("-").map(Number);

        if (sec == 59) {
            min += 1;
            sec = 0;
        } else {
            sec += 1;
        }

        time = `${String(min).padStart(2, '0')}-${String(sec).padStart(2, '0')}`;
        timeElement.innerText = time;

    }, 1000);
}

//for pause the game while playing
function togglePause() {
    if (!intervalId) return;  //game not started

    if (isPaused) {
        //resume
        intervalId = setInterval(() => { render(); }, 200);

        timerIntervalId = setInterval(() => {
            let [min, sec] = time.split("-").map(Number);

            if (sec == 59) {
                min += 1;
                sec = 0;
            } else {
                sec += 1;
            }

            time = `${String(min).padStart(2, '0')}-${String(sec).padStart(2, '0')}`;
            timeElement.innerText = time;

        }, 1000);

        isPaused = false;

    }else{
        //pause
        clearInterval(intervalId);
        clearInterval(timerIntervalId);
        isPaused=true;
    }
}

restartButton.addEventListener('click', restartGame);

function restartGame() {
    clearInterval(intervalId);
    clearInterval(timerIntervalId);

    blocks[`${food.x}-${food.y}`].classList.remove('food');

    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.remove('fill');
    })

    score = 0;
    time = `00-00`;

    scoreElement.innerText = score;
    timeElement.innerText = time;
    highScoreElement.innerText = highScore;

    modal.style.display = 'none';
    direction = 'right';
    snake = [{ x: 1, y: 3 }, { x: 1, y: 4 }];
    food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) };
    intervalId = setInterval(() => {
        render();
    }, 200);
}

addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        if(!intervalId){
            startGame();  //game not started  
        }else{
            restartGame();  //restart game 
        }
    }

    if (e.key == " ") {
        e.preventDefault();   //stop page scroll
        togglePause();
    }

    if (e.key === "ArrowUp") direction = 'up';
    else if (e.key === "ArrowDown") direction = 'down';
    else if (e.key === "ArrowLeft") direction = 'left';
    else if (e.key === "ArrowRight") direction = 'right';
});
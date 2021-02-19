// HTML DOM elements
const startBtn = document.querySelector('#start');
const scoreEl = document.querySelector('#score');
const highScoreEl = document.querySelector('#high-score');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// responsive canvas
const canvasResize = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}
canvasResize();
window.addEventListener('resize', () => {
    canvasResize();
    location.reload();
});

// mouse object to hold mouse position
const mouse = {
    x: undefined,
    y: undefined,
}

// global variables
let animationId;
let score = 0;
let highScore = 0;

// load audio
const shoot = new Audio();
const pop = new Audio();
const end = new Audio();

shoot.src = './sounds/shoot.wav';
pop.src = './sounds/pop.wav';
end.src = './sounds/end.wav';

// arrays to store enemies projectiles and particles
const enemies = [];
const projectiles = [];
const particles = [];

// player class
class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color; 
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
}

// projectile class
class Projectile {

    // projectile constructor
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.speed = 2;
    }

    // draw projectile
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    // update projectile
    update() {
        this.draw();
        this.x += this.velocity.x * this.speed;
        this.y += this.velocity.y * this.speed;
    }
}

// enemy class
class Enemy {

    // enemy constructor
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    // draw enemy
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    // update enemy
    update() {
        this.draw();

        // if radius is between 20 and 30 low speed
        if (this.radius < 30 && this.radius > 20) {
            this.x += this.velocity.x * 0.1;
            this.y += this.velocity.y * 0.1;
        
        // if radius is between 10 and 20 medium speed
        } else if (this.radius < 20 && this.radius > 10) {
            this.x += this.velocity.x * 0.5;
            this.y += this.velocity.y * 0.5;

        // if radius is between 0 and 10 high speed
        } else if (this.radius < 10 && this.radius > 0) {
            this.x += this.velocity.x;
            this.y += this.velocity.y;
        }
    }
}

// particle class
class Particle {

    // particle constructor
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.duration = 10;
    }

    // draw particle
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    // update particle
    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.duration -= 0.1;
    }
}

// initialize gameLoop enemy control and get high score
const init = () => {
    highScoreEl.textContent = localStorage.getItem('HighScore');
    gameLoop();
    enemyControl();
};

// clear canvas function
const clear = () => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// enemy control
const enemyControl = () => {

    // set interval every 1 second
    setInterval( () => {

        // radius of enemy between 5 and 30
        const radius = Math.random() * (30 - 5) + 5;

        let x;
        let y;

        // randomize enemy spawn position
        if(Math.random() > 0.5) {
            x = Math.random() > 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() > 0.5 ? 0 - radius : canvas.height + radius;
        }
        
        // randomize enemy color
        const randomValue = Math.floor(Math.random() * 360);
        const color = `hsl(${randomValue}, 50%, 50%)`;

        // angle from the center of canvas
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
        
        // calculate velocity for each enemy
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle),
        }

        // push new enemy into array
        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000)
};

// game loop 
const gameLoop = () => {

    // assign animation frame to an animation id
    animationId = requestAnimationFrame(gameLoop);

    // clear canvas every frame
    clear();

    // draw player every frame
    player.draw();

    // for each particle
    particles.forEach( (particle, index) => {

        // check if duration is less than zero
        if (particle.duration <= 0) {

            // remove particle
            particles.splice(index, 1)
        } else {

            // update particle
            particle.update();
        }
    });

    // for each projectile
    projectiles.forEach( (projectile, pIndex) => {

        // update projectile
        projectile.update();

        // check if projectile is out of canvas
        if (projectile.x - projectile.radius < 0 || 
            projectile.x + projectile.radius > canvas.width || 
            projectile.y - projectile.radius < 0 || 
            projectile.y + projectile.radius > canvas.height) {
            setTimeout( () => {
                
                // remove projectile
                projectiles.splice(pIndex, 1);
            }, 0)
        }
    });

    // for each enemy
    enemies.forEach( (enemy, eIndex) => {

        // update enemy
        enemy.update();

        // calculate distance of enemy and player
        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);

        // check collision
        if (distance - (player.radius + enemy.radius) < 1) {

            // play end
            end.play();

            // play bg music when end audio is done
            end.addEventListener('ended', () => {
                document.querySelector('audio').play();
            });

            // stop game loop
            cancelAnimationFrame(animationId);

            // store high score into high score
            highScore = score;

            // check local storage if score is greater than previous high score
            if(localStorage.getItem('HighScore') < score) {
                localStorage.removeItem('HighScore');
                localStorage.setItem('HighScore', highScore);
            }

            // toggle end game screen
            document.querySelector('.end').classList.toggle('endGame');

            // show score
            const endScore = document.querySelector('#end-score');
            endScore.textContent = score;
        }

        // for each projectile
        projectiles.forEach( (projectile, pIndex) => {

            // calculate distance of projectile and enemy
            const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            
            // check collision
            if (distance - (projectile.radius + enemy.radius) < 1) {

                // play pop
                pop.currentTime = 0;
                pop.play();
                
                // create particle explosion based on enemy radius
                for (let i = 0; i < enemy.radius; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 2),
                        y: (Math.random() - 0.5) * (Math.random() * 2)
                    }))
                }
                
                // if enemy radius is greater than 5
                if (enemy.radius > 5) {

                    // reduce enemy radius
                    enemy.radius -= 5;

                    // remove projectile
                    projectiles.splice(pIndex, 1);
                }
                
                // if enemy radius is less than 5
                if (enemy.radius <= 5) {
                    setTimeout( () => {

                        // remove enemy
                        enemies.splice(eIndex, 1);

                        // remove projectiles
                        projectiles.splice(pIndex, 1);
                    }, 0)
                }

                // increase score
                score++

                // display score
                scoreEl.textContent = score;
            }
        })
    });
};

// create new player
const player = new Player(canvas.width / 2, canvas.height / 2, 10, 'white');

// click event listener for menus
window.addEventListener('click', (e) => {

    // event listener for start button
    if(e.target.id === 'start') {
        const music = document.querySelector('audio');
        music.pause();
        music.currentTime = 0;
        document.querySelector('.menu').classList.toggle('start');
        init();
    }

    // event listener for retry button
    if(e.target.id === 'retry') {
        document.querySelector('.end').classList.toggle('endgame');
        location.reload();
    }
});

// click event listerner for canvas
canvas.addEventListener('click', (e) => {
    
    // assign mouse x and y position
    mouse.x = e.pageX - canvas.offsetLeft;
    mouse.y = e.pageY - canvas.offsetTop;

    // calculate angle of x and y of mouse and player
    const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    
    // calculate velocity
    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle),
    }

    // play shoot
    shoot.play();

    // create new projectile
    projectiles.push(new Projectile(player.x, player.y, 5, 'white',{ x: velocity.x, y: velocity.y }));
})
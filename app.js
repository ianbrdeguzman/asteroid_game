// HTML DOM elements
const startBtn = document.querySelector('#start');
const scoreEl = document.querySelector('#score');
const highScoreEl = document.querySelector('#high-score');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const canvasResize = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}
canvasResize();
window.addEventListener('resize', () => {
    canvasResize();
    location.reload();
});

const mouse = {
    x: undefined,
    y: undefined,
}

let animationId;
let score = 0;
let highScore = 0;

const enemies = [];
const projectiles = [];
const particles = [];

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color; 
        // this.direction = {
        //     top: undefined,
        //     down: undefined,
        //     left: undefined,
        //     right: undefined,
        // }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        this.draw();

        // if (this.direction.top) { this.y -= 1 }
        // if (this.direction.down) { this.y += 1 }
        // if (this.direction.left) { this.x -= 1 }
        // if (this.direction.right) { this.x += 1 }
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        this.draw();
        this.x += this.velocity.x * 2;
        this.y += this.velocity.y * 2;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        this.draw();
        if (this.radius < 30 && this.radius > 20) {
            this.x += this.velocity.x * 0.1;
            this.y += this.velocity.y * 0.1;
        } else if (this.radius < 20 && this.radius > 10) {
            this.x += this.velocity.x * 0.5;
            this.y += this.velocity.y * 0.5;
        } else if (this.radius < 10 && this.radius > 0) {
            this.x += this.velocity.x;
            this.y += this.velocity.y;
        }
    }
}

class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.duration = 10;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.duration -= 0.1;
    }
}

const init = () => {
    highScoreEl.textContent = localStorage.getItem('HighScore');
    gameLoop();
    enemyControl();
};


const clear = () => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const enemyControl = () => { // put inside init
    setInterval( () => {
        const radius = Math.random() * (30 - 5) + 5;

        let x;
        let y;

        if(Math.random() > 0.5) {
            x = Math.random() > 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() > 0.5 ? 0 - radius : canvas.height + radius;
        }
        
        const randomValue = Math.floor(Math.random() * 360);
        const color = `hsl(${randomValue}, 50%, 50%)`;

        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle),
        }

        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000)
};

const gameLoop = () => {
    animationId = requestAnimationFrame(gameLoop);
    
    for (key in localStorage) {
    }

    clear();
    player.update();

    particles.forEach( (particle, index) => {
        if (particle.duration <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update();
        }
    });

    projectiles.forEach( (projectile, pIndex) => {
        projectile.update();

        if (projectile.x - projectile.radius < 0 || 
            projectile.x + projectile.radius > canvas.width || 
            projectile.y - projectile.radius < 0 || 
            projectile.y + projectile.radius > canvas.height) {
            setTimeout( () => {
                projectiles.splice(pIndex, 1);
            }, 0)
        }
    });

    enemies.forEach( (enemy, eIndex) => {
        enemy.update();

        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);

        if (distance - (player.radius + enemy.radius) < 1) {
            cancelAnimationFrame(animationId);
            highScore = score;
            if(localStorage.getItem('HighScore') < score) {
                localStorage.removeItem('HighScore');
                localStorage.setItem('HighScore', highScore);
            }
            document.querySelector('.end').classList.toggle('endGame');
            const endScore = document.querySelector('#end-score');
            endScore.textContent = score;
        }

        projectiles.forEach( (projectile, pIndex) => {
            const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            
            if (distance - (projectile.radius + enemy.radius) < 1) {
                for (let i = 0; i < enemy.radius; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 2),
                        y: (Math.random() - 0.5) * (Math.random() * 2)
                    }))
                }
                
                if (enemy.radius > 5) {
                    enemy.radius -= 5;
                    projectiles.splice(pIndex, 1);
                }
                
                if (enemy.radius <= 5) {
                    setTimeout( () => {
                        enemies.splice(eIndex, 1);
                        projectiles.splice(pIndex, 1);
                    }, 0)
                }

                score++
                scoreEl.textContent = score;
            }
        })
    });
};

const player = new Player(canvas.width / 2, canvas.height / 2, 10, 'white');

// window.addEventListener('keyup', (e) => {
//     switch (e.code) {
//         case 'KeyW':
//             player.direction.top = true;
//             player.direction.down = false;
//             player.direction.left = false;
//             player.direction.right = false;
//             break;
//         case 'KeyS':
//             player.direction.top = false;
//             player.direction.down = true;
//             player.direction.left = false;
//             player.direction.right = false;
//             break;
//         case 'KeyA':
//             player.direction.top = false;
//             player.direction.down = false;
//             player.direction.left = true;
//             player.direction.right = false;
//             break;
//         case 'KeyD':
//             player.direction.top = false;
//             player.direction.down = false;
//             player.direction.left = false;
//             player.direction.right = true;
//             break;
//     }
// })

window.addEventListener('click', (e) => {
    if(e.target.id === 'start') {
        document.querySelector('.menu').classList.toggle('start');
        init();
    }

    if(e.target.id === 'retry') {
        document.querySelector('.end').classList.toggle('endgame');
        location.reload();
    }
});

canvas.addEventListener('click', (e) => {
    
    mouse.x = e.pageX - canvas.offsetLeft;
    mouse.y = e.pageY - canvas.offsetTop;

    const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    
    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle),
    }

    projectiles.push(new Projectile(player.x, player.y, 5, 'white',{ x: velocity.x, y: velocity.y }));
})
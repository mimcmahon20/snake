import { dijkstra } from "./dj.js";

let game = document.getElementsByClassName("game")[0];
let gameOver = document.getElementsByClassName("gameover")[0];
let restart = document.getElementsByClassName("restart")[0];

//setting up the grid
class box {
    constructor() {
        this.box = document.createElement("div");
        this.box.classList.add("box");
    }
}

class row {
    constructor() {
        this.row = document.createElement("div");
        this.row.classList.add("row");
        game.appendChild(this.row); 
        this.boxes = new Array();
    }

    addBox() {
        let boxy = new box();
        this.boxes.push(boxy);
        this.row.appendChild(boxy.box);
    }
}

let totalRows = 20;
export let rows = new Array();
for(let i = 0; i < totalRows; i++) {
    rows[i] = new row();
    for(let j = 0; j < totalRows; j++) {
        rows[i].addBox();
        if(i == 0|| j == 0 || i == totalRows-1 || j == totalRows-1) {
            rows[i].boxes[j].box.classList.add("wall");
        }
    }
}

class food {
    constructor() {
        this.x = Math.floor(Math.random() * (totalRows-1)+1);
        this.y = Math.floor(Math.random() * (totalRows-1)+1);
        while(this.x == 0 || this.y == 0 || this.x == totalRows-1 || this.y == totalRows-1
            && !rows[this.y].boxes[this.x].box.classList.contains("snake")) { 
            this.x = Math.floor(Math.random() * (totalRows-1)+1);
            this.y = Math.floor(Math.random() * (totalRows-1)+1);
        }
        this.box = rows[this.y].boxes[this.x];
        this.box.box.classList.add("food");
    }
}

//the main snake class
class snake {
    constructor() {
        this.alive = true;

        //body
        this.body = new Array();
        //tail
        this.tail = rows[1].boxes[1];
        this.tail.box.classList.add("snake");
        this.body.push(this.tail);
        //head
        this.head = rows[1].boxes[2];
        this.head.box.classList.add("snake");
        this.head.box.classList.add("snake-head");
        this.body.push(this.head);
        this.x = 2;
        this.y = 1;
        //direction
        this.direction = "right";

        //direction queue
        this.queue = new Array();
    }

    next() {
        if(this.direction == "right") {
            return rows[this.y].boxes[this.x+1];
        }
        if(this.direction == "left") {
            return rows[this.y].boxes[this.x-1];
        }
        if(this.direction == "up") {
            return rows[this.y-1].boxes[this.x];
        }
        if(this.direction == "down") {
            return rows[this.y+1].boxes[this.x];
        }
    }

    move() {
        this.head.box.classList.remove("snake-head");
        checkCollision(this.head, this.next());
        this.head = this.next();
        if(this.direction == "right") {
            this.x++;
        }
        if(this.direction == "left") {
            this.x--;
        }
        if(this.direction == "up") {
            this.y--;
        }
        if(this.direction == "down") {
            this.y++;
        }
        this.head.box.classList.add("snake-head");
        this.head.box.classList.add("snake");
        this.body[0].box.classList.remove("snake");
        this.body.shift();
        this.body.push(this.head);
    }

    eat() {
        this.head.box.classList.remove("snake-head");
        if(this.direction == "right") {
            this.head = rows[this.y].boxes[this.x+1];
            this.x++;
        }
        if(this.direction == "left") {
            this.head = rows[this.y].boxes[this.x-1];
            this.x--;
        }
        if(this.direction == "up") {
            this.head = rows[this.y-1].boxes[this.x];
            this.y--;
        }
        if(this.direction == "down") {
            this.head = rows[this.y+1].boxes[this.x];
            this.y++;
        }
        this.head.box.classList.add("snake-head");
        this.head.box.classList.add("snake");
        this.body.push(this.head);
        this.tail = this.body[0];
    }
}

function checkCollision(snake, box) {
    if(box.box.classList.contains("wall") || box.box.classList.contains("snake")) {
        snake.alive = false;
        console.log("game over");
    }
}

document.addEventListener("keydown", function(event) { 
    if(event.key == "ArrowRight") {
        snakey.direction = "right";
    }
    if(event.key == "ArrowLeft") {
        snakey.direction = "left";
    }
    if(event.key == "ArrowUp") {
        snakey.direction = "up";
    }
    if(event.key == "ArrowDown") {
        snakey.direction = "down";
    }
});

let snakey = new snake();
let foody = new food();


let interval = setInterval(runner, 100, snakey);

let intervalClearer = setInterval(function() {
    if(!snakey.alive) {
        clearInterval(interval);
        gameOver.style.opacity = "1";
    }}
,100);

function runner(snakey) {
    if(snakey.next() == foody.box) {
        snakey.queue = new Array();
        console.log("food eaten");
        foody.box.box.classList.remove("food");
        foody = new food();
        snakey.eat();
    }  else if(snakey.queue[0] === undefined) {
        snakey.queue = queueDJ(snakey);
        snakey.queue.shift();
    } else {
        let direct = snakey.queue[0];
        snakey.direction = direct;
        let failSafe = 0;
        if(snakey.next().box.classList.contains("snake")) {
            console.log(snakey.next());
            snakey.queue.reverse();
            failSafe++;
            if(failSafe > 2 && (snakey.queue[0] == "right" || snakey.queue[0] == "left")) {
                snakey.push("right");
            }
        }
        snakey.direction = snakey.queue.shift();
        snakey.move();
    }
    console.log(snakey.queue);  
}

function queueDJ(snakey) {
    let dj = dijkstra(snakey.x, snakey.y, foody.x, foody.y, snakey);
    let currentX = snakey.x;
    let currentY = snakey.y;
    for(let i = 0; i < dj.length; i++) {
        if(dj[i][0] == currentX-1){
            snakey.queue[i] = "left";
            currentX--;
        }
        if(dj[i][0] == currentX+1){
            snakey.queue[i] = "right";
            currentX++;
        }
        if(dj[i][1] == currentY-1){
            snakey.queue[i] = "up";
            currentY--;
        }
        if(dj[i][1] == currentY+1){
            snakey.queue[i] = "down";
            currentY++;
        }
    }
    console.log(snakey.queue);
    return snakey.queue;
}

//restart button
restart.addEventListener("click", function() {
    location.reload();
});

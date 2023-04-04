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

// This class creates a row of boxes, and defines a function that adds a box to the row.


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
// create an array to store all the rows of boxes
export let totalRows = 30;
export let totalCols = 30;
export let rows = new Array();
// loop through the total number of rows
for(let i = 0; i < totalRows; i++) { //i is row number or y
    // create a new row object and store it in the rows array
    rows[i] = new row();
    // loop through the total number of boxes in each row
    for(let j = 0; j < totalCols; j++) { //j is column number or x
        // add a box to the row
        rows[i].addBox();
        // if the box is on the edge of the grid, add the wall class
        if(i == 0|| j == 0 || i == totalRows-1 || j == totalCols-1) {
            rows[i].boxes[j].box.classList.add("wall");
        }
    }
}

class food {
    constructor() {
        // The food will be placed anywhere in the grid but not on the borders
        this.x = Math.floor(Math.random() * (totalCols-1)+1);
        this.y = Math.floor(Math.random() * (totalRows-1)+1);
        // If the food is placed on the border or on the snake, it will be placed again
        while(this.x == 0 || this.y == 0 || this.x == totalCols-1 || this.y == totalRows-1
            || rows[this.y].boxes[this.x].box.classList.contains("snake")) { 
            this.x = Math.floor(Math.random() * (totalCols-1)+1);
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
        checkCollision(this, this.next());
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
        checkCollision(this, this.next());
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
        this.head.box.classList.remove("food");
        this.body.push(this.head);
        this.tail = this.body[0];
    }
}

function checkCollision(snakey, box) {
    if(box == null){
        snakey.alive = false;
        console.log("game over null");
    }
    if(box.box.classList.contains("wall") || box.box.classList.contains("snake")) {
        snakey.alive = false;
        console.log("game over");
    }
}

// document.addEventListener("keydown", function(event) { 
//     if(event.key == "ArrowRight") {
//         snakey.direction = "right";
//     }
//     if(event.key == "ArrowLeft") {
//         snakey.direction = "left";
//     }
//     if(event.key == "ArrowUp") {
//         snakey.direction = "up";
//     }
//     if(event.key == "ArrowDown") {
//         snakey.direction = "down";
//     }
// });

let snakey = new snake();
let foody = new food();


let interval = setInterval(runner, 25, snakey);

let intervalClearer = setInterval(function() {
    if(!snakey.alive) {
        clearInterval(interval);
        gameOver.style.opacity = "1";
    }}
,25);

intervalClearer;

//MAIN FUNCTION
function runner(snakey) {
    //Update the queue of the snake
    snakey.queue = queueDJ(snakey);
    //removing the null entry
    snakey.queue.shift();
    //checks to see if next tile is food OR if the snake's head is already on food somehow
    if(snakey.next() == foody.box || snakey.head.box.classList.contains("food")) {
        snakey.queue = new Array();
        console.log("food eaten");
        foody.box.box.classList.remove("food");
        snakey.eat();//replaces food with head, rest of snake does not move
        foody = new food(); //spawns in new piece of food at random location not on snake
    } else {
        snakey.direction = snakey.queue[0];
        //if the snake is not on food, it moves normally
        if(snakey.next() == foody.box) {
            snakey.eat();
            snakey.queue = new Array();
            snakey.queue = queueDJ(snakey);
            console.log("food eaten specially");
            foody.box.box.classList.remove("food");
            foody = new food();
        } else {
            snakey.direction = snakey.queue.shift();
            snakey.move();
        }
    }
    
}

function queueDJ(snakey) {
    let dj = dijkstra(snakey.x, snakey.y, foody.x, foody.y, snakey);
    let currentX = snakey.x;
    let currentY = snakey.y;
    if(dj === null) {
        console.log("bug");
        snakey.queue.push("right");
        return snakey.queue;
    }
    
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
    return snakey.queue;
}

//restart button
restart.addEventListener("click", function() {
    location.reload();
});

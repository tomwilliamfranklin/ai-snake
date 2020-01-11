const w = 1200;
const h = 1200;
const square = 100;
const map = new Array(w/square);
const background = [38,38,38];
const player = [201, 111, 66];
const playerStroke = [81, 92, 83];
const head = [250, 138, 82];
const dead = [166, 45, 45];
let p = null;
let direction = "up";

let sketch = function(canvas) {
    p = canvas;
}

p.setup = function() {
    for(var i = 0; i<map.length; i++) {
        map[i] = new Array(h/square);
    }

    direction = "up";
    const wrandom = Math.floor(Math.random() * (w/square));
    const hrandom = Math.floor(Math.random() * (h/square));
    p.createCanvas(w,h);
    p.background(255,204,0);
    p.fill(background);           	
    p.stroke(playerStroke);
    for(var i = 0; i!=w; i = i+square) {
        for(var ii = 0; ii!=h; ii = ii+square) {
            map[i/square][ii/square] = false;
            p.square(i, ii, square);
        }
    }
    p.fill(player);
    p.square(w/2,h/2, square);
    currentSpot[0] = w/2/square;
    currentSpot[1] = h/2/square;
    map[w/square/2][h/square/2] = true;
    p.frameRate(5);
}

const coor = {up:[0, -1],  //im actually a genius
left:[ -1, 0],          right:[ +1, 0],
            down:[0, +1]};

let currentSpot = [0,0];

p.draw = function() { 
    const toHead = [];

    nested();
    function nested() {
                var temp1 = currentSpot[0];
                var temp2 = currentSpot[1];
                        if(map[temp1 + coor[direction][0]] != null) {
                            if(map[temp1 + coor[direction][0]][temp2+coor[direction][1]] != null) {
                                if(map[temp1 + coor[direction][0]][temp2+coor[direction][1]] == true) {
                                    endGame();
                                } else {
                                    makeHead(temp1 + coor[direction][0], temp2 + coor[direction][1]);
                                    p.fill(player);
                                    p.square(temp1*square,temp2*square, square);
                                    return;
                                    
                                }
                            } else {
                                endGame();
                        }    
                        }  else {
                            endGame();
                        }                
                // for(let j = 0; j!=coor.length; j++) { 
                //     if(map[temp1 + coor[j][0]] != null) {
                //         if(map[temp1 + coor[j][0]][temp2 + coor[j][1]] != null) {
                //             toLive.push([temp1 + coor[j][0], temp2 + coor[j][1]])
                //         } 
                //     }
                // }
    }


    p.updatePixels();
}

function endGame() {
    for(var i = 0; i!=w; i = i+square) {
        for(var ii = 0; ii!=h; ii = ii+square) {
                var temp1 = i/square;
                var temp2 = ii/square;

                if(map[temp1][temp2]  == true) {
                    p.fill(dead);
                    p.square(i,ii, square);
                }         
            
        }
    }

    p.updatePixels();
}

 p.keyPressed = function() {
    if(p.keyCode === p.UP_ARROW) {
        direction = "up";
        console.log(direction);
    }
    if(p.keyCode === p.LEFT_ARROW) {
        direction = "left";
        console.log(direction);
    }
    if(p.keyCode === p.RIGHT_ARROW) {
        direction = "right";
        console.log(direction);
    }
    if(p.keyCode === p.DOWN_ARROW) {
        direction = "down";
        console.log(direction);
    }
}

function makeHead(width,height) {
    p.fill(head);
    p.square(width*square,height*square, square);
    map[width][height] = true;
    currentSpot[0] = width;
    currentSpot[1] = height;
}

function randomSquare() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    p.fill(r, g, b);
    p.square(i, ii, square);
}

$(document).ready(function() {
    new p5(sketch, 'container');
});
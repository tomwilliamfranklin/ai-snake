const w = 700;
const h = 700;
const square = 10;
const map = new Array(w/square);
const background = [38,38,38];
const endBackground = [18, 18, 18];
const player = [201, 111, 66];
const playerStroke = [81, 92, 83];
const food = [50, 168, 82];
const head = [250, 138, 82];
const dead = [166, 45, 45];
let currentHead = [0,0];
let snakeLength = 0;
let gamePlaying = true;
let snake = [];
let frameRate = 20;
let direction = "up";
let canvas = null;

//Algorithm
const openSetColour = [252, 186, 3];
const closedSetColour = [235, 64, 52];
const PathColour = [66, 135, 245];
let openSet = [];
let closedSet = [];
let start;
let end;
let path = [];
let AImoves = [];
let initialMove = false;

function Cell() {
    this.x = 0;
    this.y = 0;
    this.g = 0; //How far from start
    this.h = 0; //How far from end
    this.f = 0; //g + h, final cost
    this.body = false;
    this.food = false;
    this.previous = null;
}

let sketch = function(p) {
    canvas = p;
    for(var i = 0; i<map.length; i++) {
        map[i] = new Array(h/square);
    }

    p.setup = function() {
        snake = [];
        const wrandom = Math.floor(Math.random() * (w/square));
        const hrandom = Math.floor(Math.random() * (h/square));
        p.createCanvas(w,h);
        p.background(255,204,0);
        p.fill(background);           	
        p.stroke(playerStroke);
        for(var i = 0; i!=w; i = i+square) {
            for(var ii = 0; ii!=h; ii = ii+square) {
                map[i/square][ii/square] = new Cell();
                map[i/square][ii/square].x = i;
                map[i/square][ii/square].y = ii;
                p.square(i, ii, square);
            }
        }
        snakeLength = 1;
        begin();
        p.frameRate(frameRate);
        createFood();
        AIevaluate();
    }

    function begin() {
        p.fill(player);
        map[w/square/2][h/square/2].body = true;
        p.square(w/2,h/2, square);
        currentHead[0] = w/2/square;
        currentHead[1] = h/2/square;
        initialMove = true;
        repathAI();
    }

    function repathAI() {
        openSet = [];
        closedSet = [];
        openSet.push(map[currentHead[0]][currentHead[1]]);
        start = map[currentHead[0]][currentHead[1]];
        path = [];
        AImoves = [];
        endLoop = false;
        for(var i = 0; i!=w; i = i+square) {
            for(var ii = 0; ii!=h; ii = ii+square) {
                map[i/square][ii/square].g = 0;
                map[i/square][ii/square].h = 0;
                map[i/square][ii/square].f = 0;
                map[i/square][ii/square].previous = null;
            }
        }
        AIevaluate();   
    }

    const coor = {up:[0, -1],  //im actually a genius
    left:[ -1, 0],          right:[ +1, 0],
                down:[0, +1]};

    let previousDirection = "";

    //Snake Game
    p.draw = function() { 
        if(AImoves) {
            previousDirection = direction;
            dontmovepunk = false;
            switch(AImoves[0]) {
                case 'up': if(previousDirection === 'down') {
                    dontmovepunk = true;
                } break;
                case 'down': if(previousDirection === 'up') {
                    dontmovepunk = true;
                } break;
                case 'left': if(previousDirection === 'right') {
                    dontmovepunk = true;
                } break;
                case 'right': if(previousDirection === 'left') {
                    dontmovepunk = true;
                } break;
            }

            if(!dontmovepunk) {
                direction = AImoves[0];
                AImoves.shift();    
            } else {
                repathAI();
            }
            
        } 
        
        if(AImoves.length === 0) {
            if(map[currentHead[0]][currentHead[1]] != end) {
                repathAI();
            }
        } 
        
            // previousDirection = direction;

            // if(p.keyCode === p.UP_ARROW) {
            //     if(previousDirection != "down") {
            //          direction = "up";
            //      }
            //  }
        p.frameRate(frameRate);
        const toHead = [];
        var temp1 = currentHead[0];
        var temp2 = currentHead[1];
        if(direction) {
                if(map[temp1 + coor[direction][0]] != null) {
                    if(map[temp1 + coor[direction][0]][temp2+coor[direction][1]] != null) {
                        if(map[temp1 + coor[direction][0]][temp2+coor[direction][1]].body == true) {
                            endGame();
                        } else {
                            if(map[temp1 + coor[direction][0]][temp2+coor[direction][1]].food === true) {
                                snakeLength++;
                                map[temp1 + coor[direction][0]][temp2+coor[direction][1]].food = false;
                                createFood();
                            }
                            makeHead(temp1 + coor[direction][0], temp2 + coor[direction][1]);
                           addToSnake(temp1,temp2);

                            if(snake.length > snakeLength) {
                            removeTail();
                            }                
                        }
                    } else {
                       endGame();
                }    
                }  else {
                   endGame();
                }        
                setScore();   
            }  
                // for(let i = 0; i < closedSet.length; i++) {
                //     p.fill(background);
                //     p.square(closedSet[i].x,closedSet[i].y, square);
                // }

                // for(let i = 0; i < openSet.length; i++) {
                //     p.fill(background);
                //     p.square(openSet[i].x,openSet[i].y, square);
                // }

                // for(let i = 0; i < path.length; i++) {
                //     p.fill(PathColour);
                //      p.square(path[i].x,path[i].y, square);
                // }
        p.updatePixels();
    }

    let endLoop = false;
    const neigbours =    [[0, -1, 'down'],
        [ -1, 0, 'right'],              [ +1, 0, 'left'],
                        [0, +1, 'up']];
    //A* algorithm
    function AIevaluate() {
        lowest = 0;

        if(openSet.length > 0 && endLoop === false) {
            for(var i = 0; i<openSet.length; i++) {
                if(openSet[i].f < openSet[0].f) {
                    lowest = i;
                }
            }
            let current = openSet[lowest];

                path = [];
                let temp = current;
                path.push(temp);
                while(temp.previous) {
                    path.push(temp.previous);
                    temp = temp.previous;
                }
            if(current === end) {
                for(let step  = path.length-1; step != -1; step--) { 
                    for(let i = 0; i<neigbours.length; i++) {
                        if(path[step+1]) {
                          if(path[step+1].x/square == path[step].x/square + neigbours[i][0] && 
                            path[step+1].y/square == path[step].y/square + neigbours[i][1]) {
                              AImoves.push(neigbours[i][2]);
                              continue;
                                
                          }
                        } else {
                        }
                    }
                }
               // AImoves.pop(); 
            //    AImoves = AImoves.reverse();
            }

           removeFromArray(openSet, current);
            closedSet.push(current);
            for(let i  = 0; i < neigbours.length; i++) {
                if(map[current.x/square + neigbours[i][0]]) {
                    if(map[current.x/square + neigbours[i][0]][current.y/square + neigbours[i][1]]) {
                        if(!closedSet.includes(map[current.x/square + neigbours[i][0]][current.y/square + neigbours[i][1]])) {
                        if(!map[current.x/square + neigbours[i][0]][current.y/square + neigbours[i][1]].body) {
                           if(closedSet.includes(current)) {
                              let tempG = current.g + 1;
                                if(openSet.includes(map[current.x/square + neigbours[i][0]][current.y/square + neigbours[i][1]])) {
                                    if(tempG < map[current.x/square + neigbours[i][0]][current.y/square + neigbours[i][1]].g) {
                                        map[current.x/square + neigbours[i][0]][current.y/square + neigbours[i][1]].g = tempG;
                                    }
                                } else {
                                    map[current.x/square + neigbours[i][0]][current.y/square + neigbours[i][1]].g = tempG;
                                    openSet.push(map[current.x/square + neigbours[i][0]][current.y/square + neigbours[i][1]]);
                                }                
                                neigbours.h = heuristic(map[current.x/square + neigbours[i][0]][current.y/square + neigbours[i][1]], start);
                                neigbours.f = neigbours.g + neigbours.h;
                                map[current.x/square + neigbours[i][0]][current.y/square + neigbours[i][1]].previous = current;
                            }
                        }
                        }

                    }
                }
            }
            AIevaluate();
        } else {
             
        }


    }

    function heuristic(a,b) {
        let d = p.dist(a.x,a.y,b.x,b.y);
    }

    function removeFromArray(array, item) {
        for(let i = array.length-1; i>=0; i--) {
            if(array[i].x == item.x && array[i].y == item.y) {
                array.splice(i,1);
            }
        }
    }
    function endGame() {
        for(var i = 0; i!=w; i = i+square) {
            for(var ii = 0; ii!=h; ii = ii+square) {
                    var temp1 = i/square;
                    var temp2 = ii/square;

                    if(map[temp1][temp2].body  == true) {
                        p.fill(dead);
                        p.square(i,ii, square);
                    }         
                    else {
                        p.fill(endBackground);
                        p.square(i,ii,square);
                    }
            }
        }

        p.updatePixels();
        gamePlaying = false;
        p.frameRate(0);
        
    }
    previousDirection = "up";
     p.keyPressed = function() {
        //     if(!gamePlaying) {
        //         p.setup();  
        //         gamePlaying = true; 
        //     } else {
        //     previousDirection = direction;

        //     if(p.keyCode === p.UP_ARROW) {
        //         if(previousDirection != "down") {
        //             direction = "up";
        //         }
        //     }
        //     if(p.keyCode === p.LEFT_ARROW) {
        //         if(previousDirection != "right") {
        //             direction = "left";
        //         }
        //     }
        //     if(p.keyCode === p.RIGHT_ARROW) {
        //         if(previousDirection != "left") {
        //             direction = "right";
        //         }
        //     }
        //     if(p.keyCode === p.DOWN_ARROW) {
        //         if(previousDirection != "up") {
        //             direction = "down";
        //         }
        //     }
        // }
    }

    function addToSnake(width,height) {
        p.fill(player);
        p.square(width*square,height*square, square);
        snake.push([width, height]);
       openSet.push(map[width][height]);
    }

    function makeHead(width,height) {
        
        p.fill(head);
        p.square(width*square,height*square, square);
        map[width][height].body = true;
        currentHead[0] = width;
        currentHead[1] = height;
    }

    function removeTail() {
        p.fill(background);
        var tail = snake.shift();
        map[tail[0]][tail[1]].body = false;
        p.square(tail[0]*square,tail[1]*square, square);
    }

    function createFood() {
        p.fill(food);

        const wRandom = Math.floor(Math.random() * w/square) * square;
        const hRandom = Math.floor(Math.random() * h/square) * square;
        if(map[wRandom/square][hRandom/square].body) {
            createFood();
        } else {
            map[wRandom/square][hRandom/square].food = true;
            end = map[wRandom/square][hRandom/square];
            p.square(wRandom, hRandom, square);
            repathAI();
        }
    }
}

//UI functions 

function changeFrameRate() {
    frameRate = parseInt(document.getElementById('frames').value);
    canvas.frameRate(frameRate);
}

function resetFunc() {
    frameRate = parseInt(document.getElementById('frames').value);
    canvas.frameRate(frameRate);
}

function setScore() {
    document.getElementById('score').innerHTML = snakeLength;
}

$(document).ready(function() {
    new p5(sketch, 'container');
});
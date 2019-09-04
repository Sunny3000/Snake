var chessBoard,     //棋盘
    squareSet;      //格子
var toward = {      //方向
    UP: {x: 0, y: 1},
    DOWN: {x: 0, y: -1},
    LEFT: {x: -1, y: 0},
    RIGHT: {x: 1, y: 0} 
}
var timer;
var frame = 40;
var protagonist;//玩家控制的蛇
var snake = [];//蛇的集合

var maxThingSize = 20;//允许存在的物体数量
var things = [];//所有生成的物体存放在这个集合中

window.onload = function () {
    chessBoard = document.getElementById('chess_board');
    initChess();
    initSnake();
    repaint();
}


//初始化场地
function initChess() {
    squareSet = new Array(25);
    for (var i = 0; i < squareSet.length; i ++) {
        squareSet[i] = new Array(25);
        for (var j = 0; j < squareSet[i].length; j ++) {
            squareSet[i][j] = document.createElement('div');
            squareSet[i][j].classList.add('square');
            chessBoard.appendChild(squareSet[i][j]);
        }
    }

}


//贪吃蛇的构造函数
function Snake(headX, headY, nowToward, length, bgColor) {
    this.snakeBody = [];
    this.nowToward = nowToward;
    this.headMoveX = nowToward.x;
    this.headMoveY = nowToward.y;
    this.bgColor = bgColor;
    this.changeToward = null;
    this.changeNextStation = 0;
    this.init = function(headX, headY, nowToward, length, bgColor) {
        for (var i = 0; i < length; i ++) {
            this.grow(headX, headY, bgColor);
        }
    }
    this.grow = function (headX, headY, bgColor) {
        var ball;
        if (this.snakeBody == 0) {
            ball = createBall(headX, headY, 'yellow');
        } else if (this.snakeBody[this.snakeBody.length - 1].point.length == 0) {//蛇尾距离蛇头之间没有拐点
            var lastBody = this.snakeBody[this.snakeBody.length - 1];
            ball = createBall(lastBody.x + -1 * this.nowToward.x * 20, lastBody.y + -1 * this.nowToward.y * 20, bgColor);
        } else {//蛇尾距离蛇头有拐点，遵循拐点方向
            var lastBody = this.snakeBody[this.snakeBody.length - 1];
            var point = lastBody.point[0];
            ball = createBall(lastBody.x + -1 * point.speedX * 20, lastBody.y + -1 * point.speedY * 20, bgColor);
            ball.point = clone(lastBody.point);
        }
        this.snakeBody.push(ball);
    }
    this.init(headX, headY, nowToward, length, bgColor);
    this.turnUp = function () {//向上转动
        this.nowToward = toward.UP;
        change(this, 0, -1);
    }
    this.turnDown = function () {//向下转动
        this.nowToward = toward.DOWN;
        change(this, 0, 1);
    }
    this.turnLeft = function () {//向左转动
        this.nowToward = toward.LEFT;
        change(this, -1, 0);
    }
    this.turnRight = function () {//向右转动
        this.nowToward = toward.RIGHT;
        change(this, 1, 0);
    }
    this.over = function () {//这条蛇就这么挂了。如果是玩家的蛇，那么游戏结束。
        if (protagonist == this) {
            clearInterval(timer);
            clearInterval(thingFactory.autoGenerateTimer);
            alert("游戏结束");
        } else {
            for (var i = 0 ; i < this.snakeBody.length ; i ++) {
                // console.log(this.snakeBody[i]);
                chessBoard.removeChild(this.snakeBody[i]);
                this.snakeBody[i].display = "none";
                thingFactory.createThing(this.snakeBody[i].x, this.snakeBody[i].y, thingFactory.typeEnums.food, )
            }
        }
    }
}


//初始化贪吃蛇
function initSnake() {
    protagonist = new Snake(40, 0, toward.RIGHT, 3, 'pink');
    snake.push(protagonist);
}


//创建body
function createBall(x, y, bgColor) {
    var ball = document.createElement('div');
    ball.classList.add('ball');
    ball.style.left = x + 'px';
    ball.style.top = y + 'px';
    ball.x = x;
    ball.y = y;
    ball.point = [];
    ball.style.backgroundColor = bgColor;
    chessBoard.appendChild(ball);
    return ball;
}


function move() {
    for (var i = 0; i < snake.length; i ++) {
        for (var j = 0; j < snake[i].snakeBody.length; j ++) {
            if (snake[i].snakeBody[j].point.length > 0) {
                snake[i].snakeBody[j].x += snake[i].snakeBody[j].point[0].speedX;
                snake[i].snakeBody[j].y += snake[i].snakeBody[j].point[0].speedY;
                if (snake[i].snakeBody[j].x == snake[i].snakeBody[j].point[0].x && snake[i].snakeBody[j].y == snake[i].snakeBody[j].point[0].y) {
                    snake[i].snakeBody[j].point.shift();
                }
            } else {
                snake[i].snakeBody[j].x += snake[i].headMoveX;
                snake[i].snakeBody[j].y += snake[i].headMoveY;
            }
        }

        
    }
    repaint();
}


function repaint() {
    for (var i = 0; i < snake.length; i ++) {
        for (var j = 0; j < snake[i].snakeBody.length; j ++) {
            snake[i].snakeBody[j].style.left = snake[i].snakeBody[j].x + "px";
            snake[i].snakeBody[j].style.top = snake[i].snakeBody[j].y + "px";
        }
    }
    for (var i = 0 ; i < things.length ; i ++) {
        things[i].style.left = things[i].x + "px";
        things[i].style.top = things[i].y + "px";
        things[i].style.display = "block";
    }
}


function change(snake, x, y) {//转换方向的方法
    var lastX = snake.snakeBody[0].x;
    var lastY = snake.snakeBody[0].y;
    var speedX = snake.headMoveX;
    var speedY = snake.headMoveY;
    for (var i = 1 ; i < snake.snakeBody.length ; i ++) {//因为蛇头进行旋转了，但是蛇身必须要走完当前这段路才能进行转弯，所以要将转弯的点记录下来。
        snake.snakeBody[i].point.push({x: lastX, y: lastY, speedX: speedX, speedY: speedY})
    }
    snake.headMoveX = x;
    snake.headMoveY = y;
}


function tryChangeToward() {//尝试进行转弯，因为有的方向时不需要进行方向转换的，比如相同方向或者相反方向
    for (var i = 0 ; i < snake.length ; i ++) {
        if (snake[i].changeNextStation > 0) {
            snake[i].changeNextStation -= 1;
            continue;
        }
        if (snake[i].changeToward && snake[i].changeToward.change != snake[i].nowToward) {//不能是相同方向
            if (snake[i].changeToward.change.x + snake[i].nowToward.x != 0 || snake[i].changeToward.change.y + snake[i].nowToward.y != 0) {
                snake[i].changeNextStation = 20;
                snake[i].nowToward = snake[i].changeToward.change;
                snake[i].changeToward.act.call(snake[i]);
            }
        }
    }
}


function start() {
    // clearInterval(timer);
    timer = setInterval(function () {//开始计时器，刷新频率为上面初始化的数值
        tryChangeToward();
        move();//蛇移动
        checkCrash();//检查碰撞
    }, 1000 / frame);

    thingFactory.autoGenerate();


    document.onkeydown=function(event){//监听键盘事件
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if (e.keyCode == 38) {
            protagonist.changeToward = {change:toward.UP, act:protagonist.turnUp};
        } else if (e.keyCode == 40) {
            protagonist.changeToward = {change:toward.DOWN, act:protagonist.turnDown};
        } else if (e.keyCode == 37) {
            protagonist.changeToward = {change:toward.LEFT, act:protagonist.turnLeft};
        } else if (e.keyCode == 39) {
            protagonist.changeToward = {change:toward.RIGHT, act:protagonist.turnRight};
        }
    }
}


function clone(obj) {//对象克隆方法，可以将一个对象克隆生成一个新的并且一模一样的对象。
    return JSON.parse(JSON.stringify(obj));
}


function getDistance(a, b) {//给出两个在游戏场地的模型，可以计算出两个模型中心的距离
    var snackCenterX = a.x + 10;
    var snackCenterY = a.y + 10;
    var thingsCenterX = b.x + 10;
    var thingsCenterY = b.y + 10;
    var absX = Math.abs(snackCenterX - thingsCenterX);//获取横向距离绝对值
    var absY = Math.abs(snackCenterY - thingsCenterY);//获取纵向距离绝对值
    var distance = Math.sqrt(Math.pow(absX, 2) + Math.pow(absY, 2), 2);//使用勾股定理计算出距离
    return distance;
}

var thingFactory = {//创建物体的工厂，在核心代码中只有一种类型——食物
    autoGenerateTimer: null,
    typeEnums: {//物体类型枚举，如果需要进行扩展，可以添加新的枚举类型。
        food: {
            name: "food", value:2, bgColor: "red",
            act:function (origin) {//当蛇触碰到物体时会触发的动作
                origin.grow(null, null, origin.bgColor);
            }
        }
    },
    createThing : function (x, y, type) {//创建物体
        var temp = createBall(x, y, type.bgColor);//调用基础的createBall方法来创建一个物体模型
        temp.value = type.value;
        temp.act = this.typeEnums.food.act;
        things.push(temp);
        return temp;
    },
    randomGenerate: function () {//随机生成物体
        var x = parseInt(Math.random() * 480);
        var y = parseInt(Math.random() * 480);
        var temp = createBall(x, y, this.typeEnums.food.bgColor);
        temp.act = this.typeEnums.food.act;
        things.push(temp);
    },
    autoGenerate: function () {//自动生成物体
        this.autoGenerateTimer = setInterval(function () {
            if (things.length < maxThingSize) {
                thingFactory.randomGenerate();
            }
        }, 2000);
    }
}


function checkCrash() {//检查碰撞，主要检查蛇与边界的碰撞，蛇与蛇的碰撞，蛇与物体的碰撞
    for (var i = 0; i < snake.length; i ++) {
        var x = snake[i].snakeBody[0].x;
        var y = snake[i].snakeBody[0].y;
        if (x < 0 || x > 480 || y < 0 || y > 480 ) {//检查蛇与边界的碰撞
            snake[i].over();
            snake.splice(i, 1);
            continue;
        }
        for (var j = 0 ; j < things.length ; j ++) {//检查蛇与食物的碰撞
            var distance = getDistance(snake[i].snakeBody[0], things[j]);
            if (distance < 20) {
                things[j].act(snake[i]);
                chessBoard.removeChild(things[j]);
                things.splice(j, 1);
            }
        }
    }
}

function checkFinish() {//检查游戏是否结束
    if (snake.length == 1 && snake[0] == mainsnake) {
        alert("获胜~！");
        clearInterval(timer);
        clearInterval(thingFactory.autoGenerateTimer);
    }
}
























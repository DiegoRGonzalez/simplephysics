///////////////////////////////////////////////////////////////
//                                                           //
//                    CONSTANT STATE                         //

// TODO: DECLARE and INTIALIZE your constants here
var START_TIME = currentTime();


///////////////////////////////////////////////////////////////
//                                                           //
//                     MUTABLE STATE                         //

// TODO: DECLARE your variables here
var lastKeyCode;
var items = [];
var paused = false;
var currentDrag;
var newForce;
var dragging = false;
var gravity = true;
var arrow = loadImage("arrow.png");


///////////////////////////////////////////////////////////////
//                                                           //
//                      EVENT RULES                          //

// When setup happens...
function onSetup() {
    // TODO: INITIALIZE your variables here
    lastKeyCode = 0;

    setupGame();
}


// When a key is pushed
function onKeyStart(key) {
    lastKeyCode = key;
}

function setupGame(){

    ball = {
        radius: 50, pos: {x: screenWidth/2, y:screenHeight/2},color: makeColor(1,0,0,1),
        physics: { acc: {x:0,y:0}, spd: {x:0,y:0}, constForces: [], quiver: [] }
    }
    ball.draw = function(x, y) {
        if( paused ){
            var qvr = this.physics.quiver;
            for ( var i = 0; i < qvr.length; i++){
                drawArrow(this.pos, qvr[i].ray, 100, qvr[i].angle, qvr[i].strength.abs);

            }
        }

        fillCircle(this.pos.x,this.pos.y,this.radius,this.color);
    }
    items.push(ball);
}

function drawArrow(source, ray, width, angle, strength){
    var slope = (source.y - ray.y) / (source.x - ray.x);
    var intercept = source.y - (slope * source.x);

//    var xShift = 0;

//    if( angle > Math.PI/2 && angle < 3*Math.PI/2){
//        xShift = 50;
//    } else if(angle > Math.PI/2 && angle < 3*Math.PI/2){
//        xShift = -50;
//    }

//    var nx = ray.x + xShift;

//    var ny = 50 + ray.y;
//    if (nx != ray.x){
//        ny = slope*nx + intercept;
//    }else if ( angle > Math.PI){
//        ny -= 100;
//    }

//TEMPORARY
var xShift = 0;
var yShift = -50;

if(angle > Math.PI){
    yShift = 90;
    xShift = 20;
}

var nx = ray.x + xShift;
var ny = ray.y + yShift;


    fillText(Math.floor(strength), nx, ny, makeColor(0,0,0,1), "50pt Arial")
    strokeLine(source.x, source.y, ray.x, ray.y, makeColor(0,0,0,1), 10)
    drawTransformedImage(arrow, ray.x, ray.y, angle, 0.1, 0.1);
}

function onTouchStart(posX, posY, id){
    //console.log("YES");
    touchPos = {x: posX, y: posY};
    if(paused){
        var playButton = {pos: {x: 150, y: 150},
                          radius: 100}
        if (isWithin(touchPos, playButton)){
            unpause();
        }
    }

    var gravButton = {pos: {x: 150, y: screenHeight - 150},
                      radius: 100};

    if (isWithin(touchPos, gravButton)){
        gravity = !gravity;
        }

    for(var i = 0; i < items.length; i++){
        if (isWithin(touchPos, items[i])){
            dragging = true;
            currentDrag = items[i];
            var force = { angle:  findAngle(touchPos, currentDrag) ,
                          ray: clone(touchPos),
                          strength: findStrength(touchPos, currentDrag)}
            newForce = currentDrag.physics.quiver.length;
            currentDrag.physics.quiver[newForce] = force;
            paused = true;
        }
    }
}

function onTouchMove(posX, posY, id){
    if(dragging){
        var curTouch = {x: posX, y: posY};
        var curForce = { angle:  findAngle(curTouch, currentDrag) ,
                      ray: clone(curTouch),
                      strength: findStrength(curTouch, currentDrag)}

        currentDrag.physics.quiver[newForce] = curForce;
    }
}

function findStrength(ray, source){
    var newStrength = {};
    var absStrength = Math.pow((Math.pow(ray.x - source.pos.x, 2) +
                       Math.pow(ray.y - source.pos.y, 2)), 0.5) ;
    newStrength.abs = absStrength/ 50;

    var absX = ray.x - source.pos.x;
    newStrength.x = absX / 15;
    var absY = ray.y - source.pos.y;
    newStrength.y = absY / 15;

    return newStrength;

}

function onTouchEnd(posX, posY, id){
    dragging = false;
}

function unpause(){
    paused = false;
    for(var j = 0; j < items.length; j++){
        qvr = items[j].physics.quiver;
        for(var i = 0; i < qvr.length; i++){
            items[j].physics.spd.x += qvr[i].strength.x;
            items[j].physics.spd.y += qvr[i].strength.y;
        }

        items[j].physics.quiver = [];
    }
}

function clone(obj){
    return JSON.parse(JSON.stringify(obj));
}

function findAngle(ray, source){
    zeroMark = { x: -1, y: 0}
    newAngle = { x: ray.x - source.pos.x, y: ray.y - source.pos.y}

    preAngle = (((zeroMark.x * newAngle.x) + (zeroMark.y * newAngle.y)) /
                (Math.pow((Math.pow(zeroMark.x, 2) + Math.pow(zeroMark.y, 2)), 0.5) *
                 Math.pow((Math.pow(newAngle.x, 2) + Math.pow(newAngle.y, 2)), 0.5)) )

    var angle = Math.acos(preAngle);

    if( newAngle.y > 0){
        angle = (2 * Math.PI) - angle
    }

    return angle;
}

function isWithin(testPos, item){
    buffer = 20;
    //console.log(testPos);
    //console.log(item);
    if ( testPos.x <= item.pos.x + item.radius + buffer &&
         testPos.x >= item.pos.x - item.radius - buffer &&
         testPos.y <= item.pos.y + item.radius + buffer &&
         testPos.y >= item.pos.y - item.radius - buffer){
             console.log("Yes");
             return true;
         }else{
             console.log("No");
             return false;
         }
}


// Called 30 times or more per second
function onTick() {
    // Some sample drawing

    fillRectangle(0, 0, screenWidth, screenHeight, makeColor(0,1,0,1));
    if(!paused){
        doPhysics();
    }

    drawScreen();
    if (paused){
            fillText("PAUSED", screenWidth - 300,100,makeColor(1,0,0.1), "70px Arial");
    }



}

function drawScreen(){
    fillRectangle(0, 0, screenWidth, screenHeight, makeColor(.3,.3,1,1));
    fillRectangle(0,0, 300, screenHeight, makeColor(.4,.4,.4,1));
    fillCircle(150,150,100, makeColor(0,1,0,1));
    fillCircle(150,screenHeight - 150, 100, makeColor(1,1,0,1));
    gravState = "off";
    if(gravity){gravState = "on"};
    fillText("Gravity: " + gravState,300,screenHeight - 100,makeColor(1,1,1,1), "70px Arial");
    for (var i = 0; i < items.length; i++){
        items[i].draw();
    }

}


function doPhysics(){
    for (var i = 0; i < items.length; i++){
        for(var j = 0; j < items[i].physics.constForces.length; j++){
            items[i].physics.spd.x += items[i].physics.constForces[j].x;
            items[i].physics.spd.y += items[i].physics.constForces[j].y;
        }

        if(gravity){
            items[i].physics.spd.y += .5;
        }

        items[i].pos.x += items[i].physics.spd.x;
        items[i].pos.y += items[i].physics.spd.y;

        if( items[i].pos.x > screenWidth - items[i].radius){
            items[i].physics.spd.x *= -0.3;
            items[i].pos.x = screenWidth - items[i].radius;
        }else if( items[i].pos.x < 300 + items[i].radius){
            items[i].physics.spd.x *= -0.3;
            items[i].pos.x = 300 + items[i].radius;
        }else if( items[i].pos.y > screenHeight - items[i].radius){
            items[i].physics.spd.y *= -0.3;
            items[i].pos.y = screenHeight - items[i].radius;
        }else if( items[i].pos.y < items[i].radius){
            items[i].physics.spd.y *= -0.3;
            items[i].pos.y = items[i].radius;
        }

    }
}

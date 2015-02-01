// Matter.js module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Common = Matter.Common,
    Constraint = Matter.Constraint,
    Events = Matter.Events,
    Bounds = Matter.Bounds,
    Vector = Matter.Vector,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Query = Matter.Query;

// some example engine options
var options = {
    positionIterations: 6,
    velocityIterations: 4,
    enableSleeping: false
};

// create a Matter.js engine
var container = document.getElementById('canvas-container');
var engine = Engine.create(container, options);

var renderOptions = engine.render.options;

//renderOptions
renderOptions.wireframes = false;
renderOptions.hasBounds = false;
renderOptions.showDebug = false;
renderOptions.showBroadphase = false;
renderOptions.showBounds = false;
renderOptions.showVelocity = false;
renderOptions.showCollisions = false;
renderOptions.showAxes = false;
renderOptions.showPositions = false;
renderOptions.showAngleIndicator = true;
renderOptions.showIds = true;
renderOptions.showShadows = false;
renderOptions.background = '#fff';

// create two boxes and a ground
var wall_top = Bodies.rectangle(400, -30, 810, 100, { isStatic: true });
var ground = Bodies.rectangle(400, 630, 810, 100, { isStatic: true });
var wall_left = Bodies.rectangle(-30, 300, 100, 610, { isStatic: true });
var wall_right = Bodies.rectangle(830, 300, 100, 610, { isStatic: true });

var mouseConstraint = MouseConstraint.create(engine);
World.add(engine.world, mouseConstraint);
Body.rotate(wall_right, Math.PI);

// add all of the bodies to the world
World.add(engine.world, [wall_top, ground, wall_left, wall_right]);
/*****************
**Event tick
*****************/
var tickCount = 0;
var tickEvent = function(e){
    tickCount++;
    if(tickCount > 60){
        tickCount = 0;
        for(var i = 0; i < myboxs.length; i++){
            body = myboxs[i].body;
            if(body.angularSpeed < 0.1 && body.speed < 0.3){
                var deg = rad_to_deg(body.angle);
                if((deg < 315 && deg > 225)){           //立正站好的
                    myboxs[i].healthChange(1);
                } else if((deg < 135 && deg > 45)){     //倒立的
                    myboxs[i].healthChange(-1);
                    myboxs[i].emotionChange(-2);
                } else {                                //側躺
                    //myboxs[i].healthChange(-1);
                    //myboxs[i].emotionChange(-1);
                }
                
            }
            myboxs[i].updateDisplay();
            
            //test action
            //myboxs[i].doAction();
        }
        
    }
};
Events.on(engine, "tick", tickEvent ); 

/*****************
**Event collisionStart
*****************/
var collisionStartEvent = function(e){
    for(var i=0;i<e.source.pairs.collisionStart.length; i++)
    {
        var coll = e.source.pairs.collisionStart[i];
        var groundId = ground.id;
        if(coll.bodyA.id == groundId || coll.bodyB.id == groundId)
        {
            var calcObject = coll.bodyA.id != groundId ? coll.bodyA : coll.bodyB;
            //console.log("CollObjectStart : " + calcObject.id + ", myboxs id is " + calcObject.myboxs_id);
            insert_memory(calcObject, "ground", "start");
            //myboxs[calcObject.myboxs_id].jump();
            
        }
        else if(coll.bodyA.isStatic == false && coll.bodyB.isStatic == false)
        {
            //console.log("CollObjectStart : " + coll.bodyA.id + " with " + coll.bodyB.id);
            insert_memory(coll.bodyA, coll.bodyB, "start");
            insert_memory(coll.bodyB, coll.bodyA, "start");
            if(Math.abs(coll.bodyA.position.y - coll.bodyB.position.y) > 40){
                if(coll.bodyA.position.y > coll.bodyB.position.y){ //A在下面
                    myboxs[coll.bodyA.myboxs_id].emotionChange(-1);
                    myboxs[coll.bodyB.myboxs_id].emotionChange(1);
                    //console.log("song");
                }else{ //B在下面
                    myboxs[coll.bodyB.myboxs_id].emotionChange(-1);
                    myboxs[coll.bodyA.myboxs_id].emotionChange(1);
                }
            }
        }
    }
};
Events.on(engine, "collisionStart", collisionStartEvent ); 

/*****************
**Event collisionEnd
*****************/
var collisionEndEvent = function(e){
    for(var i=0;i<e.source.pairs.collisionEnd.length; i++)
    {
        var coll = e.source.pairs.collisionEnd[i];
        var groundId = ground.id;
        if(coll.bodyA.id == groundId || coll.bodyB.id == groundId)
        {
            var calcObject = coll.bodyA.id != groundId ? coll.bodyA : coll.bodyB;
            //console.log("CollObjectEnd : " + calcObject.id + ", myboxs id is " + calcObject.myboxs_id);
            insert_memory(calcObject, "ground", "end");
            
        }
        else if(coll.bodyA.isStatic == false && coll.bodyB.isStatic == false)
        {
            //console.log("CollObjectEnd : " + coll.bodyA.id + " with " + coll.bodyB.id);
            insert_memory(coll.bodyA, coll.bodyB, "end");
            insert_memory(coll.bodyB, coll.bodyA, "end");
        }
    }
};
Events.on(engine, "collisionEnd", collisionEndEvent ); 


//RUN!!!!!!!
Engine.run(engine);



/************************* 
** BOXs
*************************/

var myboxs = [];

function MyBox(size){
    

    
    this.init = function() {
        this.body = Bodies.rectangle(400, 200, size, size);
        this.updateColor();
        World.add(engine.world, this.body);
        this.health = 20;
        this.emotion = 5;
        this.memory = [];
        this.comprehension = [];//認知
        //this.logic = [];
        //this.target = [];
        this.isDead = false;
        this.selectMinTime = 900;
        this.selectMaxTime = 1100;
        this.selectJump = 3;
        this.selectLeft = 2;
        this.selectRight = 2;
        this.selectNone = 3;
        this.forceInterScale = Math.random()*0.4+1;
        this.speedInterScale = Math.random()*0.4+1;
        $( "#health-bar" ).html($( "#health-bar" ).html() + "<div id=\"box" + this.body.id + "\">Loading...</div>");
        setTimeout(this.selfTimer, 2000, this);
    };
    
    this.selfTimer = function(self){
        var time = Math.floor(Math.random()*(self.selectMaxTime - self.selectMinTime)) + self.selectMinTime;
        time = time * self.speedInterScale;
        if(self.health <= 5)time *= 0.5;
        if(self.health <= 1)time *= 0.4;
        //console.log(time);
        self.doAction();
        setTimeout(self.selfTimer, time, self);
    }

    //UPDATE=============
    this.updateDisplay = function(){
        $( "#box" + this.body.id ).html("B" + this.body.id + "- H:" + this.health + " E:" + this.emotion);
    };
    
    this.updateColor = function(){
        if(this.emotion <= -40){
            this.body.render.fillStyle = "#E66";
        }else if(this.emotion <= -20){
            this.body.render.fillStyle = "#B5B";
        }else if(this.emotion >= 20){
            this.body.render.fillStyle = "#6A6";
        }else if(this.emotion >= 40){
            this.body.render.fillStyle = "#DB3";
        }else{ //一般顏色
        this.body.render.fillStyle = "#9AB";
        }
        if(this.health <= 1){
            this.body.render.strokeStyle = "#FF0000";
        }else if(this.health <= 5){
            this.body.render.strokeStyle = "#AA0000";
        }else{
            this.body.render.strokeStyle = "rgba( 0,0,0,0.7)";
        }
    }
    
    //datachanger
    this.healthChange = function(how){
        this.health += how;
        if(this.health <= 0){
            this.destroy();
            this.health=0;
        }
        if(this.health > 20)this.health=20;
        this.updateColor();
    };
    
    this.emotionChange = function(how){
        this.emotion += how;
        if(this.emotion < -50)this.emotion=-50;
        if(this.emotion > 50)this.emotion=50;
        this.updateColor();
    };
    
    //about action
    this.actionSet = function(jump,left,right,none){
        this.selectJump = jump;
        this.selectLeft = left;
        this.selectRight = right;
        this.selectNone = none;
    };
    
    this.doAction = function(){
        if(Math.abs(this.body.velocity.y) > 0.1)return; //有y動量就不能動
        this.writeComprehension();
        var selectAll = this.selectJump + this.selectLeft + this.selectRight + this.selectNone;
        var random = Math.ceil(Math.random()*selectAll);
        //console.log(random);
        if(random <= this.selectJump){
            this.jump();
            //console.log("JUMP");
            return;
        }
        random -= this.selectJump;
        
        if(random <= this.selectLeft){
            this.roateLeft();
            return;
        }
        random -= this.selectLeft;
        
        if(random <= this.selectRight){
            this.roateRight();
            return;
        }
        //none ~
        //do nothing XD
    }
    
    this.forceHEScale = function(force_i){
        var force = force_i;
        if(Math.abs(this.emotion) >= 20)force *= 1.2;
        if(Math.abs(this.emotion) >= 40)force *= 1.2;
        return force;
    }
    
    //function
    this.jump = function(forceScale){
        if(isNaN(forceScale))forceScale = 1;
        var force = forceScale * 0.07;
        force *= this.forceInterScale;
        force = this.forceHEScale(force);
        var init_x=force/2;
        var init_y=0;
        var x=Math.cos(this.body.angle)*Math.sqrt(init_x*init_x + init_y*init_y);
        var y=Math.sin(this.body.angle)*Math.sqrt(init_x*init_x + init_y*init_y);
        Body.applyForce(this.body, {x:0, y:0}, {x:x, y:y-force});
    };
    this.roateLeft = function(forceScale){ //BUG only on width 50 work good
        if(isNaN(forceScale))forceScale = 1;
        var force = forceScale * 55;
        force *= this.forceInterScale;
        force = this.forceHEScale(force);
        Body.applyForce(this.body, {x: 50, y:0}, {x:0, y:-force});
        Body.applyForce(this.body, {x: -50, y:0}, {x:0, y:force});
    };
    this.roateRight = function(forceScale){ //BUG only on width 50 work good
        if(isNaN(forceScale))forceScale = 1;
        var force = -forceScale * 55;
        force *= this.forceInterScale;
        force = this.forceHEScale(force);
        Body.applyForce(this.body, {x: 50, y:0}, {x:0, y:-force});
        Body.applyForce(this.body, {x: -50, y:0}, {x:0, y:force});
    };
    
    
    //about coll~
    this.writeComprehension = function(){
        //console.log(this.memory);
        if(this.memory.length > 0){
            console.log(this.getNearData());
        }
        this.memory = [];
        insert_memory(this.body,"none","beforeAction");
    }
    
    this.getNearData = function(){
        var coll = engine.pairs.collisionActive;
        var bottom = "0";
        var top = "0";
        for(var i=0; i<coll.length; i++){
            if(coll[i].bodyA.id == this.body.id || coll[i].bodyB.id == this.body.id ){
                var bodyB;
                var bodyA;
                if(coll[i].bodyB.id == this.body.id){
                    bodyB = coll[i].bodyA;
                    bodyA = this.body;
                } else {
                    bodyA = coll[i].bodyA;
                    bodyB = coll[i].bodyB;
                }
                if(bodyB.id == ground.id){
                    bottom = 2;
                } else if(bodyA.isStatic == false && bodyB.isStatic == false) {
                    if(Math.abs(bodyA.position.y - bodyB.position.y) > 40){
                        if(bodyA.position.y > bodyB.position.y){ //A在下面
                            top = "1";
                        } else {
                            bottom = "1";
                        }
                    }
                }
            }
        }
        return top + bottom;
    };
    
    
    //about object
    
    this.destroy = function(){
        World.remove(engine.world, this.body);
        $( "#box" + this.body.id ).remove();
        this.isDead = true;
    };
    
    this.init();
} // MyBox End //


/************************* 
** ButtonFunction
*************************/
function addNewBox(){
    var myboxs_id = myboxs.length;
    myboxs[myboxs_id]=new MyBox(50);
    myboxs[myboxs_id].body.myboxs_id = myboxs_id;
}

/************************* 
** SomeFunction
*************************/
function floatCompare(a,b)
{
        if(Math.abs(a - b) < 0.1)
            return true;
        return false;
}

function insert_memory(body, target, type){
    if(target != "ground"){
        target = {
            id: target.id,
            angel: target.angle,
            angularSpeed: target.angularSpeed,
            angularVelocity: target.angularVelocity,
            position: target.position,
            velocity: target.velocity
        }
    }
    var memory = myboxs[body.myboxs_id].memory;
    var this_memory = {
        type: type,
        self: { 
            angel: body.angle,
            angularSpeed: body.angularSpeed,
            angularVelocity: body.angularVelocity,
            position: body.position,
            velocity: body.velocity
        },
        target: target,
        time: new Date().getTime()
    };
    memory[memory.length] = this_memory;
}
function rad_to_deg(rad){
    var deg = rad/2/Math.PI*360;
    if(deg<0){
        deg = 360 + (deg % 360);
    } else {
        deg = deg % 360;
    }
    return deg;
}
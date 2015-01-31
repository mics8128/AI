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
renderOptions.wireframes = true;
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
var wall_left = Bodies.rectangle(-30, 300, 100, 600, { isStatic: true });
var wall_right = Bodies.rectangle(830, 300, 100, 600, { isStatic: true });

var mouseConstraint = MouseConstraint.create(engine);
World.add(engine.world, mouseConstraint);

// add all of the bodies to the world
World.add(engine.world, [wall_top, ground, wall_left, wall_right]);
//Event
var collisionStartEvent = function(e){
   for(var i=0;i<e.source.pairs.collisionStart.length; i++)
   {
           var coll = e.source.pairs.collisionStart[i];
           var groundId = ground.id;
           if(coll.bodyA.id == groundId || coll.bodyB.id == groundId)
           {
                   var calcObject = coll.bodyA.id != groundId ? coll.bodyA : coll.bodyB;
                   //console.log("CollObject : " + calcObject.id);
                   if(floatCompare(calcObject.angle,0))
                   {}
                   else if(floatCompare(calcObject.angle,0.5*Math.PI))
                   {}
                   else if(floatCompare(calcObject.angle,Math.PI))
                   {}
                   else if(floatCompare(calcObject.angle,1.5*Math.PI))
                   {}
           }
           else if(coll.bodyA.isStatic == false && coll.bodyB.isStatic == false)
           {
                    //console.log("CollObject : " + coll.bodyA.id + " with " + coll.bodyB.id);
           }

   }
};
Events.on(engine, "collisionStart", collisionStartEvent ); 
//Events.off(engine, "tick", tickevent );

Engine.run(engine);



/************************* 
** BOXs
*************************/

var myboxs = [];

function MyBox(size){
    this.body;
    this.health;
    this.memory;
    this.comprehension;  //認知
    this.logic;
    this.target;
    this.init = function() {
        this.body = Bodies.rectangle(400, 200, size, size);     
        World.add(engine.world, this.body);
        health = 10;
    };
    this.init();
    
    //function
    this.jump = function(force){
        if(isNaN(force))force=0.07;
            var init_x=force/2;
            var init_y=0;
            var x=Math.cos(this.body.angle)*Math.sqrt(init_x*init_x + init_y*init_y);
            var y=Math.sin(this.body.angle)*Math.sqrt(init_x*init_x + init_y*init_y);
            Body.applyForce(this.body, {x:0, y:0}, {x:x, y:y-force});
        }
    }

function addNewBox(){
    myboxs[myboxs.length]=new MyBox(50);
}

/************************* 
** SomeFucntion
*************************/
function floatCompare(a,b)
{
        if(Math.abs(a - b) < 0.1)
                return true;
        return false;
}

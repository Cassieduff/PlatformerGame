var actorChars = {
  "@": Player,
  "o": Coin,
  "E": Enemy,
  "=": Lava, "|": Lava, "v": Lava,
  'n': Picture,
  's': Shooter,
  'b': Bubble, 'd': Bubble 
  
};

function Level(plan){
	this.width = plan[0].length;
	this.height = plan.length;
	this.grid = [];
	this.actors = [];
	
	for(var y=0; y<this.height; y++){
		var line = plan[y];
		var gridLine = [];
		for(var x=0; x<this.width; x++){
			var ch = line[x];
			var fieldType = null;
			var Actor = actorChars[ch];
			 
           if (Actor)
			// Create a new actor at that grid position.
			this.actors.push(new Actor(new Vector(x, y), ch));

			else if (ch == "x")
				fieldType = 'wall';
			else if(ch =='e')
				fieldType = 'bad';
			else if(ch === '!')
				fieldType = 'lava';
			else if(ch === 'f')
				fieldType = 'fire';
			gridLine.push(fieldType);
		}
		this.grid.push(gridLine);
	} 
	 this.player = this.actors.filter(function(actor) {
       return actor.type == "player";
  })[0];
  //directly storing player object instead of the array of results that filter returns
}
Level.prototype.isFinished = function() {
  return this.status != null && this.finishDelay < 0;
};




function Vector(x, y) {
  this.x = x; this.y = y;
}

Vector.prototype.plus = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
};

Vector.prototype.times = function(factor) {
  return new Vector(this.x * factor, this.y * factor);
};

function Player(pos) {
  this.pos = pos.plus(new Vector(0, -0.5));
  this.size = new Vector(0.8, 1.5);
  this.speed = new Vector(0, 0);
}

Player.prototype.type = "player";

function Coin(pos) {
  this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
  this.size = new Vector(0.6, 0.6);
  // Make it go back and forth in a sine wave.
  this.wobble = Math.random() * Math.PI * 2;
}
Coin.prototype.type = "coin";

function Enemy(pos){
  this.pos = pos;
  this.size = new Vector(0.9, 1);
  this.speed = new Vector(3,0);
 
}
Enemy.prototype.type = "enemy";

function Lava(pos, ch) {
  this.pos = pos;
  this.size = new Vector(1, 1);
  if (ch == "=") {
    // Horizontal lava
    this.speed = new Vector(2, 0);
  } else if (ch == "|") {
    // Vertical lava
    this.speed = new Vector(0, 2);
  } else if (ch == "v") {
    // Drip lava. Repeat back to this pos.
    this.speed = new Vector(0, 3);
    this.repeatPos = pos;
  }
}
Lava.prototype.type = "lava";

function Picture(pos){
this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
this.wobble = Math.random() * Math.PI * 2;
this.size= new Vector(20,15);
}
Picture.prototype.type = 'picture';

function Shooter(pos){
this.pos=pos;
this.size= new Vector(0.5,0.5);
this.speed = new Vector(2,0);
this.repeatPos = pos;

}
Shooter.prototype.type= 'shooter';

function Bubble(pos, ch){
this.pos=pos;
this.size= new Vector(0.7,.5);

if(ch == 'b'){
	this.speed=new Vector(0,-3);
	this.repeatPos=pos;
}
else if(ch=='d'){
	this.speed= new Vector(0,3);
	this.repeatPos=pos;
}
}
Bubble.prototype.type='bubble';

function elt(name, className){
	var elt = document.createElement(name);
	if(className){
		elt.className = className;
	}
	return elt;
}
function DOMDisplay(parent, level) {
	this.wrap = parent.appendChild(elt('div','game'));
	this.level = level;
	
	this.wrap.appendChild(this.drawBackground());
	
	this.actorLayer = null;
    this.drawFrame();
}
var scale = 20;

DOMDisplay.prototype.drawActors = function() {
  
  var wrap = elt("div");
		this.level.actors.forEach(function(actor) {
		var rect = wrap.appendChild(elt("div",
                                    "actor " + actor.type));
									
   rect.style.width = actor.size.x * scale + "px";
    rect.style.height = actor.size.y * scale + "px";
    rect.style.left = actor.pos.x * scale + "px";
    rect.style.top = actor.pos.y * scale + "px";

  });
  
  return wrap;
};

DOMDisplay.prototype.drawBackground= function() {
	var table = elt('table', 'background');
	table.style.width = this.level.width * scale + 'px';
	
	this.level.grid.forEach(function(row){
		var rowElt = table.appendChild(elt('tr'));
		rowElt.style.height = scale + 'px';
		row.forEach(function(type){
			rowElt.appendChild(elt('td',type));
		});
	});
	return table;
};
DOMDisplay.prototype.drawFrame = function() {
  if (this.actorLayer)
    this.wrap.removeChild(this.actorLayer);
	this.actorLayer = this.wrap.appendChild(this.drawActors());
	this.wrap.className = "game " + (this.level.status || "");
	
	this.scrollPlayerIntoView();
};

DOMDisplay.prototype.scrollPlayerIntoView = function() {
  
  var width = this.wrap.clientWidth;
 
  var height = this.wrap.clientHeight;
  
  var margin = width / 3;

  var left = this.wrap.scrollLeft, right = left + width;
  var top = this.wrap.scrollTop, bottom = top + height;

  var player = this.level.player;
 
  var center = player.pos.plus(player.size.times(0.5))
                 .times(scale);

  if (center.x < left + margin)
		this.wrap.scrollLeft = center.x - margin;
	else if (center.x > right - margin)
		this.wrap.scrollLeft = center.x + margin - width;
  if (center.y < top + margin)
		this.wrap.scrollTop = center.y - margin;
	else if (center.y > bottom - margin)
		this.wrap.scrollTop = center.y + margin - height;
};

DOMDisplay.prototype.clear = function() {
  this.wrap.parentNode.removeChild(this.wrap);
};

Level.prototype.obstacleAt = function(pos, size) {
 
  var xStart = Math.floor(pos.x);

  var xEnd = Math.ceil(pos.x + size.x);
  
  var yStart = Math.floor(pos.y);

  var yEnd = Math.ceil(pos.y + size.y);

  
  if (xStart < 0 || xEnd > this.width || yStart < 0)
    return "wall";
	
  if (yEnd > this.height)
	return "lava";
  
  for (var y = yStart; y < yEnd; y++) {
    for (var x = xStart; x < xEnd; x++) {
      var fieldType = this.grid[y][x];
      if (fieldType) return fieldType;
    }
  }
};
//actor collision logic
Level.prototype.actorAt = function(actor) {
  // Loop over each actor in our actors list and compare the 
  // boundary boxes for overlaps.
  for (var i = 0; i < this.actors.length; i++) {
	  //making sure you don't collide with yourself, check against all other actors
    var other = this.actors[i];
    // if the other actor isn't the acting actor
    if (other != actor &&
        actor.pos.x + actor.size.x > other.pos.x &&
        actor.pos.x < other.pos.x + other.size.x &&
        actor.pos.y + actor.size.y > other.pos.y &&
        actor.pos.y < other.pos.y + other.size.y)
      // check if the boundaries overlap by comparing all sides for
      // overlap and return the other actor if found
      return other;
  }
};

Level.prototype.animate = function(step, keys) {  
 if (this.status != null)
    this.finishDelay -= step;
  while (step > 0) {
    var thisStep = Math.min(step, maxStep);
   this.actors.forEach(function(actor) {
      // Allow each actor to act on their surroundings
      actor.act(thisStep, this, keys);
    }, this);
    step -= thisStep;
  }
  
};

var maxStep = 0.05;
var wobbleSpeed = 8, wobbleDist = 0.07;
var moveSpeed=8, moveDist=0.07;

Coin.prototype.act = function(step) {
  this.wobble += step * wobbleSpeed;
  var wobblePos = Math.sin(this.wobble) * wobbleDist;
  this.pos = this.basePos.plus(new Vector(0, wobblePos));
};

Enemy.prototype.act=function(step, level) {
var newPos = this.pos.plus(this.speed.times(step));
	if(!level.obstacleAt(newPos, this.size))
    this.pos = newPos;
  
  else
    this.speed = this.speed.times(-1);
};
/* this.move += step * moveSpeed;
var movePos = this.move * moveDist;
var newPos = this.basePos.plus(new Vector(movePos,0));
if(!level.obstacleAt(newPos, this.size))
	this.pos = newPos;
else
	moveSpeed = moveSpeed*(-1);


}; */

Lava.prototype.act = function(step, level) {
  var newPos = this.pos.plus(this.speed.times(step));
  if (!level.obstacleAt(newPos, this.size))
    this.pos = newPos;
  else if (this.repeatPos)
    this.pos = this.repeatPos;
  else
    this.speed = this.speed.times(-1);
};

Shooter.prototype.act = function(step,level){

var newPos=this.pos.plus(this.speed.times(step));
if(!level.obstacleAt(newPos, this.size))
	this.pos = newPos;
else if(this.repeatPos)
	this.pos = this.repeatPos;
};

var maxStep = 0.05;
 var playerXSpeed = 7;
 
Picture.prototype.act = function(step){
	this.wobble += step * wobbleSpeed;
  var wobblePos = Math.sin(this.wobble) * wobbleDist;
  this.pos = this.basePos.plus(new Vector(0, wobblePos));
};

Bubble.prototype.act=function(step, level){
	var newPos=this.pos.plus(this.speed.times(step));
	if(!level.obstacleAt(newPos,this.size))
		this.pos = newPos;
	else if(this.repeatPos)
		this.pos=this.repeatPos;
	
	};

 Player.prototype.moveX = function(step, level, keys) {
   this.speed.x = 0;
   if (keys.left) this.speed.x -= playerXSpeed;
   if (keys.right) this.speed.x += playerXSpeed;

  var motion = new Vector(this.speed.x * step, 0);
  var newPos = this.pos.plus(motion);
  var obstacle = level.obstacleAt(newPos, this.size);

	
	 if (obstacle)
		level.playerTouched(obstacle);
   else
		this.pos=newPos;
		
 
 };
 
 //change these numbers for different mechanics-
var gravity = 30;
var jumpSpeed = 25;


Player.prototype.moveY = function(step, level, keys) {
   this.speed.y += step * gravity;
   var motion = new Vector(0, this.speed.y * step);
   var newPos = this.pos.plus(motion);
   var obstacle = level.obstacleAt(newPos, this.size);

   //change so they can't jump off of lava
   //you subtract jump speed in order to get closer to 0 in the y direction which is up
   //you add gravity to get closer to the bottom
  
	if(obstacle){
	level.playerTouched(obstacle);
	if (keys.up && this.speed.y > 0)
       this.speed.y = -jumpSpeed;
     else
       this.speed.y = 0;
	   }
  else {
    this.pos = newPos;
  }
  
};

Player.prototype.act = function(step, level, keys) {
  this.moveX(step, level, keys);
  this.moveY(step, level, keys);
  
  var otherActor = level.actorAt(this);
  if (otherActor)
    level.playerTouched(otherActor.type, otherActor);
	
	if (level.status == "lost") {
    this.pos.y += step;
    this.size.y -= step;
  }
};

//new logic goes down here everytime you make a new actor
Level.prototype.playerTouched = function(type, actor) {
 if (type == "lava" && this.status == null) {
    this.status = "lost";
    this.finishDelay = 1;
  }
  else if(type =='bad' && this.status==null){
    this.status = "lost";
    this.finishDelay = 1;
  }
else if(type == 'enemy' && this.status== null){
	this.status = "lost";
    this.finishDelay = 1;
}
else if(type == 'fire' && this.status== null){
	this.status = "lost";
	this.finishDelay = 1;
}
else if(type == 'shooter' && this.status==null) {
	this.status ="lost";
	this.finishDelay = 1;
}
else if(type == 'bubble' && this.status== null){
	this.status = "lost";
	this.finishDelay = 1;
}

  else if (type == "coin") {
    this.actors = this.actors.filter(function(other) {
      return other != actor;
	  
    });
	if (!this.actors.some(function(actor) {
           return actor.type == "coin";
         })) {
      this.status = "won";
      this.finishDelay = 1;
    }
	
  }
  
  
};
var arrowCodes = {37: "left", 38: "up", 39: "right"};


function trackKeys(codes) {
  var pressed = Object.create(null);

  function handler(event) {
    if (codes.hasOwnProperty(event.keyCode)) {
      
      var down = event.type == "keydown";
      pressed[codes[event.keyCode]] = down;
      event.preventDefault();
    }
  }
  addEventListener("keydown", handler);
  addEventListener("keyup", handler);
  return pressed;
}

function runAnimation(frameFunc) {
  var lastTime = null;
  function frame(time) {
    var stop = false;
    if (lastTime != null) {
    
      var timeStep = Math.min(time - lastTime, 100) / 1000;
      stop = frameFunc(timeStep) === false;
    }
    lastTime = time;
    if (!stop)
      requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

var arrows = trackKeys(arrowCodes);



function runLevel(level, Display, andThen){
	var display = new Display(document.body, level);
	
	runAnimation(function(step) {
    level.animate(step, arrows);
    display.drawFrame(step);
	if (level.isFinished()) {
      display.clear();
      if (andThen)
        andThen(level.status);
      return false;
    }
  });
}
function runGame(plans, Display){
	function startLevel(n){
		runLevel(new Level(plans[n]), Display, function(status) {
      if (status == "lost")
        startLevel(n);
      else if (n < plans.length - 1)
        startLevel(n + 1);
      else
        console.log("You win!");
    });
	}
	startLevel(0);
}








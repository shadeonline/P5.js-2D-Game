//Game Project
/*
In this game project, there are two main extensions I added. They are the improved graphics of the controllable character and the platforms. For the 
character, I improved the graphics by animating the walking motion of the character. The way I accomplish this task is to draw four frames of the character
in different postures for moving left and moving right. Then I compile them into two separate arrays, one for the moving left and one for moving right. 
So when I press the left button or the right button, it will display the four frames of the character in different posture one by one and repeat using 
"frameCount % the length of the array" to change the index of the array.

I also added platforms as a feature of my project. I managed to accomplish this by creating a variable FloorPos_Y, which defines where the character can 
stand. When the character is above the y coordinate of the platforms and on top of the platform, the FloorPos_Y will be changed to the Y position of the
platform. This will allow the character to stand on top of the platform.

One of the difficulties I faced in this project was that it was hard to find bugs. Sometimes there may be no error message, and the code runs without a hitch.
However, upon comprehensive testing, new bugs are discovered. These kind of bugs are hard to detect and solve as there are little to no clue as to why it 
occurs. Therefore to solve these bugs, I will recall the changes I made previously and check through them again. I also pick up the habit of commenting on 
my codes. This helps me greatly in pinpointing changes made when I come back to the code at a later point in time. It allows me to resolve bugs faster.

Overall, implementing different extensions help trained my debugging skills. Often things would not work as expected, but with meticulous checking, 
it is possible to resolve those bugs.

*/


var floorPos_y;
var groundPos_Y;
var state;
var shurikens = [];
var mc;
var trees = [];
var clouds = [];
var collectables = [];
var canyons = [];
var mountains = [];
var ground;
var stars = [];
var scrollPos;
var score;
var scoreDisplay = []
var flags = [];
var enemies = [];
var platforms = [];

function setup() {
	createCanvas(1024, 576);
	setupGameLvlOne();
}

function draw() {
	if (state == "startGame") {
		startScreen();
	}
	else if (state == "gameOn" && mc.lives > 0) {
		runGameLvlOne();
	}
	else if (state == "gameOver") {
		gameOverScreen();
	}
	else if (state == "levelComplete") {
		levelCompleteScreen();
	}
}





/*********************** Functions *****************************
*/

//Setup of position of all elements in the game
function setupGameLvlOne() {
	floorPos_y = 432;

	groundPos_Y = 432;

	score = new Score;
	scoreDisplay = [];

	scrollPos = 0;

	mc = new Mc;

	trees = [new Tree(300), new Tree(780), new Tree(990), new Tree(1385), new Tree(1550)];

	mountains = [new Mountain(-150), new Mountain(2200)];

	ground = new Ground(0, width);

	collectables = [new Collectible(500, groundPos_Y - 50, 1), new Collectible(800, groundPos_Y - 50, 1), new Collectible(900, groundPos_Y - 50, 1), new Collectible(1500, groundPos_Y - 50, 1), new Collectible(2200, groundPos_Y - 50, 1)];

	canyons = [new Canyon(400, 70), new Canyon(700, 70), new Canyon(900, 70), new Canyon(1030, 70), new Canyon(1300, 70), new Canyon(1450, 70)];

	flags = [new Flag(2550, 150)];

	enemies = [new Enemy(1500), new Enemy(700), new Enemy(1000), new Enemy(2000)];

	for (var i = 0; i < enemies.length; i++) {
		enemies[i].startEmitter(250, 100)
	}

	platforms = [new Platform(2200, 40, 100), new Platform(2300, 70, 100), new Platform(2400, 100, 100), new Platform(2500, 150, 100)];

	frameRate(30);

	state = "startGame";
}

//Initializing All ingame elements
function runGameLvlOne() {
	/*********************** Background ***********************
	*/
	background(20, 54, 66); //Blue Sky
	showStars(); //Stars
	ground.show(); //Ground
	//Start Translate
	push();
	translate(scrollPos, 0);
	/****************** Background elements ********************
	*/
	showMountains(); //mountains
	showTrees(); //trees
	showClouds(); //clouds
	/****************** Special objects Initializing ***********************
	*/
	canyonsInit(); //canyons
	flagInit(); //flag
	collectablesInit(); //collectables
	platformInit(); //platform
	enemiesInit(); //enemies
	pop();
	//End Translate
	shurikensInit();
	/************************ Stats *************************
	*/
	scoreAndHpInit();
	/****************** Main Character ***********************
	*/
	mcInit(); //Initiallizing Mc

}



/*********************** Special Objects Initializing *****************************
*/
//Initialize Enemies
function enemiesInit() {
	for (var i = 0; i < enemies.length; i++) {
		enemies[i].show();
		enemies[i].x = enemies[i].original + scrollPos;
		//Collision Variables
		//If MC touches enemy on the left 
		let contactLeft = (mc.x > (enemies[i].x + scrollPos - 30) && mc.x < (enemies[i].x + scrollPos)) && (mc.y > (enemies[i].y - 30) && (mc.y < enemies[i].y + 60));
		//If MC touches enemy on the right
		let contactRight = (mc.x < (enemies[i].x + scrollPos + 30) && mc.x > (enemies[i].x + scrollPos)) && (mc.y > (enemies[i].y - 30) && (mc.y < enemies[i].y + 60));
		if (contactLeft && !enemies[i].isDead) {
			//MC flinches left and minus 1 live
			mc.x -= 75;
			mc.y -= 50;
			mc.lives -= 1;

		} else if (contactRight && !enemies[i].isDead) {
			//MC flinches right and minus 1 live
			mc.x += 75;
			mc.y -= 50;
			mc.lives -= 1;
		}
	}
}


//Initialize Platform
function platformInit() {
	var anyContact = false;
	for (var i = 0; i < platforms.length; ++i) {
		platforms[i].show();
		platforms[i].x = platforms[i].original + scrollPos;
		//Collision Variable
		let contact = (mc.x > (platforms[i].x + scrollPos) && mc.x < (platforms[i].x + scrollPos + platforms[i].span)) && (mc.y <= platforms[i].y + 15);
		anyContact = contact || anyContact;
		if (contact) {
			//If MC touches platform change floor pos to platform's y pos
			floorPos_y = platforms[i].y;
		} else if (!anyContact) {
			//if not touching change back to normal
			floorPos_y = 432;
		}
	}
}


//Initialize Flag
function flagInit() {
	for (var i = 0; i < flags.length; ++i) {
		flags[i].x = flags[i].original + scrollPos;
		flags[i].show();
		if (flags[i].flagY == (flags[i].height)) {
			state = "levelComplete"
		}
		//Collision Variable
		var found = ((mc.x > flags[i].x - 50 + scrollPos) && (mc.x < flags[i].x + 50 + scrollPos) && (mc.y <= flags[i].base))
		if (found) {
			//If MC touch flag activate flag moving
			flags[i].isFound = true;
		}
	}
}


//Initialize Collectibles
function collectablesInit() {
	for (var i = 0; i < collectables.length; ++i) {
		collectables[i].x = collectables[i].original + scrollPos;
		collectables[i].show();
		//Collision Variable
		var collect = dist(collectables[i].x + scrollPos, collectables[i].y, mc.x, mc.y) <= 60;
		if (collect && collectables[i].isFound == false) {
			score.value += 1; //If MC touch collectibles add score
			scoreDisplay.push(new Collectible(30 + i * 80, 50, 0.5)) //Add star on top left of the screen
			collectables[i].isFound = true; //Make the collectible explode
		}
	}
}

//Initialize Canyons
function canyonsInit() {
	for (var i = 0; i < canyons.length; ++i) {
		canyons[i].show();
		canyons[i].x = canyons[i].original + scrollPos;
		//Collision Variable
		let fall = (mc.x > (canyons[i].x + scrollPos + 2) && mc.x < (canyons[i].x + scrollPos + canyons[i].span - 2)) && (mc.y >= canyons[i].y);
		if (fall) {
			mc.plummeting = true;
			mc.plumet();
			mc.j = 0;
		}
	}
}


//Initializing MC
function mcInit() {
	mc.show();
	if (mc.lives == 0) {
		state = "gameOver";
	}
}

//Initializing shurikens
function shurikensInit() {
	var keepShurikens = [];
	var anyhit = false;
	for (var i = 0; i < shurikens.length; i++) {
		shurikens[i].toMouse();
		for (var j = 0; j < enemies.length; j++) {
			//Collision Variable
			let hit = (dist(shurikens[i].x, shurikens[i].y, enemies[j].x + scrollPos, enemies[j].y) <= 30) && !enemies[j].isDead;
			anyhit = anyhit || hit;

			if (hit) {
				enemies[j].health -= 10; //Minus enemy health
				if (enemies[j].health == 0) {
					enemies[j].isDead = true; //trigger enemy explosion when enemy hp is 0
				}
			}
		}

		//If shuriken go off the screen, it stops working
		if (shurikens[i].onScreen() && !anyhit) {
			keepShurikens.push(shurikens[i]);
			shurikens[i].show();
		}
	}
	shurikens = keepShurikens;
}

/*********************** Background Elements *****************************
*/
//Mountains
function showMountains() {
	for (var i = 0; i < mountains.length; ++i) {
		mountains[i].show();
		mountains[i].x = mountains[i].original + scrollPos;
	}
	return i;
}

// Trees
function showTrees() {
	for (var i = 0; i < trees.length; ++i) {
		trees[i].show();
		trees[i].x = trees[i].original + scrollPos;
	}
}

// Clouds
function showClouds() {
	for (var i = 0; i < 25; ++i) {
		clouds.push(new Cloud(random(-width, 2 * width), random(30, 200), random(0.5, 1)));
		clouds[i].show();
		clouds[i].move();

		if (clouds[i].x > width + 1000) {
			clouds[i].x = -width;
		}
	}
}

// Hearts
function heart(x, y) {
	fill(200, 0, 0);
	noStroke();
	triangle(x, y, x + 50, y, x + 25, y + 27);
	arc((x + 14), y, 27, 27, PI, 0);
	arc((x + 36), y, 27, 27, PI, 0);
}

//Twinkling Stars
function showStars() {
	for (var i = 0; i < 10; i++) {
		stars[i] = new Star();
	}
	for (var i = 0; i < stars.length; i++) {
		stars[i].show();
	}
}

//Status of MC (number of lives left and number of stars collected)
function scoreAndHpInit() {
	for (var i = 0; i < scoreDisplay.length; i++) {
		scoreDisplay[i].show();
	}
	for (var i = 0; i < mc.lives; i++) {
		heart(width - 250 + i * 60, 50, 0.5);
	}
}




/*********************** State of game *****************************
*/
//Start Screen
function startScreen() {
	background(0);
	fill(255);
	textSize(70);
	textAlign(CENTER);
	text("Welcome to Game Project!", width / 2, height / 3)
	textSize(50);
	text("WASD to move and Left Click to shoot", width / 2, 0.60 * height)
	text("Press Space to Start", width / 2, 0.75 * height)

	if (keyIsDown(32)) {
		state = "gameOn"; //press space and state of game will change
	}
}
//Game Over screen
function gameOverScreen() {
	background(0);
	fill(255);
	textSize(100);
	textAlign(CENTER);
	text("Game Over", width / 2, height / 2);
	textSize(50);
	text("Press Space to restart", width / 2, 0.75 * height);

	if (keyIsDown(32)) {
		setupGameLvlOne(); //press space and state of game will change
	}
}
// Complete level screen
function levelCompleteScreen() {
	background(0);
	fill(255);
	textSize(100);
	textAlign(CENTER);
	text("Level Complete!", width / 2, height / 2);
}


/************************* Classes ****************************
*/
//Controllable character
class Mc {
	constructor() {
		this.x = 200;
		this.y = floorPos_y;
		this.j = 1; //Number of jumps MC can make
		this.moveSpeed = 10; //Movespeed
		this.jumpSpeed = 0; //To be changed when MC jumps 
		this.plummeting = false; //State of character, display fall version of character
		this.isLeft = false; //State of character, display left version of character
		this.isRight = false; //State of character, display right version of character
		this.isFalling = false; //State of character, display falling version of character
		this.movingRight = [this.moveRightOne, this.moveRightTwo, this.moveRightThree, this.moveRightFour]; //Array containing frames of character movement
		this.movingLeft = [this.moveLeftOne, this.moveLeftTwo, this.moveLeftThree, this.moveLeftFour]; //Array containing frames of character movement
		this.gunFire_x = undefined; //x Coordinate of where shuriken shoot from
		this.gunFire_y = undefined; //y Coordinate of where shuriken shoot from
		this.lives = 3; //Number of lives MC has
		this.colour = 0;
		this.disappear = 255;
	}

	show() {
		this.movePlayer();
		//Offset jumpspeed from mc's y coordinate, jumpspeed will be -10 upon pressing 'w', this means mc's will move up at the speed of 10.
		//Once MC is above ground, mc.gravity function will make jumpspeed increase at the rate of 1, MC's speed of moving up will decrease at rate of 1
		//Jumpspeed will continue increasing and MC will stop moving upwards eventually and drop to the ground, then reset jumpspeed to 0.
		this.jumpReset();
		this.gravity();
		this.y += this.jumpSpeed;

		//If MC fall out of map with life left then respawn
		this.respawn();


		//Jumping Left
		if (this.isLeft && this.isFalling) {
			fill(this.colour, 0, 0, this.disappear)
			stroke(this.colour, 0, 0, this.disappear)
			//head
			ellipse(this.x - 3, this.y - 55, 20, 20);
			//torso
			line(this.x - 2, this.y - 55, this.x, this.y - 25);
			//legs	
			beginShape(LINES);
			vertex(this.x, this.y - 25);
			vertex(this.x + 8, this.y - 12);
			vertex(this.x + 8, this.y - 12);
			vertex(this.x + 23, this.y)
			endShape();
			beginShape(LINES);
			vertex(this.x, this.y - 25);
			vertex(this.x - 15, this.y - 20);
			vertex(this.x - 15, this.y - 20);
			vertex(this.x - 19, this.y)
			endShape();
			//arms(hand)
			line(this.x, this.y - 46, this.x + 23, this.y - 40)
			this.gunArm(this.x, this.y - 46)
		}

		//Jumping Right
		else if (this.isRight && this.isFalling) {
			//jumping-right
			//head
			fill(this.colour, 0, 0, this.disappear)
			stroke(this.colour, 0, 0, this.disappear)
			ellipse(this.x + 3, this.y - 55, 20, 20);
			//torso
			line(this.x + 2, this.y - 55, this.x, this.y - 25);
			//legs
			beginShape(LINES);
			vertex(this.x, this.y - 25);
			vertex(this.x - 8, this.y - 12);
			vertex(this.x - 8, this.y - 12);
			vertex(this.x - 23, this.y);
			endShape();
			beginShape(LINES);
			vertex(this.x, this.y - 25);
			vertex(this.x + 15, this.y - 20);
			vertex(this.x + 15, this.y - 20);
			vertex(this.x + 19, this.y)
			endShape();
			//arms(hand)
			line(this.x, this.y - 46, this.x - 23, this.y - 40)
			this.gunArm(this.x, this.y - 46)

		}

		//Walking Left
		else if (this.isLeft && !this.plummeting) {
			fill(this.colour, 0, 0, this.disappear);
			stroke(this.colour, 0, 0, this.disappear);
			const numMoveLeft = this.movingLeft.length;
			var currentLeft = frameCount % numMoveLeft;
			this.movingLeft[currentLeft](this.x, this.y); //Scroll through the array of moving right and display each frame
			this.gunArm(this.x - 2, this.y - 55);
		}

		//Walking Right
		else if (this.isRight && !this.plummeting) {
			fill(this.colour, 0, 0, this.disappear);
			stroke(this.colour, 0, 0, this.disappear);
			const numMoveRight = this.movingRight.length;
			var currentRight = frameCount % numMoveRight;
			this.movingRight[currentRight](this.x, this.y); //Scroll through the array of moving left and display each frame
			this.gunArm(this.x + 2, this.y - 55);

		}

		//Jumping Up/Falling
		else if (this.isFalling || this.plummeting) {
			//jumping facing forwards
			fill(this.colour, 0, 0, this.disappear);
			stroke(this.colour, 0, 0, this.disappear);
			ellipse(this.x, this.y - 45, 20, 20);
			//torso
			line(this.x, this.y - 35, this.x, this.y - 10);
			//legs	
			beginShape(LINES);
			vertex(this.x, this.y - 10);
			vertex(this.x - 15, this.y - 25);
			vertex(this.x - 15, this.y - 25);
			vertex(this.x - 18, this.y)
			endShape();
			beginShape(LINES);
			vertex(this.x, this.y - 10);
			vertex(this.x + 15, this.y - 25);
			vertex(this.x + 15, this.y - 25);
			vertex(this.x + 18, this.y);
			endShape();
			//arms(right hand)
			line(this.x, this.y - 40, this.x - 23, this.y - 65);
			this.gunArm(this.x, this.y - 40);
		}

		//Neutral Stance
		else {
			//Standing neutral
			//head
			fill(this.colour, 0, 0, this.disappear);
			stroke(this.colour, 0, 0, this.disappear);
			ellipse(this.x, this.y - 65, 20, 20);
			//Torso
			line(this.x, this.y - 65, this.x, this.y - 30);
			//legs
			line(this.x, this.y - 30, this.x + 5, this.y);
			line(this.x, this.y - 30, this.x - 5, this.y);
			//arms
			line(this.x, this.y - 55, this.x - 5, this.y - 25);
			this.gunArm(this.x, this.y - 55);
		}
	}
	movePlayer() {
		//up(W)
		if (keyIsDown(87) && this.j == 1) {
			this.jumpSpeed = -10; //Make character Jump with a speed of -10, to be offset from MC's y coordinate
			this.j--; //Mc's number of Jump minus 1
		}
		if (this.y < floorPos_y) {
			this.isFalling = true; //If above show falling version of chara
		}
		else {
			this.isFalling = false; //reset back to normal once mc is on ground
		}

		//left(A)
		if (keyIsDown(65) && !this.plummeting) {
			this.isLeft = true;
			if (this.x > width * 0.15) {
				this.x -= this.moveSpeed; //Make character move left on keypress A
			} else {
				scrollPos = min(scrollPos += this.moveSpeed, 150); //Scroll game to the left
			}
		} else {
			this.isLeft = false;
		}


		//right(D)
		if (keyIsDown(68) && !this.plummeting) {
			this.isRight = true;
			if (this.x < width * 0.6) {
				this.x += this.moveSpeed; //Make Character move Right on keypress d
			} else {
				scrollPos = max(scrollPos -= this.moveSpeed, -1000); //Scroll Game to the right
			}

		} else {
			this.isRight = false;
		}
	}
	gravity() {
		if (this.y > floorPos_y && !this.plummeting) {
			this.y = floorPos_y //if the fall makes the mc sink into the ground and mc is not plummeting into a trap, it will make mc go back to groundpos
			this.jumpSpeed = 0; //change jumpSpeed back to 0 so that mc do not stop sinking
		} else if (this.y < floorPos_y) {
			this.jumpSpeed += 1; //Jumpspeed will progressively increase, this means MC will fall faster and faster.
		}
	}
	jumpReset() {
		if (this.y == floorPos_y && !keyIsDown(87)) {
			this.j = 1; //reset the amount of times MC can jump once it touches ground
		}
	}
	plumet() {
		this.y += 20; //Mc plummet in a trap
		this.moveSpeed = 0; //MC cant move in trap
		this.j = 0 //Mc cant jump in trap
	}
	respawn() {
		if (this.y > height + 300 && this.lives > 0 && this.plummeting == true) {
			this.lives--;
			this.plummeting = false;
			this.x = 200;
			scrollPos = 0;
			this.y = floorPos_y;
			this.moveSpeed = 10;
		}
	}


	moveRightOne(x, y) {
		ellipse(x + 3, y - 65, 20, 20);
		line(x + 3, y - 65, x, y - 30);
		//legs
		line(x, y - 30, x + 4, y);
		beginShape(LINES);
		vertex(x, y - 30);
		vertex(x - 2, y - 12);
		vertex(x - 2, y - 12);
		vertex(x - 9, y - 2);
		endShape();
		//arms
		line(x + 2, y - 55, x - 5, y - 25);

	}
	moveRightTwo(x, y) {
		ellipse(x + 3, y - 65, 20, 20);
		line(x + 3, y - 65, x, y - 30);
		//legs
		line(x, y - 30, x + 1, y);
		beginShape(LINES);
		vertex(x, y - 30);
		vertex(x + 1, y - 14);
		vertex(x + 1, y - 14);
		vertex(x - 6, y - 4);
		endShape();
		//arms
		line(x + 2, y - 55, x - 5, y - 25);
	}
	moveRightThree(x, y) {
		ellipse(x + 3, y - 65, 20, 20);
		line(x + 3, y - 65, x, y - 30);

		//legs
		beginShape(LINES);
		vertex(x, y - 30);
		vertex(x, y - 14);
		vertex(x, y - 14);
		vertex(x - 3, y);
		endShape();
		beginShape(LINES);
		vertex(x, y - 30);
		vertex(x + 3, y - 16);
		vertex(x + 3, y - 16);
		vertex(x + 4, y - 2);
		endShape();
		//arms
		line(x + 2, y - 55, x - 5, y - 25)

	}
	moveRightFour(x, y) {
		ellipse(x + 3, y - 65, 20, 20);
		line(x + 3, y - 65, x, y - 30);
		//legs
		beginShape(LINES);
		vertex(x, y - 30);
		vertex(x + 7, y - 15);
		vertex(x + 7, y - 15);
		vertex(x + 10, y)
		endShape();
		beginShape(LINES);
		vertex(x, y - 30);
		vertex(x - 2, y - 12);
		vertex(x - 2, y - 12);
		vertex(x - 8, y);
		endShape();
		//arms

		line(x + 2, y - 55, x - 5, y - 25)

	}
	moveLeftOne(x, y) {
		ellipse(x - 3, y - 65, 20, 20);
		line(x - 3, y - 65, x, y - 30);

		//legs
		beginShape(LINES);
		vertex(x, y - 30);
		vertex(x - 7, y - 15);
		vertex(x - 7, y - 15);
		vertex(x - 10, y);
		endShape();
		beginShape(LINES);
		vertex(x, y - 30);
		vertex(x + 2, y - 12);
		vertex(x + 2, y - 12);
		vertex(x + 8, y);
		endShape();

		//arms
		line(x - 2, y - 55, x + 5, y - 25);

	}
	moveLeftTwo(x, y) {
		ellipse(x - 3, y - 65, 20, 20);
		line(x - 3, y - 65, x, y - 30);

		//legs
		line(x, y - 30, x - 4, y);
		beginShape(LINES);
		vertex(x, y - 30);
		vertex(x + 2, y - 12);
		vertex(x + 2, y - 12);
		vertex(x + 9, y - 2);
		endShape();
		//arms

		line(x - 2, y - 55, x + 5, y - 25)

	}
	moveLeftThree(x, y) {
		ellipse(x - 3, y - 65, 20, 20);
		line(x - 3, y - 65, x, y - 30);

		//legs
		line(x, y - 30, x - 1, y);
		beginShape(LINES);
		vertex(x, y - 30);
		vertex(x - 1, y - 14);
		vertex(x - 1, y - 14);
		vertex(x + 6, y - 4);
		endShape();
		//arms

		line(x - 2, y - 55, x + 5, y - 25)

	}
	moveLeftFour(x, y) {
		ellipse(x - 3, y - 65, 20, 20);
		line(x - 3, y - 65, x, y - 30);

		//legs
		beginShape(LINES);
		vertex(x, y - 30);
		vertex(x, y - 14);
		vertex(x, y - 14);
		vertex(x + 3, y);
		endShape();
		beginShape(LINES);
		vertex(x, y - 30);
		vertex(x - 3, y - 16);
		vertex(x - 3, y - 16);
		vertex(x - 4, y - 2);
		endShape();

		//arms
		line(x - 2, y - 55, x + 5, y - 25)

	}
	gunArm(pos_x, pos_y) {
		var v0 = createVector(pos_x, pos_y)
		var v1 = createVector(mouseX, mouseY);
		var arm = v1.sub(v0).normalize().mult(31).add(v0);
		line(v0.x, v0.y, arm.x, arm.y); //Create an arm that rotates according to mouse pos
		this.gunFire_x = arm.x; //Shot fired from end of arm
		this.gunFire_y = arm.y; //Shot fired from end of arm
	}
}

//Tree background
class Tree {
	constructor(pos_x) {
		this.x = pos_x;
		this.y = groundPos_Y - 72;
		this.original = this.x
	}
	show() {
		noStroke()
		//trunk
		fill(179, 156, 77);
		rect(this.x, this.y, 10, 72);

		//branch
		fill(96, 119, 68)
		ellipse(this.x + 5, this.y - 25, 50);
		fill(118, 137, 72, 250);
		ellipse(this.x - 10, this.y, 50);
		fill(52, 98, 63, 250);
		ellipse(this.x + 20, this.y - 5, 50);
	}
}

//Clouds on background that moves across the sky slowly
class Cloud {
	constructor(pos_x, pos_y, size) {
		this.x = pos_x;
		this.y = pos_y;
		this.original = this.x
		this.size = size
	}
	show() {
		//Drawing of cloud
		noStroke();
		fill(241, 250, 238);
		ellipse(this.x * this.size, this.y * this.size, 70 * this.size, 60 * this.size);
		ellipse((this.x - 30) * this.size, (this.y + 5) * this.size, 50 * this.size, 40 * this.size);
		ellipse((this.x + 30) * this.size, (this.y + 5) * this.size, 50 * this.size, 40 * this.size);
		ellipse((this.x - 55) * this.size, (this.y + 10) * this.size, 30 * this.size, 20 * this.size);
		ellipse((this.x + 55) * this.size, (this.y + 10) * this.size, 30 * this.size, 20 * this.size);
	}
	move() {
		this.x += random(0, 1) //Cloud move at a random speed
	}
}

//Collectable yellow stars
class Collectible {
	constructor(pos_x, pos_y, size) {
		this.x = pos_x;
		this.y = pos_y;
		this.original = this.x
		this.size = size;
		this.isFound = false;
		this.disappear = 255

	}
	show() {
		if (!this.isFound) {
			fill(252, 163, 17, this.disappear);
			beginShape();
			vertex(this.x * this.size, this.y * this.size);
			vertex((this.x + 10) * this.size, (this.y + 25) * this.size);
			vertex((this.x + 20) * this.size, this.y * this.size);
			vertex((this.x + 45) * this.size, (this.y - 10) * this.size);
			vertex((this.x + 20) * this.size, (this.y - 18) * this.size);
			vertex((this.x + 10) * this.size, (this.y - 45) * this.size);
			vertex(this.x * this.size, (this.y - 18) * this.size);
			vertex((this.x - 25) * this.size, (this.y - 10) * this.size);
			endShape();
		} else if (this.isFound) {
			//Exploding animation
			fill(252, 163, 17, this.disappear) //this.disappear will decrease and circle will fade
			ellipse(this.x, this.y, this.size, this.size); //size will increase slowly
			this.size = min(this.size += 50, 500); //increase size slowly
			this.disappear = max(this.disappear -= 20, 0); //make explosion transparent slowly

		}
	}

	reset() {
		if (this.size > 1000) {
			this.isFound = false //Reset it so that it become orignal size, and still transparent, this is so that it wont keep expanding and cause lag
		}
	}
}

//Mountain background
class Mountain {
	constructor(pos_x) {
		this.x = pos_x;
		this.y = groundPos_Y;
		this.original = pos_x;
	}
	show() {
		fill(92, 77, 60);
		//light mountains
		triangle(this.x + 100, this.y - 172, this.x - 100, this.y, this.x + 300, this.y)
		triangle(this.x + 160, this.y - 152, this.x - 100, this.y, this.x + 300, this.y)
		triangle(this.x - 170, this.y - 152, this.x - 550, this.y, this.x + 100, this.y)
		//dark mountain
		fill(129, 88, 57)
		triangle(this.x + 300, this.y - 112, this.x - 50, this.y, this.x + 500, this.y)
		triangle(this.x + 250, this.y - 112, this.x - 50, this.y, this.x + 500, this.y)
		triangle(this.x, this.y - 172, this.x - 250, this.y, this.x + 300, this.y)
		triangle(this.x - 250, this.y - 150, this.x - 600, this.y, this.x, this.y)
	}
}

//Canyon death traps
class Canyon {
	constructor(pos_x, span) {
		this.x = pos_x;
		this.y = groundPos_Y;
		this.span = span;
		this.original = this.x
	}
	show() {
		//Drawing of canyon
		fill(3, 4, 94);
		rect(this.x, this.y, this.span, height);
		fill(20, 54, 66)
		rect(this.x, this.y, this.span, 90);
	}
}

//Flag, the objective of the game
class Flag {
	constructor(pos_x, pos_y) {
		this.x = pos_x;
		this.height = groundPos_Y - pos_y - 200;
		this.base = groundPos_Y - pos_y;
		this.flagY = groundPos_Y - pos_y - 60
		this.original = this.x
		this.isFound = false //Change to true if MC comes close to the flagpole
	}
	show() {
		stroke(231, 236, 239);
		line(this.x, this.height, this.x, this.base);
		noStroke()
		fill(154, 3, 30);
		rect(this.x, this.flagY, 60, 50)
		if (this.isFound) {
			this.flagY = max(this.flagY -= 7, this.height) //The flag will move up slowly of the flag pole is touched
		}
	}
}

//Green patch of grass on gound
class Ground {
	constructor(pos_x, span) {
		this.x = pos_x;
		this.y = 432;
		this.span = span; //length of Ground
	}
	show() {
		//Drawing of ground
		noStroke();
		fill(0, 114, 0);
		rect(this.x, this.y, this.span, height);
	}
}

//Star Background
class Star {
	constructor() {
		this.x = random(0, width);
		this.y = random(0, height);
		this.size = random(0.25, 3);
		this.t = random(TAU);
	}
	show() {
		//Drawing of Stars
		this.t += 0.1;
		var scale = this.size + sin(this.t) * 2;
		noStroke();
		fill(255)
		rect(this.x, this.y, scale, scale);
	}
}

//Score class used to calculate score of player
class Score {
	constructor() {
		this.value = 0; //Add one whenever player collect a star
	}
	show() {
		fill(255, 149, 0);
		text(this.value, 25, 25, 300, 300); //Show numerical value of score
	}
}

//Shoot when mouse click used to kill enemies
class Shuriken {
	constructor(pos_x, pos_y, PX, PY) {
		this.speed = 50;
		this.x = PX;
		this.original = this.x;
		this.y = PY;
		this.dir = createVector(pos_x - PX, pos_y - PY).normalize() //Shoot shuriken in the direction of mouse point
		this.r = 5;
		this.randomSpin = Math.random() < 0.5; //Generate a random boolean for a random spin 
	}
	show() {
		if (this.randomSpin) {
			//Spin allign 1
			fill(0);
			noStroke;
			beginShape();
			vertex(this.x, this.y - 10);
			vertex((this.x + 2.2), (this.y - 2.2));
			vertex((this.x + 10), this.y);
			vertex((this.x + 2.2), (this.y + 2.2));
			vertex((this.x), (this.y + 10));
			vertex((this.x - 2.2), (this.y + 2.2));
			vertex(this.x - 10, this.y);
			vertex((this.x - 2.2), (this.y - 2.2));
			endShape();
		} else {
			//Spin allign 2
			fill(0);
			noStroke;
			beginShape();
			vertex(this.x - 8, this.y - 8);
			vertex(this.x, this.y - 3);
			vertex(this.x + 8, this.y - 8);
			vertex(this.x + 3, this.y);
			vertex(this.x + 8, this.y + 8);
			vertex(this.x, this.y + 3);
			vertex(this.x - 8, this.y + 8);
			vertex(this.x - 3, this.y);
			endShape();
		}

	}
	toMouse() {
		this.x += this.dir.x * this.speed; //Send shuriken to mouseX
		this.y += this.dir.y * this.speed; //Send shuriken to mouseY

	}
	onScreen() {
		return this.x > -this.r && this.x < width + this.r && this.y > -this.r && this.y < height + this.r; //check if shuriken is on screen
	}

}


//Burning flames of fire that will burn mc on touch
class Enemy {
	constructor(pos_x) {
		this.x = pos_x;
		this.y = groundPos_Y - 50;
		this.original = this.x
		this.startPos = this.x;


		this.xSpeed = 0;
		this.ySpeed = -1;
		this.size = 30;
		this.colour = color(204, 0, 204, 50);
		this.particles = [];
		this.startParticles = 0;
		this.lifetime = 0


		this.isDead = false;
		this.health = 50; //if health = 0 then explode
		this.range = 400; //range of movement
		this.moveSpeed = this.getRandomDir(); //moveSpeed either 5 or -5 on random
		this.fade = 255;  //used in explosion to make circle fade away
	}



	show() {
		if (!this.isDead) {
			//If enemy is not dead
			this.original += this.moveSpeed; //Move 
			this.drawAndUpdateParticles() //show drawing of enemy
			this.moveRange(); //Move within range, once enemy reach edge of range, direction will change
			this.healthBar(); //Health bar that will decrease upon hit by bullets

		} else if (this.isDead) {
			//Exploding animation
			fill(204, 0, 204, this.fade)
			ellipse(this.x, this.y, this.size, this.size);
			this.size = min(this.size += 50, 500);
			this.fade = max(this.fade -= 20, 0);
		}
	}

	healthBar() {
		let hp = map(this.health, 0, 50, 5, 100);
		fill(250, 0, 0)
		rect(this.x - 50, this.y - 60, hp, 10);
	}


	startEmitter(startParticles, lifetime) {
		this.startParticles = startParticles;
		this.lifetime = lifetime;


		for (var i = 0; i < this.startParticles; i++) {
			this.particles.push(this.createNewParticles())
		}

	}

	createNewParticles() {
		var xPos = random(this.x - 10, this.x + 10)
		var yPos = random(this.y - 10, this.y + 10)
		var xSpeed = random(this.xSpeed - 1, this.xSpeed + 1)

		var ySpeed = random(this.ySpeed - 1, this.ySpeed + 1)

		var p = new Particle(xPos, yPos, xSpeed, ySpeed, this.size, this.colour);

		return (p)


	}


	drawAndUpdateParticles() {
		var deadParticleCount = 0
		for (var i = this.particles.length - 1; i > 0; i--) {
			this.particles[i].show();
			this.particles[i].updateParticle();

			if (this.particles[i].age > random(0, this.lifetime)) {
				this.particles.splice(i, 1);
				deadParticleCount++;
			}
		}
		if (deadParticleCount > 0) {
			for (var i = 0; i < deadParticleCount; i++) {
				var p = this.createNewParticles();
				this.particles.push(p)
			}
		}
	}

	moveRange() {
		if (this.original >= this.startPos + this.range) {
			this.moveSpeed = -(this.moveSpeed);
		} else if (this.original <= this.startPos - this.range) {
			this.moveSpeed = -(this.moveSpeed);
		}
	}

	getRandomDir() {
		var random_dir = Math.random() < 0.5;
		if (random_dir) {
			return (-5)
		} else {
			return (5)
		}
	}


}

//Flame particles
class Particle {
	constructor(xPos, yPos, xSpeed, ySpeed, size, colour) {

		this.x = xPos;
		this.y = yPos;
		this.xSpeed = xSpeed;
		this.ySpeed = ySpeed;
		this.size = size;
		this.colour = colour;
		this.age = 0;

	}

	show() {
		noStroke();
		fill(this.colour)
		ellipse(this.x, this.y, this.size)
	}

	updateParticle() {
		this.x += this.xSpeed;
		this.y += this.ySpeed;
		this.age++
	}

}

//Platform that mc can stand on
class Platform {
	constructor(pos_x, height, span) {
		this.x = pos_x;
		this.original = this.x;
		this.y = groundPos_Y - height;
		this.span = span;
	}

	show() {
		//Drawing of Platforms
		fill(0, 114, 0);
		rect(this.x, this.y, this.span, 10)
	}
}


/************************* Shooting Shuriken ****************************
*/

function mousePressed() {
	if (dist(mouseX, mouseY, mc.x, mc.y - 55) > 32 && state == "gameOn") {
		shurikens.push(new Shuriken(mouseX, mouseY, mc.gunFire_x, mc.gunFire_y)); //Push new shrikens into the shurikens array
	}
}



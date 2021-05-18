var enemyList = {};
var upgradeList = {};
var bulletList = {};
var player;
Entity = function (type, id, x, y, spdX, spdY, width, height, color) {
	var self = {
		type: type,
		id: id,
		x: x,
		y: y,
		spdX: spdX,
		spdY: spdY,
		width: width,
		height: height,
		color,
	};
	self.update = function () {
		self.updatePosition();
		self.draw();
	};
	self.draw = function () {
		ctx.save();
		ctx.fillStyle = self.color;
		ctx.fillRect(
			self.x - self.width / 2,
			self.y - self.height / 2,
			self.width,
			self.height
		);
		ctx.restore();
	};
	self.getDistance = function (entity2) {
		var vx = self.x - entity2.x;
		var vy = self.y - entity2.y;
		return Math.sqrt(vx * vx + vy * vy);
	};

	self.testCollision = function (entity2) {
		var rect1 = {
			x: self.x - self.width / 2,
			y: self.y - self.height / 2,
			width: self.width,
			height: self.height,
		};
		var rect2 = {
			x: entity2.x - entity2.width / 2,
			y: entity2.y - entity2.height / 2,
			width: entity2.width,
			height: entity2.height,
		};
		return testCollisionRectRect(rect1, rect2);
	};
	self.updatePosition = function () {
		self.x += self.spdX;
		self.y += self.spdY;

		if (self.x < 0 || self.x > WIDTH) {
			self.spdX = -self.spdX;
		}
		if (self.y < 0 || self.y > HEIGHT) {
			self.spdY = -self.spdY;
		}
	};

	self.update();
	return self;
};
//player

player = function () {
	var self = Actor("player", "myid", 50, 40, 30, 5, 20, 20, "green", 10, 1);
	(self.pressingUp = false),
		(self.pressingDown = false),
		(self.pressingLeft = false),
		(self.pressingRight = false);

	self.updatePosition = function () {
		if (player.pressingRight) player.x += 10;
		if (player.pressingLeft) player.x -= 10;
		if (player.pressingDown) player.y += 10;
		if (player.pressingUp) player.y -= 10;

		//isPositionValidself.updatePosition
		if (player.x < player.width / 2) player.x = player.width / 2;
		if (player.x > WIDTH - player.width / 2)
			player.x = WIDTH - player.width / 2;

		if (player.y < player.height / 2) player.y = player.height / 2;
		if (player.y > HEIGHT - player.height / 2)
			player.y = HEIGHT - player.height / 2;
	};

	var super_update = self.update;
	self.update = function () {
		super_update();
		if (self.hp <= 0) {
			var timeSurvived = Date.now() - timeWhenGameStarted;
			console.log("You lost! You survived for " + timeSurvived + "ms");
			startNewGame();
		}
	};

	return self;
};

Actor = function (
	type,
	id,
	x,
	spdX,
	y,
	spdY,
	width,
	height,
	color,
	hp,
	atkSpd
) {
	var self = Entity(type, id, x, y, spdX, spdY, width, height, color);
	(self.hp = hp),
		(self.atkSpd = atkSpd),
		(self.attackCounter = 0),
		(self.aimAngle = 0);

	var super_update = self.update;
	self.update = function () {
		super_update();
		self.attackCounter += self.atkSpd;
	};

	self.performAttack = function (self) {
		if (self.attackCounter > 25) {
			generateBullets(self);
			self.attackCounter = 0;
		}
	};

	self.performSpecialAttack = function (self) {
		if (self.attackCounter > 1) {
			/*for(angle = 0; angle <= 360; angle ++){
                    generateBullets(self,angle);
                }*/

			generateBullets(self, self.aimAngle - 5);
			generateBullets(self, self.aimAngle);
			generateBullets(self, self.aimAngle + 5);

			self.attackCounter = 0;
		}
	};

	return self;
};

Enemy = function (id, x, spdX, y, spdY, width, height) {
	var self = Entity("enemy", id, x, y, spdX, spdY, width, height, "red", 10, 1);

	var super_update = self.update;
	self.update = function () {
		super_update();
		var isColliding = player.testCollision(self);

		if (isColliding) {
			player.hp = player.hp - 1;
		}
	};
	enemyList[id] = self;
};

upgrade = function (id, x, spdX, y, spdY, width, height, category, color) {
	var self = Entity("upgrade", id, x, y, spdX, spdY, width, height, color);

	super_update = self.update;
	self.update = function () {
		super_update();
		var isColliding = player.testCollision(self);

		if (isColliding) {
			if (self.category === "score") {
				score += 1000;
			}
			if (self.category === "atkSpd") {
				player.atkSpd += 3;
			}
			delete upgradeList[self.id];
		}
	};
	self.category = category;
	upgradeList[id] = self;
};

Bullet = function (id, x, spdX, y, spdY, width, height) {
	var self = Entity("enemy", id, x, y, spdX, spdY, width, height, "black");
	self.timer = 0;

	var super_update = self.update;
	self.update = function () {
		super_update();
		var toRemove = false;
		self.timer++;

		if (self.timer > 75) {
			toRemove = true;
		}

		for (var key2 in enemyList) {
			/*var isColliding = self.testCollision(enemyList[key2]);

            if(isColliding){
                delete bulletList[key]
                delete enemyList[key2];
                break;
            }*/
		}
		if (toRemove) {
			delete bulletList[self.id];
		}
	};
	bulletList[id] = self;
};

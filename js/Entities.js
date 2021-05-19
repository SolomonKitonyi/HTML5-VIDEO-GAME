var enemyList = {};
var upgradeList = {};
var bulletList = {};
var player;
Entity = function (type, id, x, y, spdX, spdY, width, height, img) {
	var self = {
		type: type,
		id: id,
		x: x,
		y: y,
		spdX: spdX,
		spdY: spdY,
		width: width,
		height: height,
		img,
	};
	self.update = function () {
		self.updatePosition();
		self.draw();
	};
	self.draw = function () {
		ctx.save();

		var x = self.x - player.x;
		var y = self.y - player.y;

		x += WIDTH / 2;
		y += HEIGHT / 2;

		x -= self.width / 2;
		y -= self.height / 2;
		//ctx.drawImage(self.img, x, y);

		//parameters(image,cropStartX,cropStartY,cropWidth,cropHeight,drawX,drawY,drawWidth,drawHeight)
		ctx.drawImage(
			self.img,
			0,
			0,
			self.img.width,
			self.img.height,
			x,
			y,
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

		if (self.x < 0 || self.x > currentMap.width) {
			self.spdX = -self.spdX;
		}
		if (self.y < 0 || self.y > currentMap.height) {
			self.spdY = -self.spdY;
		}
	};

	self.update();
	return self;
};
//player

player = function () {
	var self = Actor("player", "myid", 50, 40, 30, 5, 50, 70, Img.player, 10, 1);
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
		if (player.x > currentMap.width - player.width / 2)
			player.x = currentMap.width - player.width / 2;

		if (player.y < player.height / 2) player.y = player.height / 2;
		if (player.y > currentMap.height - player.height / 2)
			player.y = currentMap.height - player.height / 2;
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

Actor = function (type, id, x, spdX, y, spdY, width, height, img, hp, atkSpd) {
	var self = Entity(type, id, x, y, spdX, spdY, width, height, img);
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
	var self = Entity(
		"enemy",
		id,
		x,
		y,
		spdX,
		spdY,
		width,
		height,
		Img.enemy,
		10,
		1
	);

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

upgrade = function (id, x, spdX, y, spdY, width, height, category, img) {
	var self = Entity("upgrade", id, x, y, spdX, spdY, width, height, img);

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
	var self = Entity("enemy", id, x, y, spdX, spdY, width, height, Img.bullet);
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
randomlyGenerateEnemy = function () {
	var x = Math.random() * currentMap.width;
	var y = Math.random() * currentMap.height;
	var height = 64;
	var width = 64;
	var id = Math.random();
	var spdX = 5 + Math.random() * 5;
	var spdY = 5 + Math.random() * 5;
	Enemy(id, x, spdX, y, spdY, width, height);
};

randomlyGenerateUpgrade = function () {
	var x = Math.random() * currentMap.width;
	var y = Math.random() * currentMap.height;
	var height = 32;
	var width = 32;
	var id = Math.random();
	var spdX = 0;
	var spdY = 0;

	if (Math.random() < 0.5) {
		var category = "score";
		var img = Img.upgrade1;
	} else {
		var category = "atkSpd";
		var img = Img.upgrade2;
	}
	upgrade(id, x, spdX, y, spdY, width, height, category, img);
};
generateBullets = function (actor, overWriteAngle) {
	var x = actor.x;
	var y = actor.y;
	var height = 32;
	var width = 32;
	var id = Math.random();
	var angle = actor.aimAngle;
	if (overWriteAngle !== undefined) {
		angle = overWriteAngle;
	}
	var spdX = Math.cos((angle / 180) * Math.PI) * 5;
	var spdY = Math.sin((angle / 180) * Math.PI) * 5;
	Bullet(id, x, spdX, y, spdY, width, height);
};

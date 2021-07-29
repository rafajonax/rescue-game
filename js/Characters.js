export class Characters {
	constructor(options) {
		this.initialSpeed = options.initialSpeed;
		this.maxSpeed = options.maxSpeed;
		this.acceleration = options.acceleration;
		this.minLeft = options.minLeft;
		this.maxLeft = options.maxLeft;
		this.left = options.left;
		this.minTop = options.minTop;
		this.maxTop = options.maxTop;
		this.top = options.top;
		this.speed = options.initialSpeed;
		this.sounds = options.sounds;
		this.classes = options.classes;
		this.attackDuration = options.attackDuration;
		this.respawnDelay = options.respawnDelay;
		this.pause = options.pause;
		this.fall = options.fall;
		this.canAttack = options.canAttack;
		this.gameLoopPool = {};
		this.create();
	}
	create() {
		this.character = document.createElement("div");
		this.character.classList.add(this.classes.main);
		if (this.classes.idle) this.character.classList.add(this.classes.idle);
		setTimeout(() => {
			if (!this.top) this.top = parseInt(this.character.offsetTop);
			if (!this.left) this.left = parseInt(this.character.offsetLeft);
		}, 1);
	}
	timeInterval() {
		Object.keys(this.gameLoopPool).forEach((key) => {
			this.gameLoopPool[key].call(this);
		});
	}
	putInGameLoop(loopFunction) {
		this.gameLoopPool[loopFunction.name] = loopFunction;
	}
	removeFromGameLoop(loopFunctionName) {
		delete this.gameLoopPool[loopFunctionName];
	}
	playAudio(audio) {
		setTimeout(() => audio.play(), 10);
	}
	stopAudio(audio) {
		audio.pause();
		audio.currentTime = 0;
	}
	attackAnimation() {
		this.pause = true;
		this.character.classList.add(this.classes.attack);
		setTimeout(() => {
			this.character.classList.remove(this.classes.attack);
			this.pause = false;
		}, this.attackDuration);
	}
	setAttackX(left) {
		this.characterAttack.style.left = `${left}px`;
	}
	setAttackY(top) {
		this.characterAttack.style.top = `${top}px`;
	}
	removeAttack() {
		if (!this.characterAttack) return;
		this.characterAttack.remove();
		this.characterAttack = null;
	}
	deathAnimation(moveWithBackground) {
		this.pause = true;
		this.canAttack = false;
		const animation = this.character.cloneNode(true);
		animation.className = this.classes.death;
		animation.style.top = `${this.top}px`;
		animation.style.left = `${this.left}px`;
		animation.style.width = `${this.character.offsetWidth}px`;
		animation.style.height = `${this.character.offsetHeight}px`;
		this.resetPosition();
		this.character.classList.add("hide");
		this.character.parentNode.appendChild(animation);

		if (this.sounds.death) {
			this.playAudio(this.sounds.death.audio);
		}

		const moveDeadBody = () => {
			if (animation.offsetLeft < this.minLeft + 2)
				animation.classList.add("hide");
			else {
				if (moveWithBackground)
					animation.style.left = `${
						parseInt(animation.offsetLeft) - moveWithBackground.speed
					}px`;
				if (this.fall)
					animation.style.top = `${parseInt(
						animation.offsetTop + this.initialSpeed
					)}px`;
			}
		};

		this.putInGameLoop(moveDeadBody);

		setTimeout(() => {
			animation.remove();
			this.removeFromGameLoop("moveDeadBody");
			this.pause = false;
			this.canAttack = true;
			setTimeout(() => {
				this.character.classList.remove("hide");
			}, 100);
		}, this.respawnDelay || 0);
	}
	walkAnimation() {
		this.character.classList.remove(this.classes.idle);
		this.character.classList.add(this.classes.walk);
	}
	stopWalkAnimation() {
		this.character.classList.remove(this.classes.walk);
		this.character.classList.add(this.classes.idle);
	}
	flyAnimation() {
		this.character.classList.remove(this.classes.idle);
		this.character.classList.add(this.classes.fly);
	}
	stopFlyAnimation() {
		this.character.classList.remove(this.classes.fly);
		this.character.classList.add(this.classes.idle);
	}
	accelerate() {
		this.speed *= this.acceleration;
		if (this.speed >= this.maxSpeed) this.speed = this.maxSpeed;
	}
	setX() {
		this.character.style.left = `${this.left}px`;
	}
	setY() {
		this.character.style.top = `${this.top}px`;
	}
	attack() {
		this.attackAnimation();
	}
	walk() {
		this.walkAnimation();
	}
	fly() {
		this.flyAnimation();
	}
	die(deadBodyMove) {
		this.deathAnimation(deadBodyMove);
	}
	stopWalk() {
		this.stopWalkAnimation();
	}
	stopFly() {
		this.stopFlyAnimation();
	}
	move() {}
	resetPosition() {}
}

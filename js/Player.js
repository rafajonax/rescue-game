import { Characters } from "./Characters.js";
export class Player extends Characters {
	constructor(options) {
		super(options);
		this.KEYS = options.KEYS;
		this.attackMarginLeft = options.attackMarginLeft;
		this.attackMarginTop = options.attackMarginTop;
		this.attackSpeed = options.attackSpeed;
		this.maxAttackLeft = options.maxAttackLeft;
	}
	setControls() {
		document.addEventListener("keydown", (e) => {
			if (this.KEYS[e.code]) {
				this.KEYS[e.code].pressed = true;
			}
		});
		document.addEventListener("keyup", (e) => {
			if (this.KEYS[e.code]) {
				this.KEYS[e.code].pressed = false;
				this.stopFly();
			}
		});
		window.addEventListener("blur", () => this.releaseKeys());
	}
	move() {
		this.timeInterval();
		if (this.pause) return;
		Object.keys(this.KEYS).forEach((key) => {
			if (this.KEYS[key].pressed === true) {
				this[this.KEYS[key].action]();
			}
		});
	}
	moveUp() {
		this.top -= this.speed;
		if (this.top < this.minTop) this.top = this.minTop;
		this.setY();
		this.fly();
	}
	moveDown() {
		this.top += this.speed;
		if (this.top > this.maxTop) this.top = this.maxTop;
		this.setY();
		this.fly();
	}
	moveLeft() {
		this.left -= this.speed;
		if (this.left < this.minLeft) this.left = this.minLeft;
		this.setX();
		this.fly();
	}
	moveRight() {
		this.left += this.speed;
		if (this.left > this.maxLeft) this.left = this.maxLeft;
		this.setX();
		this.fly();
	}
	attack() {
		let attackLeft;
		let attackTop;
		const moveShot = () => {
			attackLeft += this.attackSpeed;
			if (attackLeft > this.maxAttackLeft || !this.characterAttack) {
				this.removeFromGameLoop("moveShot");
				this.removeAttack();
				this.canAttack = true;
			} else this.setAttackX(attackLeft);
		};

		if (this.canAttack) {
			this.canAttack = false;
			attackLeft = this.left + this.attackMarginLeft;
			attackTop = this.top + this.attackMarginTop;
			this.characterAttack = document.createElement("div");
			this.characterAttack.className = "shot";
			this.character.parentNode.appendChild(this.characterAttack);
			this.setAttackX(attackLeft);
			this.setAttackY(attackTop);
			this.attackAnimation();
			if (!this.sounds.attack.audio.paused)
				this.stopAudio(this.sounds.attack.audio);
			this.playAudio(this.sounds.attack.audio);
			this.putInGameLoop(moveShot);
		}
	}
	setX() {
		this.character.style.left = `${this.left}px`;
	}
	setY() {
		this.character.style.top = `${this.top}px`;
	}
	releaseKeys() {
		Object.keys(this.KEYS).forEach((key) => {
			if (this.KEYS[key].pressed) this.KEYS[key].pressed = false;
		});
	}
	resetPosition() {
		this.top = this.maxTop / 2;
		this.left = this.minLeft;
		this.setX();
		this.setY();
	}
}

import { Characters } from "./Characters.js";
export class Enemy1 extends Characters {
	constructor(options) {
		super(options);
		this.prize = options.prize;
		this.attackSpeed = options.attackSpeed;
		this.maxAttackTop = options.maxAttackTop;
	}
	move() {
		this.timeInterval();
		if (this.pause) return;
		this.left -= this.speed;
		if (this.left <= this.minLeft) {
			this.top = this.randomTop();
			this.left = this.maxLeft;
		}
		this.setX();
		this.setY();
	}
	randomTop() {
		return parseInt(Math.random() * this.maxTop);
	}
	resetPosition() {
		this.left = this.maxLeft;
		this.top = this.randomTop();
	}
	attack() {
		let attackLeft;
		let attackTop;
		const moveBomb = () => {
			attackTop += this.attackSpeed;
			if (attackTop > this.maxAttackTop || !this.characterAttack) {
				this.explodeAttack();
			} else this.setAttackY(attackTop);
		};

		if (this.canAttack) {
			this.canAttack = false;
			this.characterAttack = document.createElement("div");
			this.characterAttack.className = "bomb";
			this.character.parentNode.appendChild(this.characterAttack);
			attackLeft =
				this.left +
				2 +
				this.character.offsetWidth / 2 -
				this.characterAttack.offsetWidth / 2;
			attackTop = this.top + this.character.offsetHeight / 2;
			this.setAttackX(attackLeft);
			this.setAttackY(attackTop);
			this.attackAnimation();
			if (!this.sounds.attack.audio.paused)
				this.stopAudio(this.sounds.attack.audio);
			this.playAudio(this.sounds.attack.audio);
			this.putInGameLoop(moveBomb);
		}
	}
	explodeAttack() {
		const explosion = this.characterAttack.cloneNode(true);
		explosion.className = "explosion";
		this.character.parentNode.appendChild(explosion);
		explosion.style.left = `${
			this.characterAttack.offsetLeft - explosion.offsetWidth / 2
		}px`;
		this.removeAttack();
		this.removeFromGameLoop("moveBomb");
		this.playAudio(this.sounds.explosion.audio);
		setTimeout(() => {
			explosion.remove();
			this.canAttack = true;
		}, 1000);
	}
}

import { Characters } from "./Characters.js";
export class Friend extends Characters {
	constructor(options) {
		super(options);
		this.prize = options.prize;
		this.penalty = options.penalty;
	}
	move() {
		if (this.pause) return;
		this.left += this.speed;
		if (this.left > this.maxLeft) this.left = this.minLeft;
		this.setX();
	}
	getSaved() {
		this.pause = true;
		this.character.classList.add("hide");
		this.resetPosition();
		setTimeout(() => {
			setTimeout(() => this.character.classList.remove("hide"), 100);
			this.pause = false;
		}, this.respawnDelay);
	}
	resetPosition() {
		this.left = this.minLeft;
	}
}

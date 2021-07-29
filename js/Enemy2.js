import { Characters } from "./Characters.js";
export class Enemy2 extends Characters {
	constructor(options) {
		super(options);
		this.prize = options.prize;
	}
	move() {
		if (this.pause) return;
		this.left -= this.speed;
		if (this.left <= this.minLeft) this.left = this.maxLeft;
		this.setX();
	}
	resetPosition() {
		this.left = this.maxLeft;
	}
}

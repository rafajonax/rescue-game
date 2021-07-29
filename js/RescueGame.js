import { Player } from "./Player.js";
import { Enemy1 } from "./Enemy1.js";
import { Enemy2 } from "./Enemy2.js";
import { Friend } from "./Friend.js";
import { defaultGame } from "./defaultGame.js";
export class RescueGame {
	constructor(game) {
		this.game = JSON.parse(JSON.stringify(this.loadDefaults(game)));
		this.backgroundLoopTime = this.game.backgroundLoopTime;
		this.backgroundSpeed = this.game.backgroundSpeed;
		this.score = this.game.score;
		this.rescues = this.game.rescues;
		this.losses = this.game.losses;
		this.maxLifes = this.game.maxLifes;
		this.lifes = this.game.maxLifes;
		this.sounds = this.game.sounds;
		this.init();
	}
	loadDefaults(game) {
		return Object.assign({}, defaultGame, game);
	}
	init() {
		this.gameContainer = document.createElement("div");
		this.gameContainer.className = "game-container";
		this.gameContainer.innerHTML = `<div class="game-background">
				<div class="start">
					<div class="no-sound-container">
						<div class="no-sound-img"></div>
						<p class="no-sound-text">Clique para habilitar o som!</p>
					</div>
					<h1>resgate espacial</h1>
					<p>
						Utilize a tecla W para movimentar sua nave para cima, a tecla S
						para movimentar para baixo e a tecla D para atirar.
					</p>
					<button id="start-button" class="start-button" type="button" role="button">Iniciar!</button>
				</div>
			</div>`;

		this.gameBackground = this.gameContainer.querySelector(".game-background");
		this.createAudios(this.sounds);

		const playTheme = () => {
			this.playAudio(this.sounds.menu.audio);
			this.gameContainer.classList.remove("no-sound");
		};

		this.sounds.menu.audio.play().catch(() => {
			this.gameContainer.classList.add("no-sound");
			this.gameContainer.addEventListener("click", playTheme);
		});

		const startButton = this.gameContainer.querySelector("#start-button");

		startButton.addEventListener("click", () => {
			startButton.disabled = true;
			this.gameContainer.removeEventListener("click", playTheme);
			this.stopAudio(this.sounds.menu.audio);
			this.playAudio(this.sounds.click.audio);
			setTimeout(() => {
				this.startGame();
			}, 250);
		});
		document.body.appendChild(this.gameContainer);
	}
	appendToGameBackground(element) {
		this.gameBackground.appendChild(element);
	}
	startGame() {
		this.playAudio(this.sounds.theme.audio);
		this.gameContainer.querySelector(".start").classList.add("hide");

		//set player actions
		this.player = new Player(this.game.player);
		this.player.setControls();
		this.appendToGameBackground(this.player.character);
		this.createAudios(this.player.sounds);

		// set enemy1 actions
		this.enemy1 = new Enemy1(this.game.enemy1);
		this.appendToGameBackground(this.enemy1.character);
		this.createAudios(this.enemy1.sounds);
		this.enemy1.fly();

		// set enemy2 actions
		this.enemy2 = new Enemy2(this.game.enemy2);
		this.appendToGameBackground(this.enemy2.character);
		this.createAudios(this.enemy2.sounds);
		this.enemy2.walk();

		// set friend actions
		this.friend = new Friend(this.game.friend);
		this.appendToGameBackground(this.friend.character);
		this.createAudios(this.friend.sounds);
		this.friend.walk();

		this.createLifeBar();
		this.createScoreboard();

		this.timer = setInterval(() => {
			this.moveGameBackground();
			this.player.move();
			this.enemy1.move();
			this.enemy2.move();
			this.friend.move();
			this.collisions();
		}, this.backgroundLoopTime);
	}
	createAudios(sounds) {
		Object.keys(sounds).forEach((key) => {
			const audio = new Audio(`./sound/${sounds[key].path}`);
			audio.preload = "auto";
			audio.volume = sounds[key].volume;
			audio.loop = sounds[key].loop || false;
			sounds[key].audio = audio;
		});
	}
	playAudio(audio) {
		setTimeout(() => audio.play(), 10);
	}
	stopAudio(audio) {
		audio.pause();
		audio.currentTime = 0;
	}
	createLifeBar() {
		this.lifeBar = document.createElement("div");
		this.lifeBar.className = "life-panel";
		this.lifeBar.innerHTML = new Array(this.maxLifes)
			.fill(`<div class="heart full"></div>`)
			.join("");
		this.gameBackground.appendChild(this.lifeBar);
	}
	decreaseLife() {
		this.lifeBar
			.querySelector(`.heart:nth-child(${this.lifes})`)
			.classList.add("empty");
		this.lifes--;
		if (this.lifes == 0) this.gameOver();
	}
	createScoreboard() {
		this.scoreboard = document.createElement("div");
		this.scoreboard.className = "scoreboard";
		this.scoreboard.innerHTML = `<h4 class="score-title">Placar</h4>
		<span class="score-tag">Pontos:<span id="score" class="score-value">-</span></span>
		<span class="score-tag">Salvos:<span id="rescues" class="score-value">-</span></span>
		<span class="score-tag">Perdas:<span id="losses" class="score-value">-</span></span>`;
		this.gameBackground.appendChild(this.scoreboard);
	}
	updateScoreboard() {
		if (this.score < 0) this.score = 0;
		this.scoreboard.querySelector("#score").textContent = this.score;
		this.scoreboard.querySelector("#rescues").textContent = this.rescues;
		this.scoreboard.querySelector("#losses").textContent = this.losses;
	}
	moveGameBackground() {
		const currentBackgroundPosition = parseInt(
			window
				.getComputedStyle(this.gameBackground)
				.getPropertyValue("background-position-x")
		);
		this.gameBackground.style.backgroundPositionX =
			currentBackgroundPosition - this.backgroundSpeed + "px";
	}
	testCollision(el1, el2, direction) {
		if (
			!el1 ||
			!el2 ||
			!el1.getClientRects().length ||
			!el2.getClientRects().length
		)
			return;

		const el1Rects = el1.getClientRects()[0];
		const el2Rects = el2.getClientRects()[0];

		const leftObject = el1Rects.left <= el2Rects.left ? el1Rects : el2Rects;
		const rightObject = leftObject === el1Rects ? el2Rects : el1Rects;

		const topObject = el1Rects.top <= el2Rects.top ? el1Rects : el2Rects;
		const bottomObject = topObject === el1Rects ? el2Rects : el1Rects;

		switch (direction) {
			case "vertical":
				if (leftObject.right >= rightObject.left) return true;
				break;
			case "vertical-top":
				if (leftObject.right >= rightObject.left && topObject === el1Rects)
					return true;
				break;
			case "vertical-bottom":
				if (leftObject.right >= rightObject.left && bottomObject === el1Rects)
					return true;
				break;
			case "horizontal":
				if (topObject.bottom >= bottomObject.top) return true;
				break;
			case "horizontal-left":
				if (topObject.bottom >= bottomObject.top && leftObject === el1Rects)
					return true;
				break;
			case "horizontal-rigth":
				if (topObject.bottom >= bottomObject.top && rightObject === el1Rects)
					return true;
				break;
			default:
				if (
					leftObject.right >= rightObject.left &&
					topObject.bottom >= bottomObject.top
				)
					return true;
		}
		return false;
	}
	collisions() {
		const moveWithBackground = {
			loopTime: this.backgroundLoopTime,
			speed: this.backgroundSpeed,
		};

		// player collides enemy1
		if (this.testCollision(this.player.character, this.enemy1.character)) {
			this.decreaseLife();
			this.player.die();
			this.enemy1.resetPosition();
			this.playAudio(this.sounds.hit.audio);
			this.playAudio(this.enemy1.sounds.talk.audio);
		}

		// player collides enemy 2
		if (this.testCollision(this.player.character, this.enemy2.character)) {
			this.decreaseLife();
			this.enemy2.attack();
			this.player.die();
			this.enemy2.resetPosition();
			this.playAudio(this.sounds.hit.audio);
			this.playAudio(this.enemy2.sounds.talk.audio);
		}

		// player's attack hits enemy1
		if (
			this.testCollision(this.player.characterAttack, this.enemy1.character)
		) {
			this.playAudio(this.sounds.hit.audio);
			this.playAudio(this.enemy1.sounds.death.audio);
			this.enemy1.die(moveWithBackground);
			this.enemy1.accelerate();
			this.score += this.enemy1.prize;
			this.player.removeAttack();
		}

		// player's attack hits enemy2
		if (
			this.testCollision(this.player.characterAttack, this.enemy2.character)
		) {
			this.playAudio(this.sounds.hit.audio);
			this.playAudio(this.enemy2.sounds.death.audio);
			this.enemy2.die(moveWithBackground);
			this.enemy2.accelerate();
			this.score += this.enemy2.prize;
			this.player.removeAttack();
		}

		// player save friend
		if (this.testCollision(this.player.character, this.friend.character)) {
			this.playAudio(this.friend.sounds.talk.audio);
			this.rescues++;
			this.score += this.friend.prize;
			this.friend.getSaved();
		}

		// enemy2's attack hits friend
		if (this.testCollision(this.enemy2.character, this.friend.character)) {
			this.enemy2.attack();
			this.playAudio(this.sounds.hit.audio);
			this.losses++;
			this.score -= this.friend.penalty;
			this.friend.die(moveWithBackground);
			this.friend.resetPosition();
		}

		// enemy1's attack
		if (
			this.testCollision(
				this.friend.character,
				this.enemy1.character,
				"vertical"
			) ||
			this.testCollision(
				this.player.character,
				this.enemy1.character,
				"vertical-bottom"
			)
		) {
			this.enemy1.attack();
		}

		// enemy1's attack hits player
		if (
			this.testCollision(this.enemy1.characterAttack, this.player.character)
		) {
			this.decreaseLife();
			this.enemy1.explodeAttack();
			this.player.die();
			this.playAudio(this.sounds.hit.audio);
			this.playAudio(this.enemy1.sounds.talk.audio);
		}

		// enemy1's attack hits friend
		if (
			this.testCollision(this.enemy1.characterAttack, this.friend.character)
		) {
			this.losses++;
			this.score -= this.friend.penalty;
			this.enemy1.explodeAttack();
			this.friend.die(moveWithBackground);
			this.playAudio(this.sounds.hit.audio);
			this.playAudio(this.enemy1.sounds.talk.audio);
		}

		// player's attack collides enemy1's attack
		if (
			this.testCollision(
				this.player.characterAttack,
				this.enemy1.characterAttack
			)
		) {
			this.enemy1.explodeAttack();
			this.player.removeAttack();
		}

		this.updateScoreboard();
	}
	restartGame() {
		this.score = this.game.score;
		this.losses = this.game.losses;
		this.rescues = this.game.rescues;
		this.lifes = this.game.maxLifes;
		this.startGame();
	}
	gameOver() {
		clearTimeout(this.timer);
		this.stopAudio(this.sounds.theme.audio);
		this.playAudio(this.sounds.gameOver.audio);
		

		const gameBackground = document.createElement("div");
		gameBackground.classList.add("game-background", "game-over");
		gameBackground.innerHTML = `<div class="start">
					<h1>game over</h1>
					<div class="final-scoreboard">
					<h4 class="score-title">placar final</h4>
		<span class="score-tag">Pontos:<span id="score" class="score-value">${this.score}</span></span>
		<span class="score-tag">Salvos:<span id="rescues" class="score-value">${this.rescues}</span></span>
		<span class="score-tag">Perdas:<span id="losses" class="score-value">${this.losses}</span></span>
		</div>
					<button id="start-button" class="start-button" type="button" role="button">Reiniciar</button>
			</div>`;

		setTimeout(() => {
			this.playAudio(this.sounds.menu.audio);
			this.gameBackground.replaceWith(gameBackground);
			this.gameBackground = gameBackground;
			const startButton = gameBackground.querySelector("#start-button");
			startButton.addEventListener("click", () => {
				startButton.disabled = true;
				this.stopAudio(this.sounds.menu.audio);
				this.playAudio(this.sounds.click.audio);
				setTimeout(() => {
					this.restartGame();
				}, 250);
			});
		}, 100);
	}
}




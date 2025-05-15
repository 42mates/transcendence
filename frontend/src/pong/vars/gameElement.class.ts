export class GameElement {
	x: number;
	y: number;
	height: number;
	width: number;
	speed: number;
	xVec: number;
	yVec: number;

	constructor(x: number, y: number, h: number, w: number, s: number) {
		this.x = x;
		this.y = y;
		this.height = h;
		this.width = w;
		this.speed = s;
		this.xVec = 0;
		this.yVec = 0;
	}

	draw() {}
}

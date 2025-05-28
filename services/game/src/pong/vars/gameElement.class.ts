export class GameElement {
	x: number;
	y: number;
	height: number;
	width: number;
	xVec: number;
	yVec: number;

	constructor(x: number, y: number, h: number, w: number) {
		this.x = x;
		this.y = y;
		this.height = h;
		this.width = w;
		this.xVec = 0;
		this.yVec = 0;
	}

	/* draw(context) {
		context.fillStyle("#fff");
		context.fillRect(this.x, this.y, this.width, this.height);
	} */
}

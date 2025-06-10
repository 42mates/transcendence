export class Template {
	x: number;
	y: number;
	height: number;
	width: number;
	xVec: number;
	yVec: number;

	constructor(x: number, y: number, w: number, h: number) {
		this.x = x;
		this.y = y;
		this.height = h;
		this.width = w;
		this.xVec = 0;
		this.yVec = 0;
	}
}

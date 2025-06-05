export class GameCanvas {
	_height: number;
	_width: number;
	_paddleWidth: number;
	_paddleHeight: number;
	_ballSize: number;

	constructor(h: number, w: number) {
		this._height = h;
		this._width = w;
		this._paddleWidth = w / 20;
		this._paddleHeight = h / 5;
		this._ballSize = w / 50;
	}

	public get height() {
		return this._height;
	}
	public get width() {
		return this._width;
	}
	public get paddleWidth() {
		return this._paddleWidth;
	}
	public get paddleHeight() {
		return this._paddleHeight;
	}
	public get ballSize() {
		return this._ballSize;
	}

	public get dimensions() {
		return {
			height: this._height,
			width: this._width,
			paddleWidth: this._paddleWidth,
			paddleHeight: this._paddleHeight,
			ballSize: this._ballSize,
		};
	}
}

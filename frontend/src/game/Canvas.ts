import { GameStateMessage } from '../types/GameMessages';

type ServerDimensions = {
	width: number;
	height: number;
	paddleWidth: number;
	paddleHeight: number;
	ballSize: number;
}

export default class Canvas {
	private _canvas: HTMLCanvasElement;
	private _ctx: CanvasRenderingContext2D | null;
	private _serverDimensions: ServerDimensions;
	private _waitingAnimationFrame: number | null = null;
	private _raw_data: GameStateMessage | null = null; 
	private _data: GameStateMessage | null = null; 
	private _isLoading: boolean = false; 

	constructor(canvas: HTMLCanvasElement) {
		this._canvas = canvas;
		this._ctx = this._canvas.getContext('2d');
		this.resize();
		window.addEventListener('resize', () => {
			this.resize();
			if (this._isLoading) {
				this.stopLoadingAnimation();
				this.drawLoadingAnimation();
			}
			else if (this._data)
				this.draw();
		});
		this._serverDimensions = {
			width: 100,
			height: 75,
			paddleWidth: 100 / 20,
			paddleHeight: 100 / 5,
			ballSize: 100 / 50,
		};
	}

	public get serverDimensions(): ServerDimensions {
		return this._serverDimensions;
	}

	public setServerDimensions(dimensions: ServerDimensions) {
		this._serverDimensions = dimensions;
		this.resize();
	}

	private resize(): void {
		const rect = this._canvas.getBoundingClientRect();
		this._canvas.width = rect.width;
		this._canvas.height = rect.height;
		if (this._raw_data)
			this.translateGameState(this._raw_data);
	}

	private scaleX(x: number): number {
		return (x / this._serverDimensions.width) * this._canvas.width;
	}

	private scaleY(y: number): number {
		return (y / this._serverDimensions.height) * this._canvas.height;
	}

	private drawGrid(): void {
		if (!this._ctx) return;
		this._ctx.save();
		this._ctx.strokeStyle = "#444";
		this._ctx.lineWidth = 1;
		for (let i = 0; i <= this._serverDimensions.width; i++) {
			const x = this.scaleX(i);
			this._ctx.beginPath();
			this._ctx.moveTo(x, 0);
			this._ctx.lineTo(x, this._canvas.height);
			this._ctx.stroke();
		}
		for (let j = 0; j <= this._serverDimensions.height; j++) {
			const y = this.scaleY(j);
			this._ctx.beginPath();
			this._ctx.moveTo(0, y);
			this._ctx.lineTo(this._canvas.width, y);
			this._ctx.stroke();
		}
		this._ctx.restore();
	}

	private drawPaddle(i: number): void {
		if (!this._ctx || !this._data) return;

		const paddleWidth = this.scaleX(this._serverDimensions.paddleWidth);
		const paddleHeight = this.scaleY(this._serverDimensions.paddleHeight);

		let x = this._data.paddles[i].x;
		let y = this._data.paddles[i].y;

		this._ctx.save();

		//// Draw blurred glow using a larger, semi-transparent rectangle
		//const glowSize = this.scaleY(this._serverDimensions.paddleWidth * 2);
		//this._ctx.fillStyle = "rgba(0,224,255,0.35)";
		//this._ctx.filter = `blur(${glowSize}px)`;
		//this._ctx.fillRect(
		//	x - glowSize / 2,
		//	y - glowSize / 2,
		//	paddleWidth + glowSize,
		//	paddleHeight + glowSize
		//);

		// Draw the main paddle
		this._ctx.filter = "none";
		this._ctx.fillStyle = "#71717A";
		this._ctx.fillRect(x, y, paddleWidth, paddleHeight);

		this._ctx.restore();
	}

	private clearPaddle(i: number): void {
		if (!this._ctx || !this._data) return;

		const paddleWidth = this.scaleX(this._serverDimensions.paddleWidth);
		const paddleHeight = this.scaleY(this._serverDimensions.paddleHeight);

		let x = this._data.paddles[i].x;
		let y = this._data.paddles[i].y;

		this._ctx.clearRect(x, y, paddleWidth, paddleHeight);
	}

	private drawBall(): void {
		if (!this._ctx || !this._data) return;

		const ballSize = this.scaleY(this.serverDimensions.ballSize);

		let x = this._data.ball.x;
		let y = this._data.ball.y;

		this._ctx.save();

		//// Draw a blurred glow behind the square ball
		//const glowSize = this.scaleY(this._serverDimensions.paddleWidth * 2);
		//this._ctx.filter = `blur(${glowSize / 2}px)`;
		//this._ctx.fillStyle = "rgba(255,0,0,0.45)";
		//this._ctx.fillRect(
		//	x - (glowSize - ballSize) / 2,
		//	y - (glowSize - ballSize) / 2,
		//	ballSize + (glowSize - ballSize),
		//	ballSize + (glowSize - ballSize)
		//);

		// Draw the main square ball
		this._ctx.filter = "none";
		this._ctx.fillStyle = "#f59e0b";
		this._ctx.fillRect(x, y, ballSize, ballSize);

		this._ctx.restore();
	}

	private clearBall(): void {
		if (!this._ctx || !this._data) return;

		const ballSize = this.scaleY(this.serverDimensions.ballSize);

		let x = this._data.ball.x;
		let y = this._data.ball.y;

		this._ctx.clearRect(x, y, ballSize, ballSize);
	}

	private draw(prev_data?: GameStateMessage): void {
		if (!this._ctx || !this._data) return;

		//if (prev_data) 
		//{
		//	for (let i = 0; i < 2; i++) {
		//		if (this._data.paddles[i].x !== prev_data.paddles[i].x || this._data.paddles[i].y !== prev_data.paddles[i].y) {
		//			this.clearPaddle(i);
		//			this.drawPaddle(i);
		//		}
		//	}
		//	this.clearBall();
		//	this.drawBall();
		//}
		//else
		//{
			this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
			this.drawPaddle(0);
			this.drawPaddle(1);
			this.drawBall();
		//}

		//this.drawGrid();
	}


	public drawLoadingAnimation(): void {
		console.log("Starting loading animation");
		this._isLoading = true;
		if (!this._ctx) return;

		const base = Math.min(this._canvas.width, this._canvas.height * 4 / 3);
		const text = "Looking for players";
		const dotFrames = ["", ".", "..", "...", "..", ".", ""];
		const frameDuration = 300; // ms per frame

		let startTime: number | null = null;

		const drawAnim = (timestamp?: number) => {
			if (!this._ctx) return;
			if (startTime === null && timestamp !== undefined) startTime = timestamp;
			const elapsed = timestamp !== undefined && startTime !== null ? timestamp - startTime : 0;
			const frame = Math.floor(elapsed / frameDuration) % dotFrames.length;

			this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

			const cx = this._canvas.width / 2;
			const cy = this._canvas.height / 2;
			const fontSize = Math.max(24, base * 0.07);

			this._ctx.save();
			this._ctx.font = `bold ${fontSize}px sans-serif`;
			this._ctx.fillStyle = "#fff";
			this._ctx.textAlign = "left"; // Align text to the left
			this._ctx.textBaseline = "middle";

			// Measure the base text width
			// Find the widest dot frame
			const widestDot = dotFrames.reduce((a, b) => 
				this._ctx!.measureText(a).width > this._ctx!.measureText(b).width ? a : b
			);
			const baseTextWidth = this._ctx.measureText(text + widestDot).width;
			// Measure the full text width with dots
			const fullText = text + dotFrames[frame];
			// Calculate the starting x so that the base text is centered, but text is left-aligned
			const startX = cx - (baseTextWidth / 2);

			this._ctx.fillText(fullText, startX, cy);
			this._ctx.restore();

			this._waitingAnimationFrame = requestAnimationFrame(drawAnim);
		};
		drawAnim();
	}

	public stopLoadingAnimation(): void {
		this._isLoading = false;
		if (this._waitingAnimationFrame) {
			cancelAnimationFrame(this._waitingAnimationFrame);
			this._waitingAnimationFrame = null;
		}
	}

	public drawCountdown(): Promise<void> {
		if (!this._ctx) return Promise.resolve();

		const cx = this._canvas.width / 2;
		const cy = this._canvas.height / 2;
		const fontSize = Math.max(48, Math.min(this._canvas.width, this._canvas.height) * 0.15);
		const countdownNumbers = ["3", "2", "1"];
		const delay = 800; // ms

		const start = Date.now();
		let frame = 0;

		return new Promise<void>((resolve) => {
			const drawFrame = () => {
				if (!this._ctx) return resolve();
				const now = Date.now();
				const elapsed = now - start;
				frame = Math.floor(elapsed / delay);

				if (frame < countdownNumbers.length) {
					this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
					this._ctx.save();
					this._ctx.font = `bold ${fontSize}px sans-serif`;
					this._ctx.fillStyle = "#f59e0b";
					this._ctx.textAlign = "center";
					this._ctx.textBaseline = "middle";
					this._ctx.fillText(countdownNumbers[frame], cx, cy);
					this._ctx.restore();
					requestAnimationFrame(drawFrame);
				} else {
					this.draw();
					resolve();
				}
			};
			drawFrame();
		});
	}


	private translateGameState(msg: GameStateMessage): void {
		if (!this._ctx) return ;
		this._data = { ...msg };

		if (this._data.ball) {
			this._data.ball = {
				...this._data.ball,
				x: this.scaleX(msg.ball.x),
				y: this.scaleY(msg.ball.y),
			};
		}

		if (Array.isArray(this._data.paddles)) {
			this._data.paddles = msg.paddles.map(paddle => ({
				...paddle,
				x: this.scaleX(paddle.x),
				y: this.scaleY(paddle.y),
			}));
		}

		this._data.score = msg.score;
		this._data.status = msg.status;
	}

	public updateGameState(msg: GameStateMessage) {
		if (!this._ctx) return;

		this._raw_data = msg; // Store the raw data for debugging or other purposes
		
		//const previousData = this._data;
		this.translateGameState(msg);

		
		this.draw();
	}


	public printError(message: string) {
		if (!this._ctx) return;

		this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
		const cx = this._canvas.width / 2;
		const cy = this._canvas.height / 2;
		const fontSize = Math.max(24, Math.min(this._canvas.width, this._canvas.height) * 0.07);

		this._ctx.save();
		this._ctx.font = `bold ${fontSize}px sans-serif`;
		this._ctx.fillStyle = "#ff0000"; // Red color for error
		this._ctx.textAlign = "center";
		this._ctx.textBaseline = "middle";
		this._ctx.fillText(message, cx, cy);
		this._ctx.restore();
	}
}
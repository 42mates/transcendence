import { GameStateMessage } from '../types/GameMessages';
import { drawRoundedRect } from '../utils/canvas_helpers';

export default class Canvas {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D | null;
	private waitingAnimationFrame: number | null = null;
	private angle: number = 0;
	private raw_data: GameStateMessage | null = null; 
	private data: GameStateMessage | null = null; 
	private isLoading: boolean = false; 

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext('2d');
		this.resize();
		window.addEventListener('resize', () => {
			this.resize();
			if (this.isLoading) {
				this.stopLoadingAnimation();
				this.drawLoadingAnimation();
			}
			else if (this.data)
				this.draw();
		});
	}

	private resize(): void {
		const rect = this.canvas.getBoundingClientRect();
		this.canvas.width = rect.width;
		this.canvas.height = rect.height;
		if (this.raw_data)
			this.translateGameState(this.raw_data);
	}

	private scaleX(x: number): number {
		return (x / 100) * this.canvas.width;
	}

	private scaleY(y: number): number {
		return (y / 100) * this.canvas.height;
	}

	private drawGrid(): void {
	    if (!this.ctx) return;
	    this.ctx.save();
	    this.ctx.strokeStyle = "#444";
	    this.ctx.lineWidth = 1;
	    for (let i = 0; i <= 100; i++) {
	        const x = this.scaleX(i);
	        this.ctx.beginPath();
	        this.ctx.moveTo(x, 0);
	        this.ctx.lineTo(x, this.canvas.height);
	        this.ctx.stroke();
	    }
	    for (let j = 0; j <= 100; j++) {
	        const y = this.scaleY(j);
	        this.ctx.beginPath();
	        this.ctx.moveTo(0, y);
	        this.ctx.lineTo(this.canvas.width, y);
	        this.ctx.stroke();
	    }
	    this.ctx.restore();
	}

	private drawPaddle(i: number): void {
		if (!this.ctx || !this.data) return;

		const paddleWidth = this.scaleY(2.5);
		const paddleHeight = this.scaleY(14.5);
		const borderRadius = this.scaleY(1.7);

		let x = this.data.paddles[i].x;
		let y = this.data.paddles[i].y;

		this.ctx.save();

		// Draw shadow
		this.ctx.shadowColor = "#00e0ff";
		this.ctx.shadowBlur = this.scaleY(3.3);

		// Draw rounded rectangle paddle
		this.ctx.fillStyle = "#00e0ff";
		drawRoundedRect(
			this.ctx,
			x - paddleWidth / 2,
			y - paddleHeight / 2,
			paddleWidth,
			paddleHeight,
			borderRadius
		);
		this.ctx.fill();

		// Add a subtle white highlight (top third, rounded)
		this.ctx.globalAlpha = 0.25;
		this.ctx.fillStyle = "#fff";
		drawRoundedRect(
			this.ctx,
			x - paddleWidth / 2,
			y - paddleHeight / 2,
			paddleWidth,
			paddleHeight / 3,
			borderRadius
		);
		this.ctx.fill();

		this.ctx.restore();
	}

	private drawBall(): void {
		if (!this.ctx || !this.data) return;

		const ballRadius = this.scaleY(1.5);

		let x = this.data.ball.x;
		let y = this.data.ball.y;

		this.ctx.save();
		this.ctx.fillStyle = "#ff0000"; // Red color for the ball
		this.ctx.shadowColor = "#ff0000";
		this.ctx.shadowBlur = this.scaleY(3.3);
		this.ctx.beginPath();

		this.ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
		this.ctx.closePath();
		this.ctx.fill();
		this.ctx.restore();
	}

	private draw(): void {
		if (!this.ctx || !this.data) return;

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw paddles and ball
		this.drawPaddle(0);
		this.drawPaddle(1);
		this.drawBall();

		//this.drawGrid();
	}


	public drawLoadingAnimation(): void {
		this.isLoading = true;
		if (!this.ctx) return;

		const base = Math.min(this.canvas.width, this.canvas.height * 4 / 3);
		const text = "Looking for players";
		const dotFrames = ["", ".", "..", "...", "..", ".", ""];
		const frameDuration = 300; // ms per frame

		let startTime: number | null = null;

		const drawAnim = (timestamp?: number) => {
			if (!this.ctx) return;
			if (startTime === null && timestamp !== undefined) startTime = timestamp;
			const elapsed = timestamp !== undefined && startTime !== null ? timestamp - startTime : 0;
			const frame = Math.floor(elapsed / frameDuration) % dotFrames.length;

			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

			const cx = this.canvas.width / 2;
			const cy = this.canvas.height / 2;
			const fontSize = Math.max(24, base * 0.07);

			this.ctx.save();
			this.ctx.font = `bold ${fontSize}px sans-serif`;
			this.ctx.fillStyle = "#fff";
			this.ctx.textAlign = "left"; // Align text to the left
			this.ctx.textBaseline = "middle";

			// Measure the base text width
			// Find the widest dot frame
			const widestDot = dotFrames.reduce((a, b) => 
				this.ctx!.measureText(a).width > this.ctx!.measureText(b).width ? a : b
			);
			const baseTextWidth = this.ctx.measureText(text + widestDot).width;
			// Measure the full text width with dots
			const fullText = text + dotFrames[frame];
			// Calculate the starting x so that the base text is centered, but text is left-aligned
			const startX = cx - (baseTextWidth / 2);

			this.ctx.fillText(fullText, startX, cy);
			this.ctx.restore();

			this.waitingAnimationFrame = requestAnimationFrame(drawAnim);
		};
		drawAnim();
	}

	public stopLoadingAnimation(): void {
		this.isLoading = false;
		if (this.waitingAnimationFrame) {
			cancelAnimationFrame(this.waitingAnimationFrame);
			this.waitingAnimationFrame = null;
		}
	}

	private drawCountdown(): void {
		if (!this.ctx) return;

		const cx = this.canvas.width / 2;
		const cy = this.canvas.height / 2;
		const fontSize = Math.max(48, Math.min(this.canvas.width, this.canvas.height) * 0.15);
		const countdownNumbers = ["3", "2", "1"];
		const delay = 800; // ms

		const start = Date.now();
		let frame = 0;

		const drawFrame = () => {
			if (!this.ctx) return;
			const now = Date.now();
			const elapsed = now - start;
			frame = Math.floor(elapsed / delay);

			if (frame < countdownNumbers.length) {
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this.ctx.save();
				this.ctx.font = `bold ${fontSize}px sans-serif`;
				this.ctx.fillStyle = "#fff";
				this.ctx.textAlign = "center";
				this.ctx.textBaseline = "middle";
				this.ctx.fillText(countdownNumbers[frame], cx, cy);
				this.ctx.restore();
				requestAnimationFrame(drawFrame);
			} else {
				// After countdown, redraw the full game frame
				this.draw();
			}
		};

		drawFrame();
	}


	private translateGameState(msg: GameStateMessage): void {
		if (!this.ctx) return ;
		this.data = { ...msg };

		if (this.data.ball) {
			this.data.ball = {
				...this.data.ball,
				x: this.scaleX(msg.ball.x),
				y: this.scaleY(msg.ball.y),
			};
		}

		if (Array.isArray(this.data.paddles)) {
			this.data.paddles = msg.paddles.map(paddle => ({
				...paddle,
				x: this.scaleX(paddle.x),
				y: this.scaleY(paddle.y),
			}));
		}

		this.data.score = msg.score;
		this.data.status = msg.status;
	}

	public updateGameState(msg: GameStateMessage) {
		if (!this.ctx) return;

		this.raw_data = msg; // Store the raw data for debugging or other purposes
		this.translateGameState(msg);
		
		this.draw();

		//if (this.data && this.data.status === "started") 
		//	this.drawCountdown();


	}


	public printError(message: string) {
		if (!this.ctx) return;

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		const cx = this.canvas.width / 2;
		const cy = this.canvas.height / 2;
		const fontSize = Math.max(24, Math.min(this.canvas.width, this.canvas.height) * 0.07);

		this.ctx.save();
		this.ctx.font = `bold ${fontSize}px sans-serif`;
		this.ctx.fillStyle = "#ff0000"; // Red color for error
		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "middle";
		this.ctx.fillText(message, cx, cy);
		this.ctx.restore();
	}
}
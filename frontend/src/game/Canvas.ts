import { GameStateMessage } from '../types/GameMessages';

export default class Canvas {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D | null;
	private waitingAnimationFrame: number | null = null;
	private angle: number = 0;
	private gamestate: GameStateMessage | null = null; 
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
		});
	}
	
	private resize(): void {
		const rect = this.canvas.getBoundingClientRect();
		this.canvas.width = rect.width;
		this.canvas.height = rect.height;
	}

	public drawLoadingAnimation(): void {
		this.isLoading = true;
		if (!this.ctx) return;

		const base = Math.min(this.canvas.width, this.canvas.height * 4 / 3);
		const text = "Looking for players";
		const dotFrames = ["", ".", "..", "...", "..", ".", ""];
		const frameDuration = 300; // ms per frame

		let startTime: number | null = null;

		const draw = (timestamp?: number) => {
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

			this.waitingAnimationFrame = requestAnimationFrame(draw);
		};
		draw();
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
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			}
		};

		drawFrame();
	}

	private drawPaddle(x: number, y: number): void {
		if (!this.ctx) return;

		const paddleWidth = 12;
		const paddleHeight = 70;
		const borderRadius = 8;

		this.ctx.save();
		this.ctx.fillStyle = "#00e0ff";
		this.ctx.shadowColor = "#00e0ff";
		this.ctx.shadowBlur = 16;

		// Draw rounded rectangle paddle
		this.ctx.beginPath();
		this.ctx.moveTo(x, y - paddleHeight / 2 + borderRadius);
		this.ctx.arcTo(x, y - paddleHeight / 2, x + paddleWidth, y - paddleHeight / 2, borderRadius);
		this.ctx.arcTo(x + paddleWidth, y - paddleHeight / 2, x + paddleWidth, y + paddleHeight / 2, borderRadius);
		this.ctx.arcTo(x + paddleWidth, y + paddleHeight / 2, x, y + paddleHeight / 2, borderRadius);
		this.ctx.arcTo(x, y + paddleHeight / 2, x, y - paddleHeight / 2, borderRadius);
		this.ctx.closePath();
		this.ctx.fill();

		// Add a subtle white highlight
		this.ctx.globalAlpha = 0.3;
		this.ctx.fillStyle = "#fff";
		this.ctx.fillRect(x, y - paddleHeight / 2, paddleWidth, paddleHeight / 3);

		this.ctx.restore();
	}

	private drawBall(x: number, y: number): void {
		if (!this.ctx) return;
		const ballRadius = 10;
		this.ctx.save();
		this.ctx.fillStyle = "#ff0000"; // Red color for the ball
		this.ctx.shadowColor = "#ff0000";
		this.ctx.shadowBlur = 16;
		this.ctx.beginPath();

		this.ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
		this.ctx.closePath();
		this.ctx.fill();
		this.ctx.restore();
	}

	private translateGameState(msg: GameStateMessage): GameStateMessage {
		if (!this.ctx) return msg;
		let data: GameStateMessage = { ...msg };

		// Adapt ball coordinates
		if (data.ball) {
			data.ball = {
				...data.ball,
				x: (msg.ball.x / 100) * this.canvas.width,
				y: (msg.ball.y / 100) * this.canvas.height,
			};
		}

		// Adapt paddles coordinates
		if (Array.isArray(data.paddles)) {
			data.paddles = msg.paddles.map(paddle => ({
				...paddle,
				x: (paddle.x / 100) * this.canvas.width,
				y: (paddle.y / 100) * this.canvas.height,
			}));
		}

		data.score = msg.score;
		data.status = msg.status;
		return data;
	}

	public drawGameState(msg: GameStateMessage) {
		if (!this.ctx) return;

		let data = this.translateGameState(msg);
		
		this.drawPaddle(data.paddles[0].x, data.paddles[0].y);
		this.drawPaddle(data.paddles[1].x, data.paddles[1].y);

		this.drawBall(data.ball.x, data.ball.y);

		//if (data.status === "started") 
		//	this.drawCountdown();

		//this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
		//const cx = this.canvas.width / 2;
		//const cy = this.canvas.height / 2;
		//const fontSize = Math.max(24, Math.min(this.canvas.width, this.canvas.height) * 0.07);
		//this.ctx?.save();
		//this.ctx.font = `bold ${fontSize}px sans-serif`;
		//this.ctx.fillStyle = "#fff"; // White color for score
		//this.ctx.textAlign = "center";
		//this.ctx.textBaseline = "middle";
		//this.ctx.fillText(`${data.score[0]} - ${data.score[1]}`, cx, cy - 100); // Display score above the paddles
		//this.ctx.restore();
		//if (data.status === "ended") {
		//	this.ctx?.save();
		//	this.ctx.font = `bold ${fontSize}px sans-serif`;
		//	this.ctx.fillStyle = "#fff"; // White color for status
		//	this.ctx.textAlign = "center";
		//	this.ctx.textBaseline = "middle";
		//	this.ctx.fillText(data.status, cx, cy + 100); // Display status below the paddles
		//	this.ctx.restore();
		//}
	}


	public drawError(message: string) {
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
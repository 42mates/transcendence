export default class Canvas {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D | null;
	private waitingAnimationFrame: number | null = null;
	private angle: number = 0;
	private isLoading: boolean = false; // Track if loading animation is active

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
	
	private resize() {
		const rect = this.canvas.getBoundingClientRect();
		this.canvas.width = rect.width;
		this.canvas.height = rect.height;
	}

	public drawLoadingAnimation() {
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

	public stopLoadingAnimation() {
		this.isLoading = false;
		if (this.waitingAnimationFrame) {
			cancelAnimationFrame(this.waitingAnimationFrame);
			this.waitingAnimationFrame = null;
		}
	}

	public drawGameState(gameState: any) {
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
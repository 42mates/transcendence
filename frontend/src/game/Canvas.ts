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
		const text = "Looking for players...";

		const base = Math.min(this.canvas.width, this.canvas.height * 4 / 3);


		const duration = 2600;
		let startTime: number | null = null;

		// Some random animation with magnifier effect.
		const draw = (timestamp?: number) => {
			if (!this.ctx) return;
			if (startTime === null && timestamp !== undefined) startTime = timestamp;
			const elapsed = timestamp !== undefined && startTime !== null ? (timestamp - startTime) % duration : 0;

			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

			const cx = this.canvas.width / 2;
			const cy = this.canvas.height / 2;

			const fontSize = Math.max(24, base * 0.07);
			const magnifierRadius = base * 0.09;

			this.ctx.save();
			this.ctx.font = `bold ${fontSize}px sans-serif`;
			const textWidth = this.ctx.measureText(text).width;
			const sideOffset = base * 0.08;
			const startX = cx - textWidth / 2 + magnifierRadius - sideOffset;
			const maxOffset = Math.max(0, textWidth - magnifierRadius * 2) + sideOffset * 2;

			const t = elapsed / duration;
			const ease = 0.5 - 0.5 * Math.cos(2 * Math.PI * t);
			const offset = ease * maxOffset;

			const magnifierX = startX + offset;

			this.ctx.font = `bold ${fontSize}px sans-serif`;
			this.ctx.fillStyle = "#fff";
			this.ctx.textAlign = "center";
			this.ctx.textBaseline = "middle";
			this.ctx.fillText(text, cx, cy);

			// Magnifier with convex fisheye effect (reversed)
			this.ctx.save();
			this.ctx.beginPath();
			this.ctx.arc(magnifierX, cy, magnifierRadius, 0, Math.PI * 2);
			this.ctx.clip();

			this.ctx.clearRect(magnifierX - magnifierRadius - 2, cy - magnifierRadius - 2, magnifierRadius * 2 + 4, magnifierRadius * 2 + 4);

			// Convex fisheye effect: warp the text slightly inside the magnifier (reversed)
			const fisheyeStrength = 0.20; // small value for subtle effect
			const imageData = this.ctx.getImageData(magnifierX - magnifierRadius, cy - magnifierRadius, magnifierRadius * 2, magnifierRadius * 2);
			const w = imageData.width;
			const h = imageData.height;
			const tempCanvas = document.createElement('canvas');
			tempCanvas.width = w;
			tempCanvas.height = h;
			const tempCtx = tempCanvas.getContext('2d');
			if (tempCtx) {
				// Draw the text at normal zoom to temp canvas
				tempCtx.font = `bold ${fontSize}px sans-serif`;
				tempCtx.fillStyle = "#fff";
				tempCtx.textAlign = "center";
				tempCtx.textBaseline = "middle";
				tempCtx.clearRect(0, 0, w, h);
				tempCtx.fillText(
					text,
					w / 2 + (cx - magnifierX),
					h / 2 + (cy - cy)
				);

				const tempData = tempCtx.getImageData(0, 0, w, h);
				const dst = this.ctx.createImageData(w, h);
				const dstData = dst.data;

				for (let y = 0; y < h; y++) {
					for (let x = 0; x < w; x++) {
						const dx = x - w / 2;
						const dy = y - h / 2;
						const r = Math.sqrt(dx * dx + dy * dy);
						if (r > magnifierRadius) continue;
						// Convex fisheye mapping (reversed)
						const rn = r / magnifierRadius;
						const rn2 = rn * rn;
						const factor = 1 / (1 + fisheyeStrength * (1 - rn2));
						const sx = w / 2 + dx * factor;
						const sy = h / 2 + dy * factor;
						const srcX = Math.max(0, Math.min(w - 1, Math.round(sx)));
						const srcY = Math.max(0, Math.min(h - 1, Math.round(sy)));
						const srcIdx = (srcY * w + srcX) * 4;
						const dstIdx = (y * w + x) * 4;
						dstData[dstIdx] = tempData.data[srcIdx];
						dstData[dstIdx + 1] = tempData.data[srcIdx + 1];
						dstData[dstIdx + 2] = tempData.data[srcIdx + 2];
						dstData[dstIdx + 3] = tempData.data[srcIdx + 3];
					}
				}
				this.ctx.putImageData(dst, magnifierX - magnifierRadius, cy - magnifierRadius);
			}

			this.ctx.restore();

			this.ctx.beginPath();
			this.ctx.arc(magnifierX, cy, magnifierRadius, 0, Math.PI * 2);
			this.ctx.strokeStyle = "#ff0000";
			this.ctx.lineWidth = Math.max(2, base * 0.008);
			this.ctx.stroke();

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
}
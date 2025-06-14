export type InputControl = { up: string, down: string };
export type InputState = { up: boolean, down: boolean };

export default class InputHandler {
	private inputLoopActive = false;
	private inputLoopRequestId: number | null = null;
	private lastInputState: string = '';
	private input: InputState[];

	private enterKeyPromise: Promise<void> | null = null;
	private resolveEnterKey: (() => void) | null = null;

	constructor(
		private controls: InputControl[],
		private sendPlayerInput: (input: InputState[]) => void
	) {
		this.input = controls.map(() => ({ up: false, down: false }));
		this.listenForPlayerInput();
	}

	public listenForPlayerInput() {
		const canvasElement = document.getElementById('game-canvas');
		if (!(canvasElement instanceof HTMLCanvasElement)) return;

		canvasElement.tabIndex = 0;
		canvasElement.style.outline = 'none';
		canvasElement.focus();

		const handleKey = (event: KeyboardEvent, keydown: boolean) => {
			let changed = false;
			this.controls.forEach((control, idx) => {
				if (event.key === control.up && this.input[idx].up !== keydown) {
					this.input[idx].up = keydown;
					changed = true;
					event.preventDefault();
				}
				if (event.key === control.down && this.input[idx].down !== keydown) {
					this.input[idx].down = keydown;
					changed = true;
					event.preventDefault();
				}
			});
			if (changed) {
				if (this.inputLoopActive) return;
				this.inputLoopActive = true;
				this.inputLoop();
			}
		};
		canvasElement.addEventListener('keydown', (e) => handleKey(e, true));
		canvasElement.addEventListener('keyup', (e) => handleKey(e, false));
	}

	private inputLoop = () => {
		const anyKeyPressed = this.input.some(input => input.up || input.down);
		const inputState = JSON.stringify(this.input);

		if (anyKeyPressed) {
			this.sendPlayerInput(this.input);
			this.lastInputState = inputState;
			this.inputLoopRequestId = window.requestAnimationFrame(this.inputLoop);
		} else {
			if (inputState !== this.lastInputState) {
				this.sendPlayerInput(this.input);
				this.lastInputState = inputState;
			}
			this.inputLoopActive = false;
			this.inputLoopRequestId = null;
		}
	};

	public async keyPressed(key: string = "Enter"): Promise<void> {
		if (this.enterKeyPromise) {
			const p = this.enterKeyPromise;
			this.enterKeyPromise = null;
			return p;
		}
		this.enterKeyPromise = new Promise<void>((resolve) => {
			const handler = (event: KeyboardEvent) => {
				if (event.key === key) {
					if (this.enterKeyPromise)
						console.log(`${key} key pressed once`);
					window.removeEventListener("keydown", handler);
					this.enterKeyPromise = null;
					resolve();
				}
			};
			window.addEventListener("keydown", handler);
		});
		return this.enterKeyPromise;
	}
}
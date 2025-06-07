import i18n from "../i18n/i18n";

type Mode = 'local' | 'online' | null;

class EmptyAlias extends Error {
	constructor() {
		const msg = i18n.t('game:alias.error.empty') ?? 'Empty alias error';
		super(msg);
		this.name = "EmptyAlias";
	}
}

class DuplicateAlias extends Error {
    constructor(alias: string) {
        const msg = i18n.t('game:alias.error.duplicate', { alias: alias }) ?? 'Duplicate alias error';
        super(msg);
        this.name = "DuplicateAlias";
    }
}

class InvalidAlias extends Error {
    constructor(alias: string) {
        const msg = i18n.t('game:alias.error.invalid', { alias: alias }) ?? 'Invalid alias error';
        super(msg);
        this.name = "InvalidAlias";
    }
}

type GameFormType = {
	mode: 'local' | 'online';
	alias: string[];
	onlineType?: '1v1' | 'tournament';
}

export default class GameForm {
	private dialogOverlay: HTMLDivElement | null;
	private dialog: HTMLDivElement | null;
	private form: HTMLFormElement | null;
	private modeSelection: HTMLDivElement | null;
	private canvas: HTMLCanvasElement | null;
	private headerBackgroundLayer: HTMLElement | null;
	private selectedMode: Mode = null;
	private blurObserver: MutationObserver | null = null;

	constructor() {
		this.dialogOverlay = document.getElementById('game-dialog-overlay') as HTMLDivElement | null;
		this.dialog = document.getElementById('game-dialog') as HTMLDivElement | null;
		this.form = document.getElementById('game-form') as HTMLFormElement | null;
		this.modeSelection = document.getElementById('mode-selection') as HTMLDivElement | null;
		this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
		this.headerBackgroundLayer = null;
		this.initialize();
	}

	private initialize() {
		const onDomReady = () => {
			this.dialogOverlay = document.getElementById('game-dialog-overlay') as HTMLDivElement;
			this.dialog = document.getElementById('game-dialog') as HTMLDivElement;
			this.form = document.getElementById('game-form') as HTMLFormElement;
			this.modeSelection = document.getElementById('mode-selection') as HTMLDivElement;
			this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
			this.headerBackgroundLayer = document.getElementById('header-background-layer') as HTMLElement | null;

			if (!this.dialogOverlay) {
				console.error('GameForm: game-dialog-overlay introuvable. Les effets de flou et de fond ne fonctionneront pas.');
				return;
			}
			this.applyInitialBlurState();
			this.setupDialogObserver();
		};

		if (document.readyState === 'loading') {
			window.addEventListener('DOMContentLoaded', onDomReady);
		} else {
			onDomReady();
		}
	}

	private applyInitialBlurState() {
		if (!this.dialogOverlay) return;

		if (getComputedStyle(this.dialogOverlay).display !== 'none') {
			if (this.canvas) {
				this.canvas.style.filter = 'blur(4px)';
			}
			if (this.headerBackgroundLayer) {
				this.headerBackgroundLayer.style.filter = 'blur(4px)';
				this.headerBackgroundLayer.classList.remove('bg-neutral-800');
				this.headerBackgroundLayer.classList.add('bg-neutral-900'); 
			}
			this.dialogOverlay.style.display = 'flex';
			this.dialogOverlay.style.opacity = '1';
		}
	}

	private setupDialogObserver() {
		if (!this.dialogOverlay) return;

		if (this.blurObserver) {
			this.blurObserver.disconnect();
		}

		this.blurObserver = new MutationObserver(() => {
			if (!this.dialogOverlay) return; 

			if (this.dialogOverlay.style.display === 'none') {
				if (this.canvas) {
					this.canvas.style.filter = '';
				}
				if (this.headerBackgroundLayer) {
					this.headerBackgroundLayer.style.filter = '';
					this.headerBackgroundLayer.classList.remove('bg-neutral-900');
					this.headerBackgroundLayer.classList.add('bg-neutral-800'); 
				}
			} else {
				if (this.canvas) {
					this.canvas.style.filter = 'blur(4px)';
				}
				if (this.headerBackgroundLayer) {
					this.headerBackgroundLayer.style.filter = 'blur(4px)';
					this.headerBackgroundLayer.classList.remove('bg-neutral-800');
					this.headerBackgroundLayer.classList.add('bg-neutral-900');
				}
			}
		});
		this.blurObserver.observe(this.dialogOverlay, { attributes: true, attributeFilter: ['style'] });
	}

	private showForm(mode: Mode) {
		const localForm = document.getElementById('local-form') as HTMLDivElement | null;
		const onlineForm = document.getElementById('online-form') as HTMLDivElement | null;
		
		if (!this.form || !localForm || !onlineForm) {
			console.error("GameForm: Éléments de formulaire manquants pour showForm.");
			return;
		}

		const onlineAlias = this.form.elements.namedItem('alias') as HTMLInputElement | null;
		const localAlias1 = this.form.elements.namedItem('alias1') as HTMLInputElement | null;
		const localAlias2 = this.form.elements.namedItem('alias2') as HTMLInputElement | null;

		if (mode === 'local') {
			localForm.classList.remove('hidden');
			onlineForm.classList.add('hidden');
			if (onlineAlias) onlineAlias.required = false;
			if (localAlias1) localAlias1.required = true;
			if (localAlias2) localAlias2.required = true;
		} else if (mode === 'online') {
			localForm.classList.add('hidden');
			onlineForm.classList.remove('hidden');
			if (onlineAlias) onlineAlias.required = true;
			if (localAlias1) localAlias1.required = false;
			if (localAlias2) localAlias2.required = false;
			setTimeout(() => {
				const btn1v1 = document.getElementById('btn-1v1') as HTMLButtonElement;
				const btnTournament = document.getElementById('btn-tournament') as HTMLButtonElement;
				const onlineType = this.form.querySelector('input[name="onlineType"]') as HTMLInputElement;
				if (btn1v1 && btnTournament && onlineType) {
					btn1v1.classList.remove('bg-zinc-600', 'bg-amber-400', 'hover:bg-zinc-500');
					btnTournament.classList.remove('bg-zinc-600', 'bg-amber-400', 'hover:bg-zinc-500');
					btn1v1.classList.add('bg-amber-400');
					btnTournament.classList.add('bg-zinc-600', 'hover:bg-zinc-500');
					onlineType.value = '1v1';

					btn1v1.onclick = () => {
						btn1v1.classList.remove('bg-zinc-600', 'bg-amber-400', 'hover:bg-zinc-500');
						btnTournament.classList.remove('bg-zinc-600', 'bg-amber-400', 'hover:bg-zinc-500');
						btn1v1.classList.add('bg-amber-400');
						btnTournament.classList.add('bg-zinc-600', 'hover:bg-zinc-500');
						onlineType.value = '1v1';
					};
					btnTournament.onclick = () => {
						btn1v1.classList.remove('bg-zinc-600', 'bg-amber-400', 'hover:bg-zinc-500');
						btnTournament.classList.remove('bg-zinc-600', 'bg-amber-400', 'hover:bg-zinc-500');
						btnTournament.classList.add('bg-amber-400');
						btn1v1.classList.add('bg-zinc-600', 'hover:bg-zinc-500');
						onlineType.value = 'tournament';
					};
				}
			}, 0);
		} else {
			localForm.classList.add('hidden');
			onlineForm.classList.add('hidden');
		}
	}

	private async checkAliasValidity(alias: string): Promise<{ valid: boolean, reason: string }> {
		try {
			const response = await fetch(`/api/game/check-alias?alias=${encodeURIComponent(alias)}`, {
				method: 'GET',
				headers: {
					'Accept': 'application/json'
				}
			});
			const result = await response.json();
			if (!response.ok || result.valid !== true) {
				console.log('Alias check failed:', result.reason);
				return { valid: false, reason: result.reason || 'Invalid alias' };
			}
			return { valid: true, reason: '' };
		} catch (err) {
			console.log('Alias check error:', err);
			return { valid: false, reason: 'Network error' };
		}
	}


	private async fillGameForm(): Promise<GameFormType | undefined> {
		if (!this.form) {
			console.error("GameForm: Formulaire non initialisé pour fillGameForm.");
			return;
		}
		let data: GameFormType;
		if (this.selectedMode === 'local') {
			const alias1 = (this.form.elements.namedItem('alias1') as HTMLInputElement)?.value;
			const alias2 = (this.form.elements.namedItem('alias2') as HTMLInputElement)?.value;

			if ((!alias1 || !alias2))
				throw new EmptyAlias();
			if (alias1 === alias2)
				throw new DuplicateAlias(alias1);

			const valid1 = await this.checkAliasValidity(alias1);
			if (!valid1.valid && valid1.reason !== "Alias already in use")
				throw new InvalidAlias(alias1);
			const valid2 = await this.checkAliasValidity(alias2);
			if (!valid2.valid && valid2.reason !== "Alias already in use")
				throw new InvalidAlias(alias2);

			data = { mode: 'local', alias: [alias1, alias2] };
		}
		else if (this.selectedMode === 'online')
		{
			const alias = (this.form.elements.namedItem('alias') as HTMLInputElement)?.value;
			const onlineType = (this.form.elements.namedItem('onlineType') as HTMLInputElement)?.value as '1v1' | 'tournament';
			const valid = await this.checkAliasValidity(alias);
			if (!alias)
				throw new EmptyAlias();
			if (!valid.valid && valid.reason === "Alias already in use")
				throw new DuplicateAlias(alias);
			if (!valid.valid && valid.reason !== "Alias already in use")
				throw new InvalidAlias(alias);
			data = { mode: 'online', alias: [alias], onlineType };
		}
		else
		{
			console.error('bad mode:', this.selectedMode);
			return;
		}

		return data;
	}

	private closeDialog() {
		if (!this.dialog || !this.dialogOverlay) {
			console.error("GameForm: Éléments de dialogue manquants pour closeDialog.");
			return;
		}
		this.dialog.classList.remove('animate-fade-in');
		this.dialog.classList.add('animate-fade-out');
		this.dialogOverlay.style.opacity = '1';
		setTimeout(() => {
			if (!this.dialogOverlay) return;
			this.dialogOverlay.style.opacity = '0';
			this.dialogOverlay.style.pointerEvents = 'none';
		}, 200);
		setTimeout(() => {
			if (!this.dialogOverlay) return;
			this.dialogOverlay.style.display = 'none';
		}, 500);
	}

	public getGameForm(): Promise<GameFormType> {
		return new Promise((resolve) => {
			if (!this.modeSelection) {
				console.error("GameForm: modeSelection non initialisé pour getGameForm.");
				return;
			}
			const localBtn = this.modeSelection.querySelector('#local-btn') as HTMLButtonElement;
			const onlineBtn = this.modeSelection.querySelector('#online-btn') as HTMLButtonElement;

			localBtn.classList.remove('bg-amber-400', 'bg-zinc-600', 'hover:bg-zinc-500');
			onlineBtn.classList.remove('bg-amber-400', 'bg-zinc-600', 'hover:bg-zinc-500');
			localBtn.classList.add('bg-zinc-600', 'hover:bg-zinc-500');
			onlineBtn.classList.add('bg-zinc-600', 'hover:bg-zinc-500');

			localBtn.onclick = () => {
				localBtn.classList.remove('bg-zinc-600', 'bg-amber-400', 'hover:bg-zinc-500');
				onlineBtn.classList.remove('bg-zinc-600', 'bg-amber-400', 'hover:bg-zinc-500');
				localBtn.classList.add('bg-amber-400');
				onlineBtn.classList.add('bg-zinc-600', 'hover:bg-zinc-500');
				this.selectedMode = 'local';
				this.showForm('local');
			};
			onlineBtn.onclick = () => {
				localBtn.classList.remove('bg-zinc-600', 'bg-amber-400', 'hover:bg-zinc-500');
				onlineBtn.classList.remove('bg-zinc-600', 'bg-amber-400', 'hover:bg-zinc-500');
				onlineBtn.classList.add('bg-amber-400');
				localBtn.classList.add('bg-zinc-600', 'hover:bg-zinc-500');
				this.selectedMode = 'online';
				this.showForm('online');
			};

			if (!this.form) {
				console.error("GameForm: Formulaire non initialisé pour l'événement onsubmit.");
				return;
			}
			this.form.onsubmit = async (e: SubmitEvent) => {
				e.preventDefault();
				try {
					const data = await this.fillGameForm();
					if (data) {
						this.closeDialog();
						resolve(data);
					}
				}
				catch (error) {
					if (error instanceof InvalidAlias) {
						alert(error.message + "\n" + i18n.t('game:alias.prerequisites'))
						return;
					} else if (error instanceof DuplicateAlias) {
						alert(error.message);
						return;
					} else {
						console.error('Unexpected error:', error);
						alert(i18n.t('common:error.unexpected'));
						return;
					}
				}
			};
		});
	}
}

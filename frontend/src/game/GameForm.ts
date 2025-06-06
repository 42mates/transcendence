import { GameFormType } from "../types/GameForm";
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

export default class GameForm {
	private dialogOverlay: HTMLDivElement;
	private dialog: HTMLDivElement;
	private form: HTMLFormElement;
	private modeSelection: HTMLDivElement;
	private canvas: HTMLCanvasElement;
	private selectedMode: Mode = null;

	constructor() {
		this.dialogOverlay = document.getElementById('game-dialog-overlay') as HTMLDivElement;
		this.dialog = document.getElementById('game-dialog') as HTMLDivElement;
		this.form = document.getElementById('game-form') as HTMLFormElement;
		this.modeSelection = document.getElementById('mode-selection') as HTMLDivElement;
		this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
		this.handleBackgroundBlur();
	}

	private showForm(mode: Mode) {
		const localForm = document.getElementById('local-form') as HTMLDivElement;
		const onlineForm = document.getElementById('online-form') as HTMLDivElement;
	
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
					btn1v1.onclick = () => {
						btn1v1.classList.add('bg-blue-700');
						btnTournament.classList.remove('bg-purple-700');
						onlineType.value = '1v1';
					};
					btnTournament.onclick = () => {
						btnTournament.classList.add('bg-purple-700');
						btn1v1.classList.remove('bg-blue-700');
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

			data = { mode: 'local', alias1, alias2 };
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
			data = { mode: 'online', alias, onlineType };
		}
		else
		{
			console.error('bad mode:', this.selectedMode);
			return;
		}

		return data;
	}

	private handleBackgroundBlur() {
		window.addEventListener('DOMContentLoaded', () => {
			this.canvas.style.filter = 'blur(6px)';
			this.dialogOverlay.style.display = 'flex';
			this.dialogOverlay.style.opacity = '1';
			const observer = new MutationObserver(() => {
				if (this.dialogOverlay.style.display === 'none') {
					this.canvas.style.filter = '';
				}
			});
			observer.observe(this.dialogOverlay, { attributes: true, attributeFilter: ['style'] });
		});
	}

	private closeDialog() {
		this.dialog.classList.remove('animate-fade-in');
		this.dialog.classList.add('animate-fade-out');
		this.dialogOverlay.style.opacity = '1';
		setTimeout(() => {
			this.dialogOverlay.style.opacity = '0';
			this.dialogOverlay.style.pointerEvents = 'none';
		}, 200);
		setTimeout(() => {
			this.dialogOverlay.style.display = 'none';
		}, 500);
	}

	public getGameForm(): Promise<GameFormType> {
		return new Promise((resolve) => {
			(this.modeSelection.querySelector('#local-btn') as HTMLButtonElement).onclick = () => {
				this.selectedMode = 'local';
				this.showForm('local');
			};
			(this.modeSelection.querySelector('#online-btn') as HTMLButtonElement).onclick = () => {
				this.selectedMode = 'online';
				this.showForm('online');
			};

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

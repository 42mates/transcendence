type UpdatePlayerParams = {
	alias?: string;
	score?: number;
	photoUrl?: string;
};

export function updatePlayerInfo(player: 1 | 2, { alias, score, photoUrl }: UpdatePlayerParams) {
	const aliasId = `alias-player${player}`;
	const scoreId = `score-player${player}`;
	const avatarId = `avatar-player${player}`;

	if (alias !== undefined) {
		const aliasElem = document.getElementById(aliasId);
		if (aliasElem) aliasElem.textContent = alias;
	}

	if (score !== undefined) {
		const scoreElem = document.getElementById(scoreId);
		if (scoreElem) scoreElem.textContent = score.toString();
	}

	if (photoUrl !== undefined) {
		const avatarElem = document.getElementById(avatarId) as HTMLImageElement | null;
		if (avatarElem) avatarElem.src = photoUrl;
	}
}

export function getPlayerPhoto(): string {
	const photo = localStorage.getItem("picture");
	return photo ? photo : "/assets/default_avatar1.png";
}

// Enhanced key binding detection based on keyboard layout and user settings
export function getKeyBindings(): { up: string, down: string } {
	const layoutMap: Record<string, { up: string, down: string }> = {
		'fr': { up: 'z', down: 's' },      // AZERTY
		'de': { up: 'w', down: 's' },      // QWERTZ
		'es': { up: 'w', down: 's' },      // QWERTY (Spain)
		'it': { up: 'w', down: 's' },      // QWERTY (Italy)
		'ru': { up: 'ц', down: 'ы' },      // Russian JCUKEN
		'tr': { up: 'w', down: 's' },      // Turkish Q
		'pl': { up: 'w', down: 's' },      // Polish QWERTY
		'pt': { up: 'w', down: 's' },      // Portuguese QWERTY
		'en': { up: 'w', down: 's' },      // English QWERTY
	};

	// Try to use the Keyboard API if available for more accurate detection
	// (Note: This API is not supported in all browsers)
	// @ts-ignore
	if (navigator.keyboard && navigator.keyboard.getLayoutMap) {
		// This is async, so for now we fallback to language-based detection
	}

	const lang = (navigator.language || '').toLowerCase();
	const langPrefix = lang.split('-')[0];

	let player1: { up: string, down: string } = layoutMap['en']; // Default QWERTY
	for (const key in layoutMap) {
		if (lang.startsWith(key) || langPrefix === key) {
			player1 = layoutMap[key];
			break;
		}
	}

	// Allow user override via localStorage (optional)
	const userBindings = localStorage.getItem('player1KeyBindings');
	if (userBindings) {
		try {
			const parsed = JSON.parse(userBindings);
			if (parsed.up && parsed.down) {
				player1 = parsed;
			}
		} catch (e) {}
	}

	return player1;
}

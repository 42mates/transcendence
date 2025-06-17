let enterKeyPromise: Promise<void> | null = null;

export function waitForEnterKey(): Promise<void> {
	if (enterKeyPromise) return enterKeyPromise;
	enterKeyPromise = new Promise((resolve) => {
		const handler = (event: KeyboardEvent) => {
			if (event.key === "Enter") {
				window.removeEventListener("keydown", handler);
				resolve();
			}
		};
		window.addEventListener("keydown", handler);
	});
	return enterKeyPromise;
}
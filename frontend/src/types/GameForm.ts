export type GameFormType =
	| {
			mode: 'local';
			alias1: string;
			alias2: string;
		}
	| {
			mode: 'online';
			alias: string;
			onlineType: '1v1' | 'tournament';
		};

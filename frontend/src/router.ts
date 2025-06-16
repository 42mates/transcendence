import { initLogin } from './routes/login';
import { initDemo } from './routes/demo';
import { initHome } from './routes/home';
import { initGame } from './routes/game';

import { translateDOM } from './i18n/i18n';
import {initGoogleAuth, loadGoogleSignInScript, setupLogoutButton} from './googleAuth/initAuth';

export async function loadRoute(path: string) {
	const app = document.getElementById('app');
	if (!app) return;

	const routePath = path === '/' ? '/home' : path;

	try {
		const res = await fetch(`/templates${routePath}.html`);
		if (!res.ok) throw new Error('Not found');
		const html = await res.text();
		app.innerHTML = html;

		translateDOM();

		if (routePath === '/login') initLogin();
		else if (routePath === '/demo') initDemo();
		else if (routePath === '/home') initHome();
		else if (routePath === '/game') initGame();
		else throw new Error('Route not implemented');

	} catch (err) {
		app.innerHTML = 
		`<main class="grid min-h-full place-items-center bg-neutral-800 px-6 py-24 sm:py-32 lg:px-8">
			<div class="text-center">
				<p class="text-base text-amber-400">
					404
				</p>
				<h1 class="mt-4 text-5xl tracking-tight text-balance text-amber-400 sm:text-7xl" data-i18nkey="common:error:titel404">
					Page not found
				</h1>
				<p class="mt-6 text-lg font-medium text-pretty text-white sm:text-xl/8" data-i18nkey="common:error:text404">
					Sorry, we couldn’t find the page you’re looking for.
				</p>
				<div class="mt-10 flex items-center justify-center gap-x-6">
					<button data-link="/" data-spa class="px-6 py-3 bg-amber-400 text-white rounded-lg hover:bg-amber-500 transition-colors" data-i18nkey="common:error:backhome">
						Go back home
					</button>
				</div>
			</div>
		</main>`;
		translateDOM();
	}
}

export async function googleSignIn(){
	initGoogleAuth();
}

async function googleSignOut(){
	
}
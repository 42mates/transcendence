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
		app.innerHTML = `<main class="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
  <div class="text-center">
    <p class="text-base text-indigo-600">404</p>
    <h1 class="mt-4 text-5xl tracking-tight text-balance text-gray-900 sm:text-7xl">Page not found</h1>
    <p class="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">Sorry, we couldn’t find the page you’re looking for.</p>
    <div class="mt-10 flex items-center justify-center gap-x-6">
      <a href="/" class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Go back home</a>
    </div>
  </div>
</main>`;
	}
}

export async function googleSignIn(){
	initGoogleAuth();
}

async function googleSignOut(){
	
}
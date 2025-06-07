import { loadGoogleSignInScript, setupLogoutButton } from '../googleAuth/initAuth';"../googleAuth";
import { googleSignIn } from '../router'

export function initHome() {
    const langButton = document.getElementById("langButton");
    const langMenu = document.getElementById("langMenu");
    
    if (langButton && langMenu) {
        langButton.addEventListener("click", (e: Event) => {
            e.stopPropagation();
            langMenu.classList.toggle("hidden");
        });

        const langButtons = document.querySelectorAll('[id^="changeLangButton-"]');
        langButtons.forEach(function (button) {
            button.addEventListener("click", function (this: HTMLElement, e: Event) {
                e.preventDefault();
                const lang = this.getAttribute('data-lang');
                if (lang) {
                    const langName = this.textContent?.trim();
                    console.log(`Changing language to: ${langName} (${lang})`);
                    langMenu.classList.add("hidden");
                }
            });

            const svg = button.querySelector('svg');
            if (svg) {
                svg.addEventListener("click", function (e: Event) {
                    e.stopPropagation();
                    const parentButton = this.closest('[data-lang]') as HTMLElement;
                    if (parentButton) {
                        parentButton.click();
                    }
                });
            }
        });

        document.addEventListener("click", (e: Event) => {
            const target = e.target as HTMLElement;
            if (!langMenu.contains(target) && !langButton.contains(target)) {
                langMenu.classList.add("hidden");
            }
        });
    }

    loadGoogleSignInScript();
    document.getElementById('loginButton')!.addEventListener('click', googleSignIn);

    console.log('Home page loaded');
}

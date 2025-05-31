export function initHome() {
    const langButton = document.getElementById("langButton");
    const langMenu = document.getElementById("langMenu");
    
    if (langButton && langMenu) {
        // Gestion du clic sur le bouton
        langButton.addEventListener("click", (e: Event) => {
            e.stopPropagation();
            langMenu.classList.toggle("hidden");
        });

        // Gestion des clics sur les boutons de langue
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

        // Fermeture du menu en cliquant ailleurs
        document.addEventListener("click", (e: Event) => {
            const target = e.target as HTMLElement;
            if (!langMenu.contains(target) && !langButton.contains(target)) {
                langMenu.classList.add("hidden");
            }
        });
    }

    console.log('Home page loaded');
}


// // Lorsqu'on change de langue
// function changeLang(lang: string) {
//   i18next.changeLanguage(lang, () => {
//     updateContent();
//     langMenu?.classList.add("hidden"); // ferme après sélection
//   });
// }

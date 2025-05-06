export function initHome() {
	// Ouvre/ferme le menu manuellement
	const langButton = document.getElementById("langButton");
	const langMenu = document.getElementById("langMenu");
	
	langButton?.addEventListener("click", (e) => {
	  e.stopPropagation(); // Empêche de propager jusqu'à body
	  langMenu?.classList.toggle("hidden");
	});
	
	// Ferme le menu si on clique en dehors
	document.addEventListener("click", (e) => {
	  const target = e.target as HTMLElement;
	  if (!langMenu?.contains(target) && !langButton?.contains(target)) {
		langMenu?.classList.add("hidden");
	  }
	});
	// document.getElementById('langButton')?.addEventListener('click', () => {
	// 	const menu = document.getElementById('langMenu');
	// 	menu?.classList.toggle('hidden');
	//   });
	console.log('Home page loaded');
}


// // Lorsqu'on change de langue
// function changeLang(lang: string) {
//   i18next.changeLanguage(lang, () => {
//     updateContent();
//     langMenu?.classList.add("hidden"); // ferme après sélection
//   });
// }

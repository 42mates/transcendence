import { Game } from "./vars/game.class.js";

let game = new Game();
requestAnimationFrame(game.gameLoop);

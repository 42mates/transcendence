import Database from 'better-sqlite3';
import { User } from "../join/User";
import { sanitizeAlias } from "../join/alias";

const db = new Database(process.env.DB_PATH!);

db.prepare(`
	CREATE TABLE IF NOT EXISTS connected_users (
		alias TEXT PRIMARY KEY,
		game_mode TEXT,
		status TEXT
	)
`).run();

db.prepare("DELETE FROM connected_users").run();
// console.log("Flushed connected_users table on server startup.");

export function addConnectedUserToDB(user: User) {
	const safeAlias = sanitizeAlias(user.alias);
	if (!safeAlias) {
		console.error("Attempted to add invalid alias to DB:", user.alias);
		return;
	}
	try {
		const stmt = db.prepare(
			"INSERT OR REPLACE INTO connected_users (alias, game_mode, status) VALUES (?, ?, ?)"
		);
		stmt.run(safeAlias, user.gameMode, user.status);
	} catch (err) {
		console.error("DB error in addConnectedUserToDB:", err);
	}
}

export function removeConnectedUserFromDB(alias: string) {
	const safeAlias = sanitizeAlias(alias);
	const stmt = db.prepare(
		"DELETE FROM connected_users WHERE alias = ?"
	);
	stmt.run(safeAlias);
}
# WebSocket Protocol - Transcendence

## [Client → Server]

### 1. join_request
```json
{
	"type": "join_request",
	"payload": {
		"alias": "pongMaster42",
		"mode": "1v1" | "tournament" | "local",
		"gameId": null
	}
}
```

### 2. player_input
```json
{
	"type": "player_input",
	"playerId": "abc123",
	"input": {
		"up": true,
		"down": false
	}
}
```

---

## [Server → Client]

### 1. join_response
```json
{
	"type": "join_response",
	"status": "accepted" | "rejected",
	"playerId": "abc123",
	"gameId": "game456",
	"reason": null,
	"bracket": {
		"game1": { "id": "g1", "players": ["p1", "p2"], "status": "pending" | "finished", "winner": "p1", "loser": "p2" },
		"game2": { "id": "g2", "players": ["p3", "p4"], "status": "pending" | "finished", "winner": "p3", "loser": "p4" },
		"game3": { "id": "g3", "players": ["w1", "w2"], "status": "pending" | "waiting" | "finished", "winner": "w1", "loser": "w2" },
		"game4": { "id": "g4", "players": ["l1", "l2"], "status": "pending" | "waiting" | "finished", "winner": "l1", "loser": "l2" }
	}
}
```
> `bracket` is only present for tournament mode.

### 2. game_state
```json
{
	"type": "game_state",
	"ball": { "x": 400, "y": 300 },
	"paddles": [
		{ "x": 50, "y": 280 },
		{ "x": 750, "y": 280 }
	],
	"score": [3, 5],
	"status": "running" | "ended"
}
```

---

## Fields and values

- `mode`: `"1v1" | "tournament" | "local"`
- `status` (join_response): `"accepted" | "rejected"`
- `status` (game_state): `"running" | "ended"`
- `bracket`: Tournament bracket structure for tournaments, with games and their statuses.
- `playerId`, `gameId`: `string | null`
- `reason`: `string | null`

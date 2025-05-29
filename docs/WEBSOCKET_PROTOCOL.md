# WebSocket Protocol - Transcendence

## [Client → Server]

### 1. join_request
```json
{
  "type": "join",
  "payload": {
    "alias": "pongMaster42",
    "mode": "1v1" | "tournament" | "local", // or "practice", "ai"
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
  "status": "accepted", 
  "playerId": "abc123",
  "gameId": "game456",
  "reason": null
}
```

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
  "status": "running"
}
```

---

## Fields and values

- `mode`: `"1v1", "tournament", "local"`
- `status`: `"running" | "ended"`

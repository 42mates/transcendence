# Transcendence

A full-stack, microservices-based Pong game with local, online, and tournament modes. Built for 42 school using modern web technologies.

---

## Tech Stack

- **Backend:** Node.js, TypeScript, Fastify, SQLite, REST API, WebSocket, HTTPS (TLS per service)
- **Frontend:** Vite, TypeScript, Tailwind CSS, i18next (multi-language), Google Sign-In
- **Infrastructure:** Docker Compose, ELK stack (Elasticsearch, Logstash, Kibana) for logging
- **Architecture:** Microservices (auth, game, frontend), secure inter-service communication

---

## Features

🎮 **Pong Game Modes**  
- Play solo on your keyboard (W/S & Arrow keys)
- Challenge friends online in real time
- Join exciting 4-player tournaments (2 rounds, bracket style)

🌐 **Remote Multiplayer:** All game logic runs securely on the server. Remote players only send their input—no game state is trusted from the client, ensuring fair and synchronized gameplay.

🔐 **Seamless Authentication:** Secure sign-in with a Google account

🔗 **REST API & CLI:** Interact with the game state via REST API. CLI integration available (experimental)

📊 **Centralized Logging:** All logs flow into the ELK stack for easy monitoring

💾 **Persistent Storage:** Game data is safely stored in SQLite.

🌍 **Multi-language Support.** Enjoy the interface in 4 languages (**_en_**/**_es_**/**_fr_**/**_kr_**) with i18next

🌐 **Browser Compatibility:** Works great on Chrome, Firefox, and Chromium-based browsers

🔒 **End-to-End Security:** All connections (even between containers) use HTTPS with unique TLS certificates per service (`/certs`)

---

## Quick Start

**Dependencies:**  
- `make`
- `docker compose`
- **Google Sign-In:** You must specify your Google OAuth client ID in the `.env` file as `VITE_GOOGLE_AUTH_CLIENT_ID`.

**Run the project:**
```bash
make
# or `make light` for a lighter version (no ELK stack, low RAM usage)
```

---

## Authors

- Amine El Malti - [@ael-malt](https://github.com/ael-malt)
- Hugo Vercell - [@hugoover](https://github.com/hugoover)
- Marin Becker - [@marinsucks](https://github.com/marinsucks)
- Raphael Tisserand - [@RaphaelTisserand](https://github.com/RaphaelTisserand)
- Sumi Seo - [@SumiSeo](https://github.com/SumiSeo)

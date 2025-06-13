# Transcendence
Transcendence is a full-stack, single-page web app for the classic Pong game, built as part of the 42 school curriculum by [@ael-malt](https://github.com/ael-malt), [@hugoover](https://github.com/hugoover), [@marinsucks](https://github.com/marinsucks), [@Raphael-Tisserand](https://github.com/Raphael-Tisserand), and [@SumiSeo](https://github.com/SumiSeo).

---

## Features

- **TypeScript Frontend** with Tailwind CSS for a modern, responsive UI
- **Fastify Backend** (Node.js) for high-performance APIs and WebSocket support
- **ELK Stack** (Elasticsearch, Logstash, Kibana) for centralized logs and monitoring
- *erver-side Pong Engine**](./erver-side Pong Engin):
 real-time game logic over HTTPS/WSS
- **Google Authentication** for secure login
- **Multi-language support** (English, French, Spanish, Korean)
- *icroservices Architecture**](./icroservices Architectur):
 each service runs in its own container
- **SQLite Database** for persistent storage
- *ull HTTPS/WSS**](./ull HTTPS/WS):
 all services run securely out-of-the-box

---

## Quickstart

### Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- Make sure you have `make` installed
- A Google Client ID token for Google Sign-In (create one in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials))


### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/42mates/transcendence.git
   cd transcendence
   ```

2. **Configure environment:**
   ```bash
   cp example.env .env
   # Edit .env to set your DOMAIN, HTTPS_PORT, and other secrets
   ```

3. **Build and run everything:**
   ```bash
   make
   # Or for a lighter version (no ELK stack):
   make light
   ```

4. **Access the app:**
   - Open [https://localhost:443](https://localhost:443) in your browser

---

## Architecture

- [frontend/](./frontend): SPA (Vite, TypeScript, Tailwind, i18n)
- [services/auth/](./services/auth): Authentication microservice (Fastify, SQLite)
- [services/game/](./services/game): Matchmaking and game engine (Fastify, WebSockets)
- [nginx/](./nginx): Reverse proxy
- [elk/](./elk): Logstash & Kibana configs for log aggregation
- [certs/](./certs): SSL certificates for all services
- [scripts/](./scripts): Init scripts for SSL, DB and ELK

---

## Development

- **Install dependencies:**
  ```bash
  make node
  ```
- **Run only the frontend (dev mode):**
  ```bash
  cd frontend
  npm run dev
  ```
- **Rebuild everything:**
  ```bash
  make re
  ```
- **Clean up containers, volumes, and build artifacts:**
  ```bash
  make fclean
  ```

---

## Authors

- [@ael-malt](https://github.com/ael-malt)
- [@hugoover](https://github.com/hugoover)
- [@marinsucks](https://github.com/marinsucks)
- [@Raphael-Tisserand](https://github.com/Raphael-Tisserand)
- [@SumiSeo](https://github.com/SumiSeo)

---

## License

MIT License – see [LICENSE](LICENSE) for details.
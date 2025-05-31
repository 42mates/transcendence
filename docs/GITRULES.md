# 🛠️ Git Workflow - Transcendence

> Tout le développement se fait sur la branche `dev`.  
> La branche `main` est réservée à la version de production (version stable).

---

## 🧭 Convention de nommage des branches

Format: **`[type]`/`[scope]`-`[description]`**

## Types:  
- `feat`: ajout d'une fonctionnalité
- `fix`: correction d'un bug
- `chore`: mise à jour de dépendances, réorganisation du code, etc.
- `test`: ajout de tests
- ...

## Exemples

- `feat/auth-login` → ajoute un système de login
- `chore/project-structure` → crée la structure de base du projet
- `fix/pong-score-update` → corrige un bug sur le score de Pong
- `docs/api-spec` → rédige la doc de l'API
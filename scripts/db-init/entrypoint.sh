#!/bin/sh

if sqlite3 /data/database.sqlite < ./sqlite.sql; then
	echo "✅ SQLite database initialized"
else
	echo "❌ Failed to initialize SQLite database"
	exit 1
fi

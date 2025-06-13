#!/bin/bash

CERT_DIR="./certs"

SERVICES=(	"nginx"
			"frontend"
			"auth"
			"game" 
			"kibana"
			"logstash" 
			"elasticsearch" )

# Generate a self-signed certificate for each service
for SERVICE in "${SERVICES[@]}"; do
	mkdir -p $CERT_DIR/$SERVICE
	if [ ! -f "$CERT_DIR/$SERVICE/$SERVICE.key" ] || [ ! -f "$CERT_DIR/$SERVICE/$SERVICE.crt" ]; then
		openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
			-keyout $CERT_DIR/$SERVICE/$SERVICE.key \
			-out $CERT_DIR/$SERVICE/$SERVICE.crt \
			-subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=${SERVICE}/UID=transcendence" \
			2> /dev/null
		echo "Generated SSL certificate for $SERVICE"
	fi
	chmod 644 $CERT_DIR/$SERVICE/$SERVICE.key
	echo "Set rw-r--r-- for $SERVICE.key"
done

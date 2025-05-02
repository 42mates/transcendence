FROM nginx:alpine

# Install OpenSSL for generating SSL certificates
RUN apk add --no-cache openssl apache2-utils

# Create directories for SSL certificates
RUN mkdir -p /etc/ssl/certs /etc/ssl/private

# Generate a self-signed SSL certificate
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
	-keyout /etc/ssl/private/transcendence.key \
	-out /etc/ssl/certs/transcendence.crt \
	-subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=${DOMAIN}/UID=transcendence"

# Copy NGINX configuration files
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/

# Create an .htpasswd file with a default user and password
ARG ELK_USER
ARG ELK_PASSWORD
RUN htpasswd -bc /etc/nginx/.htpasswd ${ELK_USER} ${ELK_PASSWORD}

# Expose ports for HTTP and HTTPS
EXPOSE 443

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]

FROM nginx:alpine

# Install OpenSSL for generating SSL certificates
RUN apk add --no-cache openssl

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

## Copy frontend build files
#COPY /frontend/dist /var/www/html

# Expose ports for HTTP and HTTPS
EXPOSE 80 443

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]

# Use the official Logstash image
FROM docker.elastic.co/logstash/logstash:8.10.2

# Switch to root user to install dependencies
USER root

# Install netcat
RUN apt-get update && \
	apt-get install -y netcat && \
	apt-get clean

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Switch back to the logstash user
USER logstash

COPY logstash.conf /usr/share/logstash/pipeline/logstash.conf

CMD [ "entrypoint.sh" ]

HEALTHCHECK --interval=5s --retries=10 CMD \
	grep '"message":"logstash healthcheck ok"' /var/log/healthcheck.json
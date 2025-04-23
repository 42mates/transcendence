#!/bin/bash

# Start Logstash in the background
echo "Starting Logstash..."
/usr/share/logstash/bin/logstash &
LOGSTASH_PID=$!

# Wait for the health check to succeed
echo "Checking the availability of dependencies..."

mkdir -p ~/log/
touch ~/log/healthcheck.json

checkElasticSearch(){
	echo '{"message":"logstash healthcheck ok"}' | nc -w 1 localhost 5044
	curl -s -X GET "http://elasticsearch:9200/docker-*/_search" > ~/log/healthcheck.json	
	grep '"message":"logstash healthcheck ok"' ~/log/healthcheck.json
	return $?
}

while true; do
	# Check if Elasticsearch is ready
	checkElasticSearch
	if [ $? -eq 0 ]; then
		echo "Elasticsearch is ready."
		break
	else
		echo "Waiting for Elasticsearch..."
		sleep 5
	fi
done

# Replace this script with the Logstash process
echo "Replacing script with Logstash process..."
exec $LOGSTASH_PID
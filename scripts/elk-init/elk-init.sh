#!/bin/sh
retries=0
max_retries=20

while ! nc -z logstash 5044; do
	if [ "$retries" -ge "$max_retries" ]; then
		echo "Max retries reached. Logstash port 5044 did not open on time."
		exit 1
	fi
	echo "Waiting for Logstash port 5044 to open... (Attempt: $((retries + 1)))"
	retries=$((retries + 1))
	sleep 1
done

for i in $(seq 1 "$max_retries"); do
	rfc5424_message="<14>1 $(date -u +"%Y-%m-%dT%H:%M:%SZ") $(hostname) elk-init 12345 ID42 - sending log test ${i}"
	echo "$rfc5424_message" | nc logstash 5044
	if curl -kqX GET "http://elasticsearch:9200/_search?q=event.original:sending%20log%20test&pretty" 2>/dev/null | \
		grep -q '"original" : ".*sending log test.*"'; then
		echo "Log found in Elasticsearch"
		break
	else
		echo "Log not found in Elasticsearch"
	fi
	sleep 1
done


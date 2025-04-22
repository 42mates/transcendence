echo '{"message":"logstash healthcheck"}' | nc -w 1 localhost 8044 && \
curl -s -X GET "http://localhost:8200/docker-*/_search" | \
grep -q '"message":"logstash healthcheck"'
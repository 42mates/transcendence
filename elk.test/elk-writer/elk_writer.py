import time
import json
import socket

LOGSTASH_HOST = "logstash"
LOGSTASH_PORT = 5044

messages = [
	"Hello, ELK!",
	"This is a test log.",
	"ELK stack is working perfectly.",
	"Sending logs every second.",
	"Final test message."
]


if __name__ == "__main__":
	i = 0
	while True:
		for msg in messages:
			print(f"{i}: {msg}")
			i += 1
			time.sleep(1)

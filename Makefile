all: run

run:
	docker build . -t cards-ai-front
	docker run -p 8000:80 cards-ai-front

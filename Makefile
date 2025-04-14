# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mbecker <mbecker@student.42.fr>            +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/04/06 21:30:49 by mbecker           #+#    #+#              #
#    Updated: 2025/04/14 13:12:44 by mbecker          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

NAME =	transcendence

COMPOSE =	docker compose

MODULES =	frontend \
			services/auth \
			services/game

DATABASE =	data

ENV =		.env

# Enable Docker Compose bake, for faster builds
export COMPOSE_BAKE=true

all: $(NAME)

$(NAME): $(DATABASE) $(ENV) 
	@echo "$(YELLOW)Building $(BYELLOW)$(NAME)$(YELLOW)...$(RESET)"
	$(COMPOSE) up --build

$(DATABASE):
	@mkdir -p $(DATABASE)

$(ENV):
	@echo "$(YELLOW)No .env file found. Copying $(BYELLOW)example.env$(YELLOW) to $(BYELLOW).env$(RESET)";
	@cp example.env .env;
	@if [ -f .env ]; then \
		echo "$(YELLOW)Please edit the $(BYELLOW).env$(YELLOW) file to set your environment variables.$(RESET)"; \
	else \
		echo "$(RED)Failed to copy $(BRED)example.env$(RED) to $(BRED).env$(RESET)"; \
		exit 1; \
	fi

up: env
	$(COMPOSE) up

build: env
	$(COMPOSE) build

down:
	$(COMPOSE) down

restart: down up

clean:
	$(COMPOSE) down --volumes --remove-orphans

nodeclean:
	@for module in $(MODULES); do \
		echo "$(RED)Cleaning $(BRED)$$module$(RED)...$(RESET)"; \
		toclean=$$(ls $$module | grep -E 'node_modules|dist|build|package-lock.json'); \
		if [ -n "$$toclean" ]; then \
			for item in $$toclean; do \
				echo $$item; \
				rm -rf $$module/$$item; \
			done; \
		else \
			echo "$(YELLOW)No files to clean in $(BYELLOW)$$module$(YELLOW)...$(RESET)"; \
		fi; \
	done


fclean: clean nodeclean
	@echo "$(RED)Removing $(BRED)containers$(RED)...$(RESET)"
	@$(COMPOSE) rm -f
	@if [ -n "$$(docker volume ls -q)" ]; then \
		echo "$(RED)Removing $(BRED)project volumes$(RED)...$(RESET)"; \
		docker volume rm $$(docker volume ls -q); \
	fi
	@echo "$(RED)Removing $(BRED)database$(RED)...$(RESET)"
	@rm -rf $(DATABASE)

re: fclean all

deepclean:
	@echo "$(BYELLOW)Warning: This will remove all Docker containers, images, volumes, and networks!$(RESET)"
	@read -p "Are you sure you want to proceed? (y/N): " confirm && [ "$$confirm" = "y" ] && \
	docker system prune -a --volumes -f || \
	echo "$(RED)Aborted.$(RESET)"

.PHONY: all env up down restart clean fclean re

# INSTALL LOCAL NPM PACKAGES
dev:
	@echo "$(MAGENTA)Installing local npm packages...$(RESET)"
	@for module in $(MODULES); do \
		echo "$(MAGENTA)Installing $(BMAGENTA)$$module$(MAGENTA)...$(RESET)"; \
		cd $$module && npm install && cd -; \
	done

# COLORS
RED = \033[0;31m
BRED = \033[1;31m
GREEN = \033[0;32m
BGREEN = \033[1;32m
YELLOW = \033[0;33m
BYELLOW = \033[1;33m
BLUE = \033[0;34m
BBLUE = \033[1;34m
MAGENTA = \033[0;35m
BMAGENTA = \033[1;35m
CYAN = \033[0;36m
BCYAN = \033[1;36m
WHITE = \033[0;37m
BWHITE = \033[1;37m
RESET = \033[0m

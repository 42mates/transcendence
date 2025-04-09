# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mbecker <mbecker@student.42.fr>            +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/04/06 21:30:49 by mbecker           #+#    #+#              #
#    Updated: 2025/04/09 16:20:12 by mbecker          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

NAME =	transcendence

COMPOSE =	docker compose

MODULES =	frontend \
			services/auth \
			services/game

DATABASE =	sqlite/data

all: $(NAME)

$(NAME): $(DATABASE) env
	@echo "$(YELLOW)Building $(BYELLOW)$(NAME)$(YELLOW)...$(RESET)"
	@export COMPOSE_BAKE=true; $(COMPOSE) up --build
#	@$(COMPOSE) up --build

$(DATABASE):
	@mkdir -p $(DATABASE)

env:
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)No .env file found. Copying $(BYELLOW)example.env$(YELLOW) to $(BYELLOW).env$(RESET)"; \
		cp example.env .env; \
		if [ -f .env ]; then \
			echo "$(YELLOW)Please edit the $(BYELLOW).env$(YELLOW) file to set your environment variables.$(RESET)"; \
		else \
			echo "$(RED)Failed to copy $(BRED)example.env$(RED) to $(BRED).env$(RESET)"; \
			exit 1; \
		fi \
	fi

up: env
	$(COMPOSE) up

down:
	$(COMPOSE) down

restart: down up

clean:
	$(COMPOSE) down --volumes --remove-orphans

nodeclean:
	@for module in $(MODULES); do \
		echo "$(RED)Cleaning $(BRED)$$module$(RED)...$(RESET)"; \
		find $$module/node_modules $$module/package-lock.json $$module/builds dist -print -exec rm -rf {} +; \
	done

fclean: clean nodeclean
	@echo "$(RED)Removing $(BRED)containers$(RED)...$(RESET)"
	@$(COMPOSE) rm -f
	@echo "$(RED)Removing $(BRED)volumes$(RED)...$(RESET)"
	@docker volume rm $$(docker volume ls -q)
	@echo "$(RED)Removing $(BRED).env$(RED)...$(RESET)"
	@rm -f .env


deepclean:
	@echo "$(BYELLOW)Warning: This will remove all Docker containers, images, volumes, and networks!$(RESET)"
	@read -p "Are you sure you want to proceed? (y/N): " confirm && [ "$$confirm" = "y" ] && \
	docker system prune -a --volumes -f || \
	echo "$(RED)Aborted.$(RESET)"

.PHONY: all env up down restart clean


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

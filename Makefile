# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mbecker <mbecker@student.42.fr>            +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/04/06 21:30:49 by mbecker           #+#    #+#              #
#    Updated: 2025/04/07 17:53:25 by mbecker          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

NAME = transcendence

COMPOSE = docker compose

VOLUMES = volumes/frontend_build

all: env $(NAME)

$(NAME): env
	@mkdir -p $(VOLUMES)
	@echo "$(YELLOW)Building $(BYELLOW)$(NAME)$(YELLOW)...$(RESET)"
	@export COMPOSE_BAKE=true; $(COMPOSE) up --build
#	@$(COMPOSE) up --build

env:
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Copying $(BYELLOW)example.env$(YELLOW) to $(BYELLOW).env$(RESET)"; \
		cp example.env .env; \
	fi

up: env
	$(COMPOSE) up

down:
	$(COMPOSE) down

restart: down up

clean:
	$(COMPOSE) down --volumes --remove-orphans

fclean: clean
	@echo "$(RED)Removing $(BRED)$(NAME)$(RED)...$(RESET)"
	@$(COMPOSE) rm -f
	@echo "$(RED)Removing $(BRED)volumes$(RED)...$(RESET)"
#	@docker volume rm $(VOLUMES)
	@rm -rf $(VOLUMES)
	@echo "$(RED)Removing $(BRED).env$(RED)...$(RESET)"
	@rm -f .env
	@echo "$(RED)Removing $(BRED)builds$(RED)...$(RESET)"
	@rm -rf */build */node_modules */*/node_modules

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

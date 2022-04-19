APP_NAME=if-then-server
APP_DIR=/${APP_NAME}
DOCKER_BASE_IMAGE=node:14.17
PORT?=3001
COMMAND?=bash

start:
	@make docker-command COMMAND='yarn start'

docker-command: remove-containers
	@docker run -it -v $(shell pwd):${APP_DIR} -w ${APP_DIR} \
		--env-file .env --env PORT=${PORT} -p ${PORT}:${PORT} \
		--name ${APP_NAME} ${DOCKER_BASE_IMAGE} bash -c "${COMMAND}"

remove-containers:
ifneq ($(shell docker ps -a --filter "name=${APP_NAME}" -aq 2> /dev/null | wc -l | bc), 0)
	@echo "\e[1m\033[33mRemoving containers\e[0m"
	@docker ps -a --filter "name=${APP_NAME}" -aq | xargs docker rm -f
endif

remove-images:
ifneq ($(shell docker images -a alloycard/${APP_NAME}* -q 2> /dev/null | wc -l | bc), 0)
	@echo "\e[1m\033[33mRemoving images\e[0m"
	@docker images -a alloycard/${APP_NAME}* -aq | xargs docker image rm -f
endif

ip:
	@docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${APP_NAME}

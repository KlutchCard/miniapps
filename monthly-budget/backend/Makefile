MYSQL_NAME?=mysql
MYSQL_IMAGE=mysql:8.0
MYSQL_PASSWORD=xpto
MYSQL_VOLUME_PATH?=/home/database/mysql/data
APP_NAME=monthly-budget-manager
APP_DIR = /${APP_NAME}/src
PORT=3002
DOCKER_BASE_IMAGE=node:14.18
DOCKER_IMAGE=miniapps/monthly-budget-manager
DOCKER_REMOTE_REPOSITORY=victorbarros1130/miniapp-monthly-budget-manager
TAG_VERSION?=0.0.1

mysql:
	@echo "\e[1m\033[33mStarting MySQL on port 3306\e[0m"
	@docker run -p 3306:3306 --name ${MYSQL_NAME} \
		-v ${MYSQL_VOLUME_PATH}:/var/lib/mysql \
		-e MYSQL_ROOT_PASSWORD="${MYSQL_PASSWORD}" \
		-d ${MYSQL_IMAGE}

ip:
	@echo ${MYSQL_NAME}
	@docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${MYSQL_NAME}
	@echo ${APP_NAME}
	@docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${APP_NAME}

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

docker-command: remove-containers
	@docker run -it -v $(shell pwd):${APP_DIR} -w ${APP_DIR} \
		-p ${PORT}:${PORT} --name ${APP_NAME} \
		${DOCKER_BASE_IMAGE} bash -c "${COMMAND}"

dev:
	@clear
	@echo "\e[1m\033[33mRunning ${APP_NAME} on port ${PORT}\e[0m"
	@make docker-command COMMAND="yarn dev"

build-docker-image: remove-images
	@clear
	@echo "\e[1m\033[33mBuilding image ${DOCKER_IMAGE}\e[0m"
	@yarn install
	@docker build --rm . --tag ${DOCKER_IMAGE}

start: remove-containers
	@echo "\e[1m\033[33mRunning ${APP_NAME} on port ${PORT}\e[0m"
	docker run -d -p ${PORT}:${PORT} --name ${APP_NAME} ${DOCKER_IMAGE}

publish-image:
	@echo "\e[1m\033[33mPublishing image ${DOCKER_REMOTE_REPOSITORY}:${TAG_VERSION}\e[0m"
	@docker tag ${DOCKER_IMAGE} ${DOCKER_REMOTE_REPOSITORY}:${TAG_VERSION}
	@docker push ${DOCKER_REMOTE_REPOSITORY}:${TAG_VERSION}
	@echo "\e[1m\033[33mRunning command:\e[0m"
	@echo "docker run --rm -d -p ${PORT}:${PORT} --name ${APP_NAME} ${DOCKER_REMOTE_REPOSITORY}:${TAG_VERSION}"

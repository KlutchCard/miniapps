FROM node:14.17

RUN mkdir /miniapp
COPY . /miniapp
WORKDIR /miniapp
EXPOSE 3001
ENTRYPOINT ["node", "src/server.js"]
# ENTRYPOINT ["yarn", "start"]

FROM node:latest
EXPOSE 12000
EXPOSE 12001
WORKDIR /home/node/
ADD . ./
RUN npm init --y
RUN npm install
RUN mv node_modules/bulma/css/bulma.min.css front/css
CMD ["node", "back/server.js", "ws://0.0.0.0:12001"]

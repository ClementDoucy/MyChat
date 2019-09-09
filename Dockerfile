FROM node:latest
EXPOSE 12000
EXPOSE 12001
RUN npm init --y
RUN npm install express
RUN npm install --save mongodb
RUN npm install ws
WORKDIR /home/node/
ADD . ./
CMD ["node", "back/app.js"]

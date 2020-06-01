FROM node:10-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --production


# Bundle app source
COPY . .

#import wait-for-ir
RUN apk add git
RUN apk add bash
RUN apk add --no-cache openssh
WORKDIR /data
RUN git clone https://github.com/vishnubob/wait-for-it.git /data/app
WORKDIR /data/app


CMD [ "node", "server.js" ]

FROM node:10-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .

EXPOSE 8082
CMD [ "node", "server.js" ]

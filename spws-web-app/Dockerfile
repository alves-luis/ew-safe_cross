FROM node:lts-alpine

RUN npm install -g http-server

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install 

# Bundle app source
COPY . .

# build app for production with minification
RUN npm run build


EXPOSE 8080
CMD [ "http-server" ]


FROM node:10-alpine

ENV WELCOME_SERVICE_HOSTNAME=
ENV CROSSWALKS_LOCATION_SERVICE_HOSTNAME=
ENV CROSSWALKS_SERVICE_HOSTNAME=
ENV CROSSWALKS_LOGGER_SERVICE_HOSTNAME=

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]

FROM node:10-alpine
ENV DB_PORT=
ENV DB_HOST=
ENV DB_DATABASE=
ENV DB_USERNAME=
ENV DB_PASSWORD=
ENV RABBIT_HOSTNAME=
ENV RABBIT_PORT=

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .

CMD [ "node", "server.js" ]

FROM node:10-alpine
ENV DB_PORT=
ENV DB_HOST=
ENV DB_DATABASE=
ENV DB_USERNAME=
ENV DB_PASSWORD=

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]

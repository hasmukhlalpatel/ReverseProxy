FROM node:alpine
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json .
# For npm@5 or later, copy package-lock.json as well
# COPY package.json package-lock.json ./

RUN npm install

# Bundle app source
COPY . .

CMD node index.js

EXPOSE 5050
#CMD [ "npm", "start" ]


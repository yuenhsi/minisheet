FROM node:22

RUN apt-get update && apt-get install -y xdg-utils
RUN npm install -g typescript-language-server

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 3000

# Set environment variable to address a common create-react-app issue in containers
ENV CI=true
ENV WDS_SOCKET_PORT=0

CMD ["yarn", "start"]

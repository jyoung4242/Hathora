FROM node:16

WORKDIR /app

COPY . .
RUN cd server; npm ci
RUN cd server; npx tsc server.ts --module esnext --target esnext --moduleResolution node

CMD ["node", "--experimental-specifier-resolution=node", "server/server.js"]
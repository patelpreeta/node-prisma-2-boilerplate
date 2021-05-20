FROM node:12.20.1 AS base

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build && npm prune --production

FROM node:12.20.1-alpine
WORKDIR /home/node

COPY --from=base /app/dist ./
COPY --from=base /app/node_modules/ ./node_modules
COPY --from=base /app/.sequelizerc ./.sequelizerc
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/package-lock.json ./package-lock.json

EXPOSE 8000

CMD [ "npm", "start" ]

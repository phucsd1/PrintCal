FROM node:24-bookworm-slim

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

ENV NODE_ENV=production

# User 'node' is already provided with UID 1000 by official node image
RUN mkdir -p /app/data && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["npm", "run", "start"]

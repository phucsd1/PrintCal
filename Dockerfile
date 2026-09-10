FROM node:24-bookworm-slim

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Setup UID 1000 for Hugging Face Spaces compatibility
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1000 -g nodejs nextjs

COPY package*.json ./

# Use npm install to resolve platform-specific native binaries (swc-linux-x64-gnu)
RUN npm install

COPY . .

RUN npm run build

ENV NODE_ENV=production

RUN mkdir -p /app/data && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]

FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# User UID 1000 for Hugging Face Spaces compatibility
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1000 nextjs

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# Setup data directory permissions
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]

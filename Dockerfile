FROM node:24-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create nextjs user UID 1000 for Hugging Face Spaces
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1000 nextjs

COPY package.json package-lock.json ./

# Install all dependencies including devDependencies for build
RUN npm ci

COPY . .

RUN npm run build

# Set production environment after build
ENV NODE_ENV=production

# Setup data directory permissions for nextjs user
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]

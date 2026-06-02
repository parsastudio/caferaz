# مرحله اول: Build
FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN npm ci --legacy-peer-deps
    
COPY . .
RUN npm run build

# مرحله دوم: Run
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# کپی فایل‌های تولید شده توسط نکس‌جی با حفظ مالکیت یوزر node
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
COPY --chown=node:node .env* ./ 

# ساخت پوشه کش برای ذخیره فایل‌های موقت و ISR با دسترسی مناسب
RUN mkdir -p .next/cache && chown -R node:node .next/cache

USER node
EXPOSE 3005
ENV PORT=3005

CMD ["node", "server.js"]
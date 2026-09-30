FROM node:22-slim
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ساخت کاربر امن nextjs در محیط دبیان
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 -g nodejs nextjs

# کپی خروجی بیلد و فایل‌های استاتیک و فونت‌ها
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static
COPY --chown=nextjs:nodejs public ./public

# کپی پوشه prisma برای دسترسی موتور کوئری پریزما به schema.prisma در ران‌تایم
COPY --chown=nextjs:nodejs prisma ./prisma

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
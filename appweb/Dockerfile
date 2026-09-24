FROM node:20-alpine AS build
WORKDIR /usr/src/appweb
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /usr/src/appweb
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /usr/src/appweb/.next ./.next
COPY --from=build /usr/src/appweb/public ./public
COPY next.config.mjs ./
EXPOSE 3000
CMD ["npm", "run", "start"]

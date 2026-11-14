FROM node:22-bookworm-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY . .
USER node
EXPOSE 8080
CMD ["node", "app.js"]

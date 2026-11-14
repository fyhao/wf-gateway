FROM node:22-bookworm-slim AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --ignore-scripts --legacy-peer-deps
COPY . .
ARG REACT_APP_API_URL=http://localhost:8080
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build
FROM nginx:alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html
EXPOSE 80

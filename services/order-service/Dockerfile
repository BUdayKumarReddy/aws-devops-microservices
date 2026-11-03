FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY server.js ./
ENV PORT=3003
EXPOSE 3003
USER node
CMD ["npm", "start"]

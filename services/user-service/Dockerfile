FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY server.js ./
ENV PORT=3001
EXPOSE 3001
USER node
CMD ["npm", "start"]

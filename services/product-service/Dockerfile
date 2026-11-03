FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY server.js ./
ENV PORT=3002
EXPOSE 3002
USER node
CMD ["npm", "start"]

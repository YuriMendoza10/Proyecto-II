FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY index.html .
COPY vite.config.js .
COPY eslint.config.js .
COPY postcss.config.js .
COPY tailwind.config.js .
COPY public ./public
COPY src ./src

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

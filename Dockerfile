# TODO: multi-stage сборка и разобраться с шаблонами писем в src
FROM node:22-alpine

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

EXPOSE 8080

CMD ["sh", "-c", "npm run migration:run && node dist/main.js"]
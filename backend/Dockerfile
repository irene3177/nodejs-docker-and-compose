FROM node:16-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm i --no-audit --no-fund --legacy-peer-deps

COPY . .

RUN npm run build


FROM node:16-alpine as runner

WORKDIR /app

COPY package*.json ./

RUN npm i --omit=dev  --no-audit --no-fund --legacy-peer-deps \ 
    && npm i -g pm2

COPY --from=builder /app/dist ./dist

COPY ./ecosystem.config.js ./

ENTRYPOINT ["pm2-runtime", "start", "ecosystem.config.js"]
FROM node:21-alpine3.17 as builder

WORKDIR /app

COPY . .

RUN yarn

RUN yarn run build

FROM node

WORKDIR /app

COPY --from=builder /app/build /app/package.json /app/yarn.lock ./

RUN yarn

EXPOSE 3000

CMD ["node", "index.js"]
FROM node:alpine

RUN apk --no-cache add curl && \
    curl -L https://unpkg.com/@pnpm/self-installer | node && \
    pnpm config set store-dir ~/.pnpm-store

WORKDIR /var/www

COPY ["package.json", "pnpm-lock.yaml", "./"]
RUN pnpm install

COPY . .
RUN pnpm build

EXPOSE 4242
CMD ["npm", "start"]
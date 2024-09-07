FROM node:20-alpine
WORKDIR /app
COPY . .
RUN yarn add copyfiles
RUN yarn install
COPY . .
RUN yarn build
RUN npx prisma generate
EXPOSE 5050

RUN ["chmod", "+x", "./entrypoint.sh"]
ENTRYPOINT [ "sh", "./entrypoint.sh" ]
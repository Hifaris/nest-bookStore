FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

# RUN start:prod
CMD ["npm", "run", "start:prod"]

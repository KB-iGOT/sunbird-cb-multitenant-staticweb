FROM node:22.6.0
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Expose port 4200 (used by serve:prod)
EXPOSE 4200
CMD [ "npm", "run", "serve:prod" ]




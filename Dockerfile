FROM node:22.6.0
RUN groupadd -r appuser && useradd -r -g appuser appuser
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
RUN chown -R appuser:appuser /app
USER appuser

# Expose port 4200 (used by serve:prod)
EXPOSE 4200
CMD [ "npm", "run", "serve:prod" ]





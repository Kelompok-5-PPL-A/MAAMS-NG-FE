FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Build with the specified environment or default to production
ARG ENVIRONMENT=production
RUN echo "Building for ${ENVIRONMENT} environment"
RUN if [ "$ENVIRONMENT" = "staging" ]; then npm run build:staging; else npm run build:prod; fi

FROM nginx:alpine
ARG ENVIRONMENT=production
COPY nginx.${ENVIRONMENT}.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Create environment indicator file for debugging
RUN echo "Environment: ${ENVIRONMENT}" > /usr/share/nginx/html/env.txt

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
FROM node:latest AS frontend-built

SHELL ["/bin/bash", "-c"]
WORKDIR /opt/frontend

RUN npm install -g @angular/cli

COPY package*.json ./
RUN npm install

COPY . .
RUN ng build --prod

FROM nginx:latest

COPY --from=frontend-built /opt/frontend /usr/share/nginx/html

EXPOSE 80
EXPOSE 443

CMD [ "nginx", "-g", "daemon off;" ]
FROM node:latest

SHELL ["/bin/bash", "-c"]
WORKDIR /opt/frontend

RUN npm install -g @angular/cli

COPY ../.. .
RUN npm install

EXPOSE 4200

CMD [ "ng", "serve" ]
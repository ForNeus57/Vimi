FROM node:23 AS frontend-build

SHELL ["/bin/bash", "-c"]
WORKDIR /opt/frontend

RUN npm install -g @angular/cli

COPY ./frontend/package*.json ./
RUN npm install

COPY ./frontend/ .
RUN ng build --configuration production

FROM nginx:1.27.3

COPY --from=frontend-build /opt/frontend/dist/main/browser /usr/share/nginx/html
#COPY --from=frontend-build /opt/frontend/nginx.conf /etc/nginx/conf.d/frontend.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
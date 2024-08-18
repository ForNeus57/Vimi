FROM python:latest

WORKDIR /opt/vimi_backend

RUN pip install --upgrade pip
COPY ./backend/requirements.txt ./requirements.txt
RUN pip install -r ./requirements.txt

COPY . .

RUN pip install .

EXPOSE 8000

CMD vimi-backend makemigrations api \
    && vimi-backend migrate \
    || vimi-backend createsuperuser --username "$DJANGO_SUPERUSER_USERNAME" --email "$DJANGO_SUPERUSER_EMAIL" --noinput \
    && vimi-backend runserver

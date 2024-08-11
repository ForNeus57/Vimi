FROM python:latest

SHELL ["/bin/bash", "-c"]
WORKDIR /opt/backend

RUN pip install --upgrade pip

COPY ./backend/requirements.txt .
RUN pip install -r requirements.txt

COPY ./backend .
RUN pip install -e .

EXPOSE 5000
CMD [ "backend" ]


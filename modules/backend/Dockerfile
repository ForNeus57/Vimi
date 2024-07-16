FROM python:latest

SHELL ["/bin/bash", "-c"]
WORKDIR /opt/backend

RUN pip install --upgrade pip

COPY ../../requirements.txt .
RUN pip install -r requirements.txt

COPY ../.. .
RUN pip install -e .

EXPOSE 8000
CMD [ "backend" ]


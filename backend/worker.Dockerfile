FROM python:latest

WORKDIR /opt/vimi_worker

RUN pip install --upgrade pip

COPY ./backend/requirements.txt ./requirements.txt
RUN pip install -r ./requirements.txt

COPY ./backend .

RUN pip install .

EXPOSE 80

CMD vimi-worker

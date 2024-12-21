FROM tensorflow/tensorflow:2.18.0-gpu

RUN apt-get update
RUN apt-get install -y libgl1-mesa-glx

RUN ln -sf /usr/bin/python3.10 /usr/bin/python3
RUN add-apt-repository ppa:deadsnakes/ppa -y
RUN apt-get update -y
RUN ln -sf /usr/bin/python3.11 /usr/bin/python3

COPY --chmod=0755 ./backend/scripts/setup.python.sh /setup.python.sh
COPY ./backend/requirements.txt /opt/vimi_backend/requirements.txt
RUN /setup.python.sh python3.12 /opt/vimi_backend/requirements.txt

WORKDIR /opt/vimi_backend

COPY ./backend/ .
RUN chmod +x ./scripts/run_backend.sh

RUN pip install .

EXPOSE 8000

ENTRYPOINT ["./scripts/run_backend.sh"]

CMD ["run"]

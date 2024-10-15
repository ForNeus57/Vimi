#!/usr/bin/env bash

source /home/$(whoami)/anaconda3/etc/profile.d/conda.sh;
conda activate Vimi;

export $(cat backend/backend.env| tr -d '\r' | xargs);

vimi-backend makemigrations;
vimi-backend migrate;
vimi-backend loaddata ./backend/fixtures/initial_data.json;
vimi-backend createsuperuser --username "$DJANGO_SUPERUSER_USERNAME" --email "$DJANGO_SUPERUSER_EMAIL" --noinput;
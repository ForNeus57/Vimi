#!/usr/bin/env bash

source /home/$(whoami)/anaconda3/etc/profile.d/conda.sh;
conda activate Vimi;

export $(cat backend.env | tr -d '\r' | xargs);

vimi-backend dumpdata --all --indent 2 --output fixtures/initial_data_dumped.json;

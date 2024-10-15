#!/usr/bin/env bash

source /home/$(whoami)/anaconda3/etc/profile.d/conda.sh;
conda activate Vimi;

export $(cat backend/backend.env| tr -d '\r' | xargs);

vimi-backend syncarchitecture;

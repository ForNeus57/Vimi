#!/usr/bin/env bash

docker build --tag backend:latest -f ./modules/backend/Dockerfile . &
docker build --tag frontend:latest -f ./modules/frontend/Dockerfile . &
#!/usr/bin/env bash

docker run --rm --name backend -p 8080:8080 -d backend:latest &
docker run --rm --name frontend -p 4200:4200 -d frontend:latest &
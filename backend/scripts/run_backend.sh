#!/usr/bin/env bash

if ! vimi-backend makemigrations --check; then

	vimi-backend makemigrations;

fi

if ! vimi-backend migrate --check; then

	vimi-backend migrate;

fi

if [ "$1" = 'run' ]; then

	echo "Performing run operation ..."
	vimi-backend runserver 0.0.0.0:8000;

elif [ "$1" = 'migrate' ]; then

	echo "Performing migration operation ..."
	vimi-backend loaddata --settings=vimi_web.core.settings.testing initial_data;
	vimi-backend sync_layer;
	vimi-backend sync_color_map;
	vimi-backend createsuperuser --username "$DJANGO_SUPERUSER_USERNAME" --email "$DJANGO_SUPERUSER_EMAIL" --noinput;

fi

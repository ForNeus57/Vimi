FROM redis:latest

RUN apt-get update \
    && apt-get -y install gettext-base \
    && apt-get clean

COPY ./cache/modules/librejson.so /usr/lib/redis/modules/librejson.so
COPY ./cache/redis.conf /usr/local/etc/redis/redis_with_env.conf

CMD envsubst < /usr/local/etc/redis/redis_with_env.conf > /usr/local/etc/redis/redis.conf \
    && redis-server /usr/local/etc/redis/redis.conf
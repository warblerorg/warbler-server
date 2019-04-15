FROM node:11.14.0-stretch

# RUN rm /bin/sh && ln -s /bin/bash /bin/sh

WORKDIR /app

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update
RUN apt-get install -y -q --no-install-recommends \
        apt-transport-https \
        build-essential \
        ca-certificates \
        curl \
        git \
        libssl-dev \
        wget \
        postgresql-client

ENV PGHOST db
ENV PGDATABASE warbler_store
ENV PGUSER warbler

COPY package.json /app
RUN npm install
COPY . /app
EXPOSE 3000

CMD ["node", "index.js"]


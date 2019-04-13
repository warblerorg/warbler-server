FROM node:11.14.0-stretch

# RUN rm /bin/sh && ln -s /bin/bash /bin/sh

WORKDIR /app
COPY . /app

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

ENV POSTGRES_USER warbler
ENV POSTGRES_DB db:warbler_store

# RUN . $HOME/.nvm/nvm.sh && nvm install $NODE_VERSION \
#     && nvm alias default $NODE_VERSION \
#     && nvm use default

RUN npm install
EXPOSE 3000

ENV PGHOST db
ENV PGDATABASE warbler_store
ENV PGUSER warbler

CMD ["node", "index.js"]

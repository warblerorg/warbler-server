FROM postgres:10

WORKDIR /app
COPY . /app

RUN apt-get update
RUN apt-get install -y -q --no-install-recommends \
        apt-transport-https \
        build-essential \
        ca-certificates \
        curl \
        git \
        libssl-dev \
        wget

# ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 11.11.0

RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash

RUN . $NVM_DIR/nvm.sh
RUN nvm install $NODE_VERSION && nvm use default

ENV NODE_PATH $NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

RUN npm install

RUN psql -d warbler_store -f db_v1.sql

EXPOSE 3000

ENV PGDATABASE warbler_store

CMD ["node", "index.js"]

FROM postgres:10

ENV POSTGRES_USER warbler
ENV POSTGRES_DB warbler_store

RUN rm /bin/sh && ln -s /bin/bash /bin/sh
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


RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash

ENV NODE_VERSION 11.11.0
ENV NVM_DIR /root/.nvm
RUN /bin/bash -c "source $NVM_DIR/nvm.sh"
ENV NODE_PATH $NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

RUN . $HOME/.nvm/nvm.sh && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

RUN npm install

RUN psql -U warbler -d warbler_store -f db_v1.sql

EXPOSE 3000

ENV PGDATABASE warbler_store

CMD ["node", "index.js"]

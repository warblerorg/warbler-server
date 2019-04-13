FROM ubuntu

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

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
        postgresql-client-10
        #postgresql-10 postgresql-client-10 postgresql-contrib-10

#USER postgres
# RUN    /etc/init.d/postgresql start &&\
#     psql --command "CREATE USER warbler WITH SUPERUSER;" &&\
#     createdb -O warbler warbler_store &&\
#

ENV POSTGRES_USER warbler
ENV POSTGRES_DB db:warbler_store

USER root

#RUN systemctl status postgresql ## DEBUG

RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash

ENV NODE_VERSION 11.11.0
ENV NVM_DIR /root/.nvm
RUN /bin/bash -c "source $NVM_DIR/nvm.sh"
ENV NODE_PATH $NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

RUN . $HOME/.nvm/nvm.sh && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# RUN psql -d postgresql://db:5432/warbler_store -f db_v1.sql
RUN npm install
EXPOSE 3000

ENV PGHOST db
ENV PGDATABASE warbler_store
ENV PGUSER warbler

CMD ["node", "index.js"]

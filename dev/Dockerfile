FROM apiaryio/base-emscripten-dev:1.31.0

WORKDIR /

RUN apt-get update && apt-get install -y default-jre git && \
 git clone git://git.postgresql.org/git/postgresql.git && \
 echo "JAVA = '/usr/bin/java'" >> ~/.emscripten

WORKDIR /postgresql
RUN ./configure --without-readline --without-zlib
RUN echo "#undef PG_INT128_TYPE" >> src/include/pg_config.h

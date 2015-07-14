docker build -t pg-emscripten .
docker run -v .:/shared pg-emscripten //bin/sh -c "cd src; emcc -I include -I port -I interfaces/ecpg/include -I interfaces/ecpg/pgtypeslib /shared/interval.c -O3 -s EXPORTED_FUNCTIONS=\"['_isValidInterval']\" -s DEFAULT_LIBRARY_FUNCS_TO_INCLUDE=\"[]\" --memory-init-file 0 --closure 1 -o /shared/interval.js"

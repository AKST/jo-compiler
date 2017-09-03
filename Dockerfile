FROM node:6.11.2

ADD ./ application/

WORKDIR application/

RUN make init build

CMD ["./dist/src/bin/cli.js", "debug:repl", "-p", "parse"]

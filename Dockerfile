FROM node:6.11.2

RUN apt-get update \
 && apt-get install jq

# install llvm keychain
#
# Ensure this is consistent with the logic in:
#
#   ./scripts/install-shared-libararies.bash
#
RUN echo "deb http://apt.llvm.org/trusty/ llvm-toolchain-trusty main" >> /etc/apt/sources.list \
 && echo "deb-src http://apt.llvm.org/trusty/ llvm-toolchain-trusty main" >> /etc/apt/sources.list \
 && echo "deb http://apt.llvm.org/trusty/ llvm-toolchain-trusty-4.0 main" >> /etc/apt/sources.list \
 && echo "deb-src http://apt.llvm.org/trusty/ llvm-toolchain-trusty-4.0 main" >> /etc/apt/sources.list \
 && wget -O - https://apt.llvm.org/llvm-snapshot.gpg.key | apt-key add - \
 && apt-get update \
 && apt-get install -y --force-yes \
      clang-4.0 \
      clang-4.0-doc \
      libclang-common-4.0-dev \
      libclang-4.0-dev \
      libclang1-4.0 \
      libclang1-4.0-dbg \
      libllvm-4.0-ocaml-dev \
      libllvm4.0 \
      libllvm4.0-dbg \
      lldb-4.0 \
      llvm-4.0 \
      llvm-4.0-dev \
      llvm-4.0-doc \
      llvm-4.0-examples \
      llvm-4.0-runtime \
      clang-format-4.0 \
      python-clang-4.0 \
      libfuzzer-4.0-dev


COPY ./ ./application/
WORKDIR application/

RUN ./scripts/install-shared-libararies.bash
RUN make init build

CMD ["./dist/src/bin/cli.js", "debug:repl", "-p", "parse"]

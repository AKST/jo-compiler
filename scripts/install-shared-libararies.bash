#!/usr/bin/env bash
install_for_osx() {
  if [ ! -d /usr/local/Cellar/llvm/4.0.1 ]; then
    brew install jq
  fi
  if ! which llvm; then
    brew install llvm@4 --with-toolchain
  fi
}

install_for_linux() {
  if ! dpkg -s jq; then
    apt-get update
    apt-get install jq
  fi
  if ! dpkg -s llvm-4.0; then
    echo "deb http://apt.llvm.org/trusty/ llvm-toolchain-trusty main" >> /etc/apt/sources.list
    echo "deb-src http://apt.llvm.org/trusty/ llvm-toolchain-trusty main" >> /etc/apt/sources.list
    echo "deb http://apt.llvm.org/trusty/ llvm-toolchain-trusty-4.0 main" >> /etc/apt/sources.list
    echo "deb-src http://apt.llvm.org/trusty/ llvm-toolchain-trusty-4.0 main" >> /etc/apt/sources.list
    wget -O - https://apt.llvm.org/llvm-snapshot.gpg.key | apt-key add -
    apt-get update

    apt-get install -y --force-yes \
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
  fi
}

main() {
  local ostype=`uname`;
  [ "$ostype" == "Darwin" ] && install_for_osx
  [ "$ostype" == "Linux" ] && install_for_linux
}

main $@

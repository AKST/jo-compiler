#!/usr/bin/env bash
main() {
  local package_version=`cat package.json | jq .version -r`
  docker build -f ./Dockerfile --tag jo:$package_version --rm .
}

main $@

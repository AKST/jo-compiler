#!/usr/bin/env bash

# runs a command with make a new container using the latest
# image, if said image doesn't exist it'll fail
main() {
  local package_version=`cat package.json | jq .version -r`
  docker run -it --rm --name jo_tests \
    -v "$(pwd)/src:/application/src" \
    -v "$(pwd)/test:/application/test" \
    jo:$package_version make $@
}

main $@

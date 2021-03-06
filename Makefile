
SYSTEM=$(shell uname)

ifeq ($(SYSTEM),Linux)
	YARN_ENV=GYP_DEFINES="LLVM_CONFIG=/usr/bin/llvm-config-4.0"
endif
ifeq ($(SYSTEM),Darwin)
	YARN_ENV=GYP_DEFINES="LLVM_CONFIG=/usr/bin/opt/llvm/bin/llvm-config"
endif



default: build

ci: type lint test

init:
	echo $(YARN_ENV) yarn install
	$(YARN_ENV) yarn install
	./node_modules/.bin/flow-typed install

node_modules:
	$(YARN_ENV) yarn install

flow-typed: node_modules
	./node_modules/.bin/flow-typed install

build: node_modules
	./node_modules/.bin/babel src --out-dir dist/src --source-maps inline
	cp ./package.json ./dist/.
	@for bin_file in ./dist/src/bin/*.js; do \
		echo "#!$$(which env) node\n$$(cat $$bin_file)" > $$bin_file; \
		chmod +x $$bin_file; \
	done

test: node_modules
	./node_modules/.bin/jest

type: node_modules
	./node_modules/.bin/flow status

lint: node_modules
	./node_modules/.bin/eslint src test

docs: node_modules
	./node_modules/.bin/documentation build \
		src/** src/* -f html -o docs \
		--document-exported \
		--infer-private \
		--name jo-script

watch:
	@which watchman-make > /dev/null || ( echo 'install watchman' && exit 1 )
	watchman-make -p 'src/**/*.js' 'src/*.js' 'test/**/*.js' 'test/*.js' -t ci

reset:
	rm -rf flow-typed
	rm -rf node_modules
	rm -rf dist
	rm -rf docs
	make init

clean:
	rm -rf dist

.PHONY: default watch ci init build clean docs type lint test

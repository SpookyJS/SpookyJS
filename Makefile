PWD = $(shell pwd)
TEST_REPORTER ?= dot
TEST_PORT ?= 8080
TEST_TIMEOUT ?= 4000
TEST_SLOW ?= 2000
NODE_MODULES = $(PWD)/node_modules
# XXX: below may be a bit too clever
PID_FILE := $(PWD)/$(shell echo ".test-server-pid.$$RANDOM")

test:
	@cd tests/fixtures ; \
		$(NODE_MODULES)/.bin/http-server -s -p $(TEST_PORT) & \
		echo "$$!" > $(PID_FILE) ; \
		cd $(PWD)
	@$(NODE_MODULES)/.bin/mocha tests/test --recursive \
			--globals define \
			--timeout $(TEST_TIMEOUT) --slow $(TEST_SLOW) \
			-R $(TEST_REPORTER) $(TEST_ARGS) ; \
		STATUS=$$? ; \
		kill -9 `cat $(PID_FILE)` ; rm $(PID_FILE) ; \
		exit $$STATUS

.PHONY: test

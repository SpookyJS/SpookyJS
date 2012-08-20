test:
	@./node_modules/.bin/mocha tests/test --recursive \
		--globals define

.PHONY: test

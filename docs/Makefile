
.PHONY: docs-serve
docs-serve: deps-install
	mkdocs serve --livereload

.PHONY: deps-install
deps-install:
	pip install -r requirements.txt

.PHONY: docs-build
docs-build:
	mkdocs build


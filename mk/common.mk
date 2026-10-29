# Shared by every Makefile that wants strict, predictable behaviour.
# Include with: include <path-to-repo-root>/mk/common.mk
SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.ONESHELL:
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

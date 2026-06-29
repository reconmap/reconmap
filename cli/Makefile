SHELL := bash
SUBDIRS := $(wildcard */.)

include Golang.mk

all: $(SUBDIRS)
$(SUBDIRS):
	$(MAKE) -C $@

.PHONY: all $(SUBDIRS)

.PHONY: programs clean

programs:
	pushd agent && make reconmapd && popd
	pushd runner && make rmap && popd

clean:
	pushd agent && make clean && popd
	pushd runner && make clean && popd


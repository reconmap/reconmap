SHELL := bash
SUBDIRS := runner cli shared-lib

include Golang.mk

all: $(SUBDIRS)
$(SUBDIRS):
	$(MAKE) -C $@

.PHONY: all $(SUBDIRS)

.PHONY: programs clean

programs:
	pushd runner && make reconmapd && popd
	pushd cli && make rmap && popd

clean:
	pushd runner && make clean && popd
	pushd cli && make clean && popd


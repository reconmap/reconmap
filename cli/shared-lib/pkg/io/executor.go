package io

import (
	"os"
	"os/exec"
	"sync"
)

type Executor interface {
	Execute(name string, args ...string) (stdout []byte, stderr []byte, err error)
}

type DefaultExecutor struct{}

func (e *DefaultExecutor) Execute(name string, args ...string) ([]byte, []byte, error) {
	cmd := exec.Command(name, args...)
	var stdout, stderr []byte
	var errStdout, errStderr error
	stdoutIn, _ := cmd.StdoutPipe()
	stderrIn, _ := cmd.StderrPipe()
	err := cmd.Start()
	if err != nil {
		return nil, nil, err
	}
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		stdout, errStdout = CopyAndCapture(os.Stdout, stdoutIn)
		wg.Done()
	}()

	stderr, errStderr = CopyAndCapture(os.Stderr, stderrIn)

	wg.Wait()

	err = cmd.Wait()
	if errStdout != nil {
		return stdout, stderr, errStdout
	}
	if errStderr != nil {
		return stdout, stderr, errStderr
	}
	return stdout, stderr, err
}

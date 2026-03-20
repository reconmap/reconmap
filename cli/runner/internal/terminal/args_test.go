package terminal

import (
	"testing"

	"github.com/reconmap/shared-lib/pkg/models"
)

func TestReplaceArgs(t *testing.T) {
	tests := []struct {
		name     string
		command  *models.CommandUsage
		vars     []string
		expected string
	}{
		{
			name: "basic replacement",
			command: &models.CommandUsage{
				Arguments: "ls -la {{{target}}}",
			},
			vars:     []string{"target=example.com"},
			expected: "ls -la example.com",
		},
		{
			name: "multiple variables",
			command: &models.CommandUsage{
				Arguments: "nmap -p {{{port}}} {{{target}}}",
			},
			vars:     []string{"port=80", "target=127.0.0.1"},
			expected: "nmap -p 80 127.0.0.1",
		},
		{
			name: "variable with description",
			command: &models.CommandUsage{
				Arguments: "curl {{{url:the target URL}}}",
			},
			vars:     []string{"url=https://google.com"},
			expected: "curl https://google.com",
		},
		{
			name: "no replacements",
			command: &models.CommandUsage{
				Arguments: "ls -la",
			},
			vars:     []string{"target=example.com"},
			expected: "ls -la",
		},
		{
			name: "empty vars",
			command: &models.CommandUsage{
				Arguments: "ls {{{target}}}",
			},
			vars:     []string{},
			expected: "ls {{{target}}}",
		},
		{
			name: "invalid var format (no =)",
			command: &models.CommandUsage{
				Arguments: "ls {{{target}}}",
			},
			vars:     []string{"target"},
			expected: "ls {{{target}}}",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			actual := ReplaceArgs(tt.command, tt.vars)
			if actual != tt.expected {
				t.Errorf("ReplaceArgs() = %v, want %v", actual, tt.expected)
			}
		})
	}
}

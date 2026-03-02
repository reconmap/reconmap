package terminal

import (
	"fmt"

	"github.com/fatih/color"
)

func PrintRedCross() {
	color.Set(color.FgRed)
	fmt.Print("✗")
	color.Unset()
}

func PrintGreenTick() {
	color.Set(color.FgGreen)
	fmt.Print("✓")
	color.Unset()
}

func PrintYellowDot() {
	color.Set(color.FgYellow)
	fmt.Print("•")
	color.Unset()
}

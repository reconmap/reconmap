package models

type CommandUsage struct {
	ID                  string `json:"id"`
	CommandId           string `json:"commandId"`
	CreatorUid          int    `json:"createdByUid"`
	Description         string `json:"description"`
	ExecutablePath      string `json:"executablePath"`
	Arguments           string `json:"arguments"`
	OutputCapturingMode string `json:"outputCapturingMode"`
	OutputFilename      string `json:"outputFilename"`
	OutputParser        string `json:"outputParser"`
}

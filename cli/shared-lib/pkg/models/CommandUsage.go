package models

type CommandUsage struct {
	ID                  int    `json:"id"`
	CommandId           int    `json:"commandId"`
	CreatorUid          int    `json:"createdByUid"`
	Name                string `json:"name"`
	Description         string `json:"description"`
	ExecutablePath      string `json:"executablePath"`
	Arguments           string `json:"arguments"`
	OutputCapturingMode string `json:"outputCapturingMode"`
	OutputFilename      string `json:"outputFilename"`
	OutputParser        string `json:"outputParser"`
}

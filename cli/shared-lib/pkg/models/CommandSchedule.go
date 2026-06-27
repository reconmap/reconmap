package models

type CommandSchedule struct {
	ID             int    `json:"id"`
	CreatorUid     int    `json:"createdByUid"`
	CommandId      string `json:"commandId"`
	ProjectId      int    `json:"projectId"`
	CommandUsageId string `json:"commandUsageId"`
	ArgumentValues string `json:"argumentValues"`
	CronExpression string `json:"cronExpression"`
}

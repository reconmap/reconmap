package models

type CommandSchedule struct {
	ID             int    `json:"id"`
	CreatorUid     int    `json:"createdByUid"`
	CommandId      int    `json:"commandId"`
	ProjectId      int    `json:"projectId"`
	CommandUsageId int    `json:"commandUsageId"`
	ArgumentValues string `json:"argumentValues"`
	CronExpression string `json:"cronExpression"`
}

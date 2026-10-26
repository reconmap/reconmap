package models

type CommandSchedule struct {
	ID             int    `json:"id"`
	CreatedById     int    `json:"createdById"`
	CommandId      string `json:"commandId"`
	ProjectId      string `json:"projectId"`
	CommandUsageId string `json:"commandUsageId"`
	ArgumentValues string `json:"argumentValues"`
	CronExpression string `json:"cronExpression"`
	ScanRunTaskId  int    `json:"scanRunTaskId"`
}

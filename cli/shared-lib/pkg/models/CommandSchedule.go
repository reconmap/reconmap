
package models

type CommandSchedule struct {

	ID int `json:"id"`
	CreatorUid int `json:"creator_uid"`
	CommandId int `json:"command_id"`
	ArgumentValues string `json:"argument_values"`
	CronExpression string `json:"cron_expression"`
}

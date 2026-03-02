
package models

type Task struct {

	ID int `json:"id"`
	ProjectId int `json:"project_id"`
	CreatorUid int `json:"creator_uid"`
	AssigneeUid int `json:"assignee_uid"`
	InsertTs string `json:"insert_ts"`
	UpdateTs string `json:"update_ts"`
	Priority string `json:"priority"`
	Summary string `json:"summary"`
	Description string `json:"description"`
	Status string `json:"status"`
	DurationEstimate int `json:"duration_estimate"`
	DueDate string `json:"due_date"`
	CommandId int `json:"command_id"`
	Command string `json:"command"`
	CommandParser string `json:"command_parser"`
}


package models

type Task struct {

	ID string `json:"id"`
	ProjectId string `json:"project_id"`
	CreatedById int `json:"createdById"`
	AssignedToId int `json:"assignedToId"`
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


package models

type FindingCategory struct {

	ID int `json:"id"`
	ParentId int `json:"parent_id"`
	InsertTs string `json:"insert_ts"`
	UpdateTs string `json:"update_ts"`
	Name string `json:"name"`
	Description string `json:"description"`
}

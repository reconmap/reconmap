
package models

type Vault struct {

	ID int `json:"id"`
	InsertTs string `json:"insert_ts"`
	UpdateTs string `json:"update_ts"`
	ProjectId int `json:"project_id"`
	Type string `json:"type"`
	Name string `json:"name"`
	Value string `json:"value"`
	Note string `json:"note"`
}

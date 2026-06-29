
package models

type Asset struct {

	ProjectId int `json:"project_id"`
	ParentId int `json:"parent_id"`
	Name string `json:"name"`
	Type string `json:"type"`
	Tags string `json:"tags"`
}

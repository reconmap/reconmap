
package models

type Target struct {

	ProjectId int `json:"project_id"`
	ParentId int `json:"parent_id"`
	Name string `json:"name"`
	Kind string `json:"kind"`
	Tags string `json:"tags"`
}

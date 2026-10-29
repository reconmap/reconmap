package models

type Asset struct {

	ProjectId string `json:"project_id"`
	ParentId string `json:"parent_id"`
	Name string `json:"name"`
	Kind string `json:"kind"`
	Source string `json:"source"`
	Attributes string `json:"attributes"`
	Tags string `json:"tags"`
}

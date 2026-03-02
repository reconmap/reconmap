
package models

type CustomField struct {

	ID int `json:"id"`
	ParentType string `json:"parent_type"`
	Name string `json:"name"`
	Label string `json:"label"`
	Kind string `json:"kind"`
	Config string `json:"config"`
}

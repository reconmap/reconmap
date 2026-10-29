
package models

type CustomField struct {

	ID int `json:"id"`
	ParentType string `json:"parent_type"`
	Name string `json:"name"`
	Label string `json:"label"`
	Type string `json:"type"`
	Config string `json:"config"`
}

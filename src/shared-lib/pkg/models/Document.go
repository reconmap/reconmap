
package models

type Document struct {

	UserId int `json:"user_id"`
	Visibility string `json:"visibility"`
	ParentId int `json:"parent_id"`
	ParentType string `json:"parent_type"`
	Content string `json:"content"`
	Title string `json:"title"`
}

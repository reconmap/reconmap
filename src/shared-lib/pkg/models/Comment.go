package models

type Comment struct {
	CreatedById int    `json:"createdById"`
	ParentId    int    `json:"parentId"`
	ParentType  string `json:"parentType"`
	Content     string `json:"content"`
}

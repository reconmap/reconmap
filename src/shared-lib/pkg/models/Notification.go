
package models

type Notification struct {

	Touserid int `json:"toUserId"`
	Title string `json:"title"`
	Content string `json:"content"`
}

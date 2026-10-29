
package models

type Contact struct {

	ID int `json:"id"`
	Type string `json:"type"`
	Name string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
	Role string `json:"role"`
}

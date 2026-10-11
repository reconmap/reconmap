
package models

type Contact struct {

	ID int `json:"id"`
	Kind string `json:"kind"`
	Name string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
	Role string `json:"role"`
}

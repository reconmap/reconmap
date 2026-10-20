
package models

type Command struct {

	ID string `json:"id"`
	CreatedById int `json:"createdById"`
	Name string `json:"name"`
	Description string `json:"description"`
	MoreInfoUrl string `json:"more_info_url"`
	Tags string `json:"tags"`
}

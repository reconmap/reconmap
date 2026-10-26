
package models

type Report struct {

	ID string `json:"id"`
	Projectid string `json:"projectId"`
	CreatedById int `json:"createdById"`
	IsTemplate bool `json:"is_template"`
	Insertts string `json:"insertTs"`
	Versionname string `json:"versionName"`
	Versiondescription string `json:"versionDescription"`
}

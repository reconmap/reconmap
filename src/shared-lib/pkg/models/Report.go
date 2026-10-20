
package models

type Report struct {

	ID int `json:"id"`
	Projectid int `json:"projectId"`
	CreatedById int `json:"createdById"`
	IsTemplate bool `json:"is_template"`
	Insertts string `json:"insertTs"`
	Versionname string `json:"versionName"`
	Versiondescription string `json:"versionDescription"`
}

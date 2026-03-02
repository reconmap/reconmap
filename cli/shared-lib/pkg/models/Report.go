
package models

type Report struct {

	ID int `json:"id"`
	Projectid int `json:"projectId"`
	Generatedbyuid int `json:"generatedByUid"`
	IsTemplate bool `json:"is_template"`
	Insertts string `json:"insertTs"`
	Versionname string `json:"versionName"`
	Versiondescription string `json:"versionDescription"`
}

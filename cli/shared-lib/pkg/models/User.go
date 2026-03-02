
package models

type User struct {

	ID int `json:"id"`
	InsertTs string `json:"insert_ts"`
	UpdateTs string `json:"update_ts"`
	LastLoginTs string `json:"last_login_ts"`
	SubjectId string `json:"subject_id"`
	Active bool `json:"active"`
	MfaEnabled bool `json:"mfa_enabled"`
	FullName string `json:"full_name"`
	ShortBio string `json:"short_bio"`
	Username string `json:"username"`
	Email string `json:"email"`
	Timezone string `json:"timezone"`
	Preferences interface{} `json:"preferences"`
	Role string `json:"role"`
}

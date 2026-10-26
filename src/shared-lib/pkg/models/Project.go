
package models

type Project struct {

	ID string `json:"id"`
	CreatedById int `json:"createdById"`
	ServiceProviderId int `json:"service_provider_id"`
	ClientId int `json:"client_id"`
	Name string `json:"name"`
	Description string `json:"description"`
	IsTemplate bool `json:"is_template"`
	CategoryId int `json:"category_id"`
	EngagementStartDate string `json:"engagement_start_date"`
	EngagementEndDate string `json:"engagement_end_date"`
	ExternalId string `json:"external_id"`
}


package models

type Client struct {

	ID int `json:"id"`
	CreatedById int `json:"createdById"`
	Type string `json:"type"`
	InsertTs string `json:"insert_ts"`
	UpdateTs string `json:"update_ts"`
	Name string `json:"name"`
	Address string `json:"address"`
	Url string `json:"url"`
	LogoAttachmentId int `json:"logo_attachment_id"`
	SmallLogoAttachmentId int `json:"small_logo_attachment_id"`
}

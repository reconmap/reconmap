
package models

type Attachment struct {

	ID int `json:"id"`
	ParentType string `json:"parent_type"`
	ParentId int `json:"parent_id"`
	SubmitterUid int `json:"submitter_uid"`
	ClientFileName string `json:"client_file_name"`
	FileName string `json:"file_name"`
	FileSize int `json:"file_size"`
	FileMimetype string `json:"file_mimetype"`
	FileHash string `json:"file_hash"`
}

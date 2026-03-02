
package models

type ReportConfiguration struct {

	ID int `json:"id"`
	ProjectId int `json:"project_id"`
	IncludeToc bool `json:"include_toc"`
	IncludeRevisionsTable bool `json:"include_revisions_table"`
	IncludeTeamBios bool `json:"include_team_bios"`
	IncludeFindingsOverview bool `json:"include_findings_overview"`
	IncludeCover string `json:"include_cover"`
	IncludeHeader string `json:"include_header"`
	IncludeFooter string `json:"include_footer"`
	CustomCover string `json:"custom_cover"`
	CustomHeader string `json:"custom_header"`
	CustomFooter string `json:"custom_footer"`
}

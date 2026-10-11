package api

type SystemInfo struct {
	Version       string `json:"version"`
	Hostname      string `json:"hostname"`
	Arch          string `json:"arch"`
	CPU           string `json:"cpu"`
	Memory        string `json:"memory"`
	Os            string `json:"os"`
	IpAddress     string `json:"ip"`
	ListenAddress string `json:"listen_addr"`
}

package configuration

type KeycloakConfig struct {
	BaseUri  string `json:"baseUri"`
	ClientID string `json:"clientId"`
}

type ReconmapApiConfig struct {
	BaseUri string `json:"baseUri"`
}

type Config struct {
	KeycloakConfig    `json:"keycloak"`
	ReconmapApiConfig `json:"reconmapApi"`
}

const ConfigFileName string = "config-rmap.json"

func NewConfig() Config {
	return Config{
		KeycloakConfig: KeycloakConfig{
			BaseUri:  "http://localhost:8080/realms/reconmap",
			ClientID: "rmap-client",
		},
		ReconmapApiConfig: ReconmapApiConfig{
			BaseUri: "http://localhost:5510",
		},
	}
}

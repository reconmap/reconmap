package api

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strconv"

	"github.com/reconmap/shared-lib/pkg/models"
)

func AgentBoot(apiBaseUri string, accessToken string, systemInfo *SystemInfo) (*models.CommandSchedules, error) {
	var apiUrl string = apiBaseUri + "/agents/1/boot"
	marshalled, err := json.Marshal(systemInfo)

	client2 := &http.Client{}
	req, err := http.NewRequest("PATCH", apiUrl, bytes.NewBuffer(marshalled))
	if err != nil {
		return nil, err
	}
	req.Header.Add("Authorization", "Bearer "+accessToken)
	req.Header.Add("Content-Type", "application/json")

	response, err := client2.Do(req)
	if err != nil {
		return nil, err
	}

	defer response.Body.Close()

	_, err = io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}

	return nil, nil
}

func AgentPing(apiBaseUri string, accessToken string) (*models.CommandSchedules, error) {
	var apiUrl string = apiBaseUri + "/agents/1/ping"

	client2 := &http.Client{}
	req, err := http.NewRequest("PATCH", apiUrl, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Add("Authorization", "Bearer "+accessToken)

	response, err := client2.Do(req)
	if err != nil {
		return nil, err
	}

	defer response.Body.Close()

	_, err = io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}

	return nil, nil
}

func GetCommandsSchedules(apiBaseUri string, accessToken string) (*models.CommandSchedules, error) {
	var apiUrl string = apiBaseUri + "/commands/schedules"

	client2 := &http.Client{}
	req, err := http.NewRequest("GET", apiUrl, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Add("Authorization", "Bearer "+accessToken)

	response, err := client2.Do(req)
	if err != nil {
		return nil, err
	}

	defer response.Body.Close()

	body, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}

	var schedules *models.CommandSchedules = &models.CommandSchedules{}

	if err = json.Unmarshal(body, schedules); err != nil {
		return nil, err
	}

	return schedules, nil
}

func GetCommandUsageById(apiBaseUri string, id int) (*models.CommandUsage, error) {
	var apiUrl string = apiBaseUri + "/commands/0/usages/" + strconv.Itoa(id)

	client := &http.Client{}
	req, err := NewRmapRequest("GET", apiUrl, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Add("Content-Type", "application/json")
	if err = AddBearerToken(req); err != nil {
		return nil, err
	}

	response, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	defer response.Body.Close()
	body, err := io.ReadAll(response.Body)

	if response.StatusCode != http.StatusOK {
		return nil, errors.New("error from server: " + string(response.Status))
	}

	if err != nil {
		return nil, errors.New("unable to read response from server")
	}

	var command *models.CommandUsage = &models.CommandUsage{}

	if err = json.Unmarshal([]byte(body), command); err != nil {
		return command, err
	}

	return command, nil
}

func GetCommandsByKeywords(apiBaseUri string, keywords string) (*models.Commands, error) {
	var apiUrl string = apiBaseUri + "/commands?keywords=" + keywords

	client := &http.Client{}
	req, err := NewRmapRequest("GET", apiUrl, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Add("Content-Type", "application/json")
	if err = AddBearerToken(req); err != nil {
		return nil, err
	}

	response, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	defer response.Body.Close()
	body, err := io.ReadAll(response.Body)

	if response.StatusCode != http.StatusOK {
		return nil, errors.New("error from server: " + string(response.Status))
	}

	if err != nil {
		return nil, errors.New("unable to read response from server")
	}

	var commands *models.Commands = &models.Commands{}

	if err = json.Unmarshal(body, commands); err != nil {
		return commands, err
	}

	return commands, nil
}

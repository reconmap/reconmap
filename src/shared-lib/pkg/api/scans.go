package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
)

const (
	ScanTaskRunning   = "running"
	ScanTaskSucceeded = "succeeded"
	ScanTaskFailed    = "failed"
)

type scanTaskStatusRequest struct {
	Status string `json:"status"`
	Error  string `json:"error,omitempty"`
}

func doAuthorised(req *http.Request, accessToken string) error {
	req.Header.Add("Authorization", "Bearer "+accessToken)

	response, err := DefaultHTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	if response.StatusCode < 200 || response.StatusCode >= 300 {
		body, _ := io.ReadAll(response.Body)
		return fmt.Errorf("unexpected status code from API: %s %s", response.Status, string(body))
	}

	return nil
}

// ReportScanTaskStatus tells the API how a scan task is progressing.
// errorMessage is only sent for failed tasks.
func ReportScanTaskStatus(apiBaseUri string, accessToken string, taskId int, status string, errorMessage string) error {
	payload, err := json.Marshal(scanTaskStatusRequest{Status: status, Error: errorMessage})
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/scans/tasks/%d/status", apiBaseUri, taskId), bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Add("Content-Type", "application/json")

	return doAuthorised(req, accessToken)
}

// UploadCommandOutput sends the output of a command to the API so it is parsed into the project.
func UploadCommandOutput(apiBaseUri string, accessToken string, commandUsageId string, projectId string, fileName string, content []byte) error {
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	if err := writer.WriteField("commandUsageId", commandUsageId); err != nil {
		return err
	}
	if err := writer.WriteField("projectId", projectId); err != nil {
		return err
	}
	part, err := writer.CreateFormFile("resultFile", fileName)
	if err != nil {
		return err
	}
	if _, err = part.Write(content); err != nil {
		return err
	}
	if err = writer.Close(); err != nil {
		return err
	}

	req, err := http.NewRequest("POST", apiBaseUri+"/commands/outputs", &body)
	if err != nil {
		return err
	}
	req.Header.Add("Content-Type", writer.FormDataContentType())

	return doAuthorised(req, accessToken)
}

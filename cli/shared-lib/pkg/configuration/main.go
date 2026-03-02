package configuration

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

func GetReconmapConfigDirectory() (string, error) {
	var configDir, err = os.UserConfigDir()
	if err != nil {
		return "", err
	}

	return filepath.Join(configDir, "reconmap"), nil
}

func SaveConfig[T any](config T, fileName string) (string, error) {
	var reconmapConfigDir, err = GetReconmapConfigDirectory()
	if err != nil {
		return "", err
	}

	if _, err := os.Stat(reconmapConfigDir); os.IsNotExist(err) {
		if err := os.MkdirAll(reconmapConfigDir, 0750); err != nil {
			return "", err
		}
	}

	jsondata, _ := json.MarshalIndent(config, "", " ")

	filepath := filepath.Join(reconmapConfigDir, fileName)
	err = os.WriteFile(filepath, jsondata, 0400)

	return filepath, err
}

func ReadConfig[T any](fileName string) (*T, error) {
	var reconmapConfigDir, err = GetReconmapConfigDirectory()
	if err != nil {
		return nil, err
	}

	path := filepath.Join(reconmapConfigDir, fileName)

	if _, err := os.Stat(path); os.IsNotExist(err) {
		return nil, err
	}

	jsonFile, err := os.Open(filepath.Clean(path))
	if err != nil {
		return nil, err
	}

	defer func() {
		if err := jsonFile.Close(); err != nil {
			fmt.Printf("Error closing file: %s\n", err)
		}
	}()

	bytes, _ := io.ReadAll(jsonFile)

	config := new(T)
	err = json.Unmarshal(bytes, config)

	return config, nil
}

func HasConfig(fileName string) bool {
	var reconmapConfigDir, err = GetReconmapConfigDirectory()
	if err != nil {
		return false
	}
	path := filepath.Join(reconmapConfigDir, fileName)

	if _, err := os.Stat(path); os.IsNotExist(err) {
		return false
	}

	return true
}

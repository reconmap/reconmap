package configuration

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"reflect"
	"strconv"
	"strings"
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

func overrideFromEnv(v reflect.Value, prefix string) {
	if v.Kind() == reflect.Ptr {
		v = v.Elem()
	}
	if v.Kind() != reflect.Struct {
		return
	}

	t := v.Type()
	for i := 0; i < v.NumField(); i++ {
		fieldVal := v.Field(i)
		fieldType := t.Field(i)

		// Skip unexported fields
		if !fieldVal.CanInterface() {
			continue
		}

		name := fieldType.Name
		jsonTag := fieldType.Tag.Get("json")
		if jsonTag != "" && jsonTag != "-" {
			parts := strings.Split(jsonTag, ",")
			if parts[0] != "" {
				name = parts[0]
			}
		}

		var nextPrefix string
		partName := toUpperSnakeCase(name)
		if prefix == "" {
			nextPrefix = "RMAP_" + partName
		} else {
			nextPrefix = prefix + "_" + partName
		}

		if fieldVal.Kind() == reflect.Struct {
			overrideFromEnv(fieldVal, nextPrefix)
		} else if fieldVal.CanSet() {
			envVal, exists := os.LookupEnv(nextPrefix)
			if exists {
				switch fieldVal.Kind() {
				case reflect.String:
					fieldVal.SetString(envVal)
				case reflect.Int:
					if intVal, err := strconv.Atoi(envVal); err == nil {
						fieldVal.SetInt(int64(intVal))
					}
				case reflect.Bool:
					fieldVal.SetBool(envVal == "true" || envVal == "1")
				}
			}
		}
	}
}

func toUpperSnakeCase(s string) string {
	var result strings.Builder
	for i, r := range s {
		if i > 0 && r >= 'A' && r <= 'Z' {
			result.WriteRune('_')
		}
		result.WriteRune(r)
	}
	return strings.ToUpper(result.String())
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
	if err != nil {
		return nil, err
	}

	overrideFromEnv(reflect.ValueOf(config), "")

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

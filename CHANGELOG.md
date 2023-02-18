# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Clone task feature
- Add user location (city, country) to audit log table
- Add 'Onboarding' project to new instances to help with initial setup
- Add logging level and handlers to config file

### Changed
- Updated Keycloak to version 20.0  (from 18.0)
- Application logs page removed in favour or centralised log management solutions such as Graylog

### Fixed
- 

## [2.0.0]

### Added
- [Keycloak](https://www.keycloak.org/) integration

### Changed
- Web client: Upgraded to Chakra v2
- Rest API: Upgraded to Monolog v3

### Fixed
- 

## [1.5.0]

### Added
- Configurable project categories
- Web client: Add refresh button to system logs page
- Web client: Allow to remove normal and small organisation logos
- Reporting: Management summary and conclusion added to projects
- Database: Added +900 commands from the Orange Cyberdefense arsenal tool (https://github.com/Orange-Cyberdefense/arsenal)
- Web client: Pagination to the command list
- Web client: Added searchable command dropdown to tasks
- Web client: Filter by assignee in task list page.
- Pagination to project list

### Changed
- Correctly deal with entity dependencies in the db (delete on cascade for most tables)
- Web client: Upgrade to React 18
- Log warning when trying to export invalid entity type
- Web client: The pagination component now can jump to any page

### Fixed
- Web client: Fixed issue with project template tasks not showing
- Web client: Fixed issue on the project creation form creating successful toast on failure

## 1.1.0

### Added
- Add licenses page on the Web client
- Add filters to the vulnerabilities page
- Add setting to allow * CORS origins
- Add priority filter for tasks
- Add multiple contacts to client (general, billing, technical)
- Add project credential vault (Thanks to Karel Rozhon)

### Changed
- Store user notifications on server (introduces ability to mark notifications as read/unread)

### Fixed

## 0.10.0

### Added
- Add support for vulnerability sub-categories
- Add support for Word/LibreOffice report templates.
- Add ability to launch commands from the Web client and see them running on an embedded terminal
- Add ability to set vulnerabilities as public or private. Private ones are not shown to the customer.
- Add ability to create and delete vulnerability categories
- Add health endpoint to API
- Add new health widget and page to Web client
- Add ability to search for tasks from the CLI
- Add new fields to vulnerabilities: remediation complexity, remediation priority, external ID, references
- Add option to sort vulnerability columns in the frontend
- Add project weekly report
- Add chart widgets to project page
- Add priority field to tasks

### Changed
- Return error messages if imported file is corrupt or invalid
- Change default ports (api=5500, webclient=5510, agent=5520/5530)
- Kubernetes definitions files were updated
- Change license to Apache 2.0
- Allow targets to have sub-targets (eg parent host 127.0.0.1, children ports 80, 443, 22, 3306, ...)
- User preferences (web client theme, dashboard widgets) are stored and retrieved from the server

## 0.9.5

### Added
- Add support for tags in vulnerabilities, commands and targets.
- Add link to API spec docs in the sidebar
- Add application logs to the web client
- Add list of projects as a tab in the client pages
- Add advanced search

### Changed
- Change some forms to show as popups instead of new pages

### Fixed
- Fixed logic that allowed to add existing members to projects.

## 0.9.0

### Added
- Add vulnerability statuses
- Add documents section
- Add archive project option
- Add bulk transition of tasks
- Add automatic password generation for new users
- Add new task due date
- Add new client role

### Changed
- New upload limits
- Rename existing user roles
- Change import/export format to JSON
- Change reports styling

## 0.8.5

### Added
- Introduce new commands views (CRUD)
- Introduce new task status (todo/doing/done) vs (open/closed)
- Add audit to delete target action
- Add full name and short bio fields to users

### Changed
- Upgrade composer dependencies 
- Stricter makefiles
- Return client and user information from various other entities
- Use all space available for forms

## 0.8.0

### Added
- Add rules of engagement to projects
- Add delete button to user page
- Add edit task page
- Add collapsable sidebar navigation

### Changed
- Record user agent in audit log

### Fixed
- Fix problem with minimum number of pages in paginator
- Fix link to import project templates

## 0.7.5

### Added
- Add support for notes at the project and vulnerability levels.
- Add makefile database migration target

### Changed
- Change application to no longer fail with the log file is not writable.

## 0.7.0

### Added
- Add basic functionality: clients, projects, tasks, vulnerabilities, ... 

[Unreleased]: https://github.com/reconmap/reconmap/compare/1.5.0...master 
[1.5.0]: https://github.com/reconmap/reconmap/compare/0.1.0...1.5.0


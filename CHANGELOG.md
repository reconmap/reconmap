# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.9.0]

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

## [0.8.5]

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

## [0.8.0]

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

## [0.7.5]

### Added
- Add support for notes at the project and vulnerability levels.
- Add makefile database migration target

### Changed
- Change application to no longer fail with the log file is not writable.

## [0.7.0]

### Added
- Add basic functionality: clients, projects, tasks, vulnerabilities, ... 

[Unreleased]: https://github.com/reconmap/rest-api/compare/0.9.0...master 
[0.9.0]: https://github.com/reconmap/rest-api/compare/0.8.5...0.9.0
[0.8.5]: https://github.com/reconmap/rest-api/compare/0.8.0...0.8.5
[0.8.0]: https://github.com/reconmap/rest-api/compare/0.7.5...0.8.0
[0.7.5]: https://github.com/reconmap/rest-api/compare/0.7.0...0.7.5
[0.7.0]: https://github.com/reconmap/rest-api/compare/0.0.1..0.7.0


# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2021-12-01

### Fixed

- /chart STUDIES delimiter changed to ';' from ',' due to conflicts with studies parameters.

### Changed

- config setting.js CHART_INPUT_STUDIES value must be an array.
- config setting.js DEFAULT_CHART_STUDIES setting change to ['EMA:50', 'EMA:200', 'RSI'].

### Added

- /chart include input 'back' button.
- Handle callback query error 403 Forbidden by sending a message "Please /start to re-initiate a conversation."

## [0.1.0] - 2021-11-27

- Initial commit.

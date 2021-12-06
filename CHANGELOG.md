# Changelog

All notable changes to this project will be documented in this file.

## [0.3.2] - 2021-12-06

### Changed

- Telebot sendMessage() to use chat id.

### Fixed

- Override telebot \_request() to handle 403 error with message.
- `/chart` and `/price` caption external link to use default size.

## [0.3.1] - 2021-12-05

### Added

- `/chart` and `/price` caption with external link.

### Changed

- Doc image `example.png`.
- Too many request messages by sendMessage() for consistency.

### Fixed

- `/start` incorrect github link.
- `/example` incorrect chart technical indicator.

## [0.3.0] - 2021-12-03

### Added

- Console option --log with default `VERBOSE`.
- Telegram market screener command support: `/overview`, `/performance`, `/oscillators` and `/moving_avgs`.

### Changed

- Use parsed setting.
- Input back button with character '« BACK'.
- Chart study caption to ids only. eg. "EMA:50;EMA:200:RSI" to "EMA,RSI"
- Telegram callback_query error handles without showing alerts and just sends error messages instead.

## [0.2.0] - 2021-12-01

### Added

- `/chart` include input 'back' button.
- Handle callback query error 403 Forbidden by sending a message "Please `/start` to re-initiate a conversation."

### Changed

- config setting.js `CHART_INPUT_STUDIES` value must be an array.
- config setting.js `DEFAULT_CHART_STUDIES` setting change to ['EMA:50', 'EMA:200', 'RSI'].

### Fixed

- `/chart` `STUDIES` delimiter changed to ';' from ',' due to conflicts with studies parameters.

## [0.1.0] - 2021-11-27

- Initial commit.

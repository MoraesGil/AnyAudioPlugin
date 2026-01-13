# Changelog

All notable changes to the AnySound Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-12

### Added
- Initial release of AnySound Plugin
- Set Input Device action - Switch microphone/audio input
- Set Output Device action - Switch speakers/headphones/audio output
- Real-time device detection via Hammerspoon
- Visual feedback with green (active) and gray (inactive) icons
- Persistent device settings across sessions
- Property Inspector UI for device selection
- Automatic device status polling when button is visible

### Changed
- N/A (Initial release)

### Fixed
- Type conversion bug: deviceIndex comparison now uses Number() === Number()
- Removed unnecessary 30-minute polling (optimization)
- Icon color updates only when button becomes active (onSetActive)
- Skip redundant API calls when device is already active

### Deprecated
- N/A

### Removed
- N/A

### Security
- N/A

## [Unreleased]

### Planned Features
- Volume control slider in Property Inspector
- Mute/unmute toggle action
- Audio level meter visualization
- Device hotkey support (switch without Ulanzi Deck)
- Audio routing matrix (input to output mapping)
- Multi-device profiles (switch multiple devices with one button)
- Windows support via alternative audio API

---

## Version History Summary

| Version | Date       | Description                           |
|---------|------------|---------------------------------------|
| 1.0.0   | 2026-01-12 | Initial release with basic features   |

---

### How to Read This Changelog

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security vulnerability fixes

For detailed commit history, see: https://github.com/moraesdev/AnyAudioPlugin/commits/main

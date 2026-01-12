# AnySound Plugin for Ulanzi Deck

**Version:** 1.0.0
**Author:** Moraes
**Last Updated:** January 12, 2026

## Overview

AnySound is a professional audio management plugin for Ulanzi Deck that enables seamless switching between audio input and output devices with a single button press. Perfect for content creators, streamers, and professionals who frequently switch between microphones, headphones, and speakers.

## Features

- **Instant Device Switching**: Change audio devices with a single button press
- **Two Action Types**:
  - **Set Input Device**: Switch microphone/audio input
  - **Set Output Device**: Switch speakers/headphones/audio output
- **Real-time Device Detection**: Automatically detects all available audio devices
- **Visual Feedback**:
  - Green icon when device is active
  - Gray icon when device is inactive
  - Loading state while switching
- **Persistent Settings**: Remembers your device configurations
- **macOS Integration**: Uses native `hammerspoon` for reliable device switching

## Installation

### Prerequisites

- macOS 10.11 or later
- Ulanzi Deck software installed
- Hammerspoon installed (for audio device control)

### Install Hammerspoon

```bash
# Install Hammerspoon via Homebrew
brew install --cask hammerspoon

# Or download from: https://www.hammerspoon.org/
```

### Install Plugin

1. **Manual Installation:**
   ```bash
   # Copy plugin to Ulanzi plugins directory
   cp -r "com.moraes.anysound.ulanziPlugin" \
         "$HOME/Library/Application Support/Ulanzi/UlanziDeck/Plugins/"
   ```

2. **Restart Ulanzi Studio**

3. **Verify Installation:**
   - Open Ulanzi Studio
   - Look for "AnySound" category in the action list
   - You should see two actions: "Set Input Device" and "Set Output Device"

## Usage

### Setting Up an Input Device Button

1. **Drag "Set Input Device" action** to a button on your Ulanzi Deck
2. **Right-click the button** → "Configure" (or open Property Inspector)
3. **Select your desired microphone** from the dropdown
4. **Click to test** - the button will switch to that input device

### Setting Up an Output Device Button

1. **Drag "Set Output Device" action** to a button on your Ulanzi Deck
2. **Right-click the button** → "Configure" (or open Property Inspector)
3. **Select your desired speaker/headphone** from the dropdown
4. **Click to test** - the button will switch to that output device

### Button States

- **Green Icon**: Device is currently active
- **Gray Icon**: Device is inactive (different device selected)
- **Loading (⌛)**: Switching in progress

### Example Setups

**Streaming Setup:**
- Button 1: "Set Input → Shure SM7B" (main microphone)
- Button 2: "Set Input → MacBook Microphone" (backup mic)
- Button 3: "Set Output → Studio Monitors"
- Button 4: "Set Output → Headphones"

**Meeting Setup:**
- Button 1: "Set Input → AirPods Pro"
- Button 2: "Set Output → AirPods Pro"
- Button 3: "Set Input → Desk Microphone"
- Button 4: "Set Output → Speakers"

## Project Structure

```
com.moraes.anysound.ulanziPlugin/
├── manifest.json              # Plugin metadata and configuration
├── app.js                     # Main application logic (source)
├── dist/
│   └── app.js                # Bundled application (production)
├── plugin/
│   └── actions/
│       ├── audioapi.js       # Core audio device API
│       ├── inputdevice.js    # Input device action class
│       └── outputdevice.js   # Output device action class
├── property-inspector/
│   └── config/
│       ├── inputdevice.html  # Input device settings UI
│       └── outputdevice.html # Output device settings UI
├── assets/
│   └── actions/
│       ├── input/            # Input device icons
│       └── output/           # Output device icons
├── libs/                     # Ulanzi SDK libraries
├── package.json              # Node.js dependencies
└── webpack.config.js         # Build configuration
```

## Technical Details

### How It Works

1. **Device Detection**:
   - Plugin uses Hammerspoon's `hs.audiodevice` API to query system audio devices
   - Runs a Lua script via Hammerspoon CLI to get device list

2. **Device Switching**:
   - When button is pressed, plugin executes a Hammerspoon script
   - Script changes the default audio device at the system level
   - Polling checks device status every time button becomes active

3. **State Management**:
   - Each button instance maintains its configured device ID
   - Plugin polls current system device when button is visible
   - Icon updates automatically based on active device

### API Integration

**Hammerspoon Commands:**

```lua
-- List all input devices
hs.audiodevice.allInputDevices()

-- List all output devices
hs.audiodevice.allOutputDevices()

-- Get default input device
hs.audiodevice.defaultInputDevice()

-- Get default output device
hs.audiodevice.defaultOutputDevice()

-- Set default input device
device = hs.audiodevice.findInputByName("Device Name")
device:setDefaultInputDevice()

-- Set default output device
device = hs.audiodevice.findOutputByName("Device Name")
device:setDefaultOutputDevice()
```

### Code Architecture

**audioapi.js** - Core API singleton:
- `AudioAPI.listInputDevices()` - Get all input devices
- `AudioAPI.listOutputDevices()` - Get all output devices
- `AudioAPI.getCurrentInputDevice()` - Get active input
- `AudioAPI.getCurrentOutputDevice()` - Get active output
- `AudioAPI.setInputDevice(name)` - Switch input device
- `AudioAPI.setOutputDevice(name)` - Switch output device

**inputdevice.js / outputdevice.js** - Action classes:
- Constructor: Initialize with context and settings
- `run()`: Execute device switch
- `setActive(active)`: Handle button visibility changes
- `setParams(params)`: Update settings from Property Inspector
- `updateIcon()`: Refresh button appearance based on device state

### Build Process

```bash
# Install dependencies
npm install

# Build production bundle
npm run build

# The build process:
# - Bundles app.js and all dependencies
# - Outputs to dist/app.js
# - Manifest.json points CodePath to dist/app.html
```

## Troubleshooting

### Plugin Not Appearing

**Problem:** AnySound doesn't show in Ulanzi Studio action list

**Solutions:**
1. Verify plugin directory:
   ```bash
   ls -la "$HOME/Library/Application Support/Ulanzi/UlanziDeck/Plugins/"
   ```
2. Check manifest.json is valid JSON:
   ```bash
   cat manifest.json | python3 -m json.tool
   ```
3. Restart Ulanzi Studio completely (Cmd+Q, then reopen)

### No Devices Listed

**Problem:** Device dropdown is empty in Property Inspector

**Solutions:**
1. Ensure Hammerspoon is installed:
   ```bash
   which hs
   # Should return: /usr/local/bin/hs or /opt/homebrew/bin/hs
   ```
2. Test Hammerspoon directly:
   ```bash
   hs -c "print(hs.audiodevice.allInputDevices())"
   ```
3. Grant Hammerspoon accessibility permissions:
   - System Preferences → Security & Privacy → Accessibility
   - Add Hammerspoon if not listed

### Device Not Switching

**Problem:** Button pressed but device doesn't change

**Solutions:**
1. Check Hammerspoon is running:
   ```bash
   pgrep Hammerspoon
   ```
2. Test device switching manually:
   ```bash
   hs -c 'device = hs.audiodevice.findOutputByName("Headphones"); device:setDefaultOutputDevice()'
   ```
3. Open Console.app and check for errors while pressing button
4. Verify device name matches exactly (case-sensitive)

### Icon Not Updating

**Problem:** Button icon stays gray even when device is active

**Solutions:**
1. Button only updates when visible on deck
2. Try switching to another page and back
3. Check console logs for API errors:
   - Open Developer Tools in Ulanzi Studio (Cmd+Option+I)
   - Look for errors in Console tab

### Build Errors

**Problem:** `npm run build` fails

**Solutions:**
1. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Ensure Node.js version 14+ is installed:
   ```bash
   node --version
   ```
3. Check webpack.config.js for syntax errors

## Development

### Setting Up Development Environment

```bash
# Clone or navigate to plugin directory
cd /Users/moraesdev/Desktop/AnyAudioPlugin

# Install dependencies
npm install

# Make changes to app.js or plugin/*.js files

# Build
npm run build

# Copy to Ulanzi plugins directory
cp -r . "$HOME/Library/Application Support/Ulanzi/UlanziDeck/Plugins/com.moraes.anysound.ulanziPlugin/"

# Restart Ulanzi Studio to test
```

### Key Files for Modification

- **app.js**: Main entry point, handles SDK connection and event routing
- **plugin/actions/audioapi.js**: Core audio device API, modify to add new audio features
- **plugin/actions/inputdevice.js**: Input device action logic
- **plugin/actions/outputdevice.js**: Output device action logic
- **property-inspector/config/*.html**: Settings UI for each action

### Adding New Features

To add a new audio-related action:

1. Create new action file in `plugin/actions/yourfeature.js`
2. Add action definition to `manifest.json`:
   ```json
   {
     "Name": "Your Feature",
     "UUID": "com.moraes.anysound.yourfeature",
     "Icon": "assets/actions/yourfeature/icon.png",
     "PropertyInspectorPath": "property-inspector/config/yourfeature.html"
   }
   ```
3. Create Property Inspector UI in `property-inspector/config/yourfeature.html`
4. Update `app.js` to import and handle new action
5. Build and test

## Known Issues

1. **Polling Interval**: Device state is checked when button becomes active, not continuously. This is by design to reduce system load.

2. **Device Name Changes**: If a device name changes (e.g., "AirPods" → "AirPods Pro"), you must reconfigure the button.

3. **Multiple Instances**: If the same device is configured on multiple buttons, all will show green when that device is active.

4. **macOS Only**: This plugin uses macOS-specific Hammerspoon integration. Windows/Linux versions would require different audio APIs.

## Version History

### v1.0.0 (January 12, 2026)
- ✅ Initial release
- ✅ Set Input Device action
- ✅ Set Output Device action
- ✅ Real-time device detection
- ✅ Visual feedback (green/gray icons)
- ✅ Persistent settings
- ✅ Bug fix: Type conversion for deviceIndex comparison
- ✅ Optimization: Removed 30min polling, only check on setActive

## Future Enhancements

- [ ] Volume control slider in Property Inspector
- [ ] Mute/unmute toggle action
- [ ] Audio level meter visualization
- [ ] Device hotkey support (switch without Ulanzi Deck)
- [ ] Audio routing matrix (input to output mapping)
- [ ] Multi-device profiles (switch multiple devices with one button)
- [ ] Windows support via alternative audio API

## License

This plugin is proprietary software developed by Moraes. All rights reserved.

## Support

For issues, questions, or feature requests, contact:
- Email: [Your Email]
- GitHub Issues: [If applicable]

## Acknowledgments

- Built with [Ulanzi Deck SDK](https://github.com/ulanzi/ulanzi-deck-sdk)
- Uses [Hammerspoon](https://www.hammerspoon.org/) for macOS audio control
- Inspired by the need for quick audio device switching in professional workflows

---

**Note:** This README assumes the plugin is stable and production-ready as of version 1.0.0. For development versions, refer to commit history and development notes.

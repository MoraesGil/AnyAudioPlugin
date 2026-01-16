# AnySound Plugin for Ulanzi Deck

**Version:** 2.0.0
**Author:** Moraes
**Last Updated:** January 16, 2026

## Overview

AnySound is a professional audio management plugin for Ulanzi Deck that provides complete audio control with device switching and independent mute toggles. Perfect for content creators, streamers, and professionals who need quick access to audio controls without leaving their workflow.

## Features

- **Instant Device Switching**: Change audio devices with a single button press
- **Four Action Types**:
  - **Set Input Device**: Switch microphone/audio input
  - **Set Output Device**: Switch speakers/headphones/audio output
  - **Microphone Mute Toggle**: 🎤 Mute/unmute microphone independently
  - **Output Mute Toggle**: 🔊 Mute/unmute speakers/headphones independently
- **Independent Mute Controls**:
  - Toggle buttons with no configuration needed
  - Mute state persists when switching devices
  - Dynamic labels show next action ("Mute" or "Unmute")
  - Detects external mute changes (via keyboard or other apps)
- **Real-time Device Detection**: Automatically detects all available audio devices
- **Visual Feedback**:
  - Green icon when device is active/unmuted
  - Red icon with slash/X when muted
  - Gray icon when device is inactive
  - Loading state while switching
- **Persistent Settings**: Remembers your device configurations
- **macOS Integration**: Uses native Hammerspoon API for reliable control

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
   - You should see four actions:
     - Set Input Device
     - Set Output Device
     - Microphone Mute Toggle
     - Output Mute Toggle

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

### Setting Up Microphone Mute Toggle

1. **Drag "Microphone Mute Toggle" action** to a button on your Ulanzi Deck
2. **No configuration needed** - it's ready to use!
3. **Click to toggle** - mutes/unmutes your current microphone
4. **Label shows next action**:
   - Shows "Mute" when microphone is active (click to mute)
   - Shows "Unmute" when microphone is muted (click to unmute)

### Setting Up Output Mute Toggle

1. **Drag "Output Mute Toggle" action** to a button on your Ulanzi Deck
2. **No configuration needed** - it's ready to use!
3. **Click to toggle** - mutes/unmutes your current speakers/headphones
4. **Label shows next action**:
   - Shows "Mute" when output is active (click to mute)
   - Shows "Unmute" when output is muted (click to unmute)

### Button States

**Device Switching Buttons:**
- **Green Icon**: Device is currently active
- **Gray Icon**: Device is inactive (different device selected)
- **Loading (⌛)**: Switching in progress

**Mute Toggle Buttons:**
- **Green Icon + "Mute" label**: Currently unmuted (click to mute)
- **Red Icon + "Unmute" label**: Currently muted (click to unmute)

### Example Setups

**Streaming Setup:**
- Button 1: "Set Input → Shure SM7B" (main microphone)
- Button 2: "Set Input → MacBook Microphone" (backup mic)
- Button 3: "Microphone Mute Toggle" (quick mute during stream)
- Button 4: "Set Output → Studio Monitors"
- Button 5: "Set Output → Headphones"
- Button 6: "Output Mute Toggle" (mute speakers quickly)

**Meeting Setup:**
- Button 1: "Set Input → AirPods Pro"
- Button 2: "Set Output → AirPods Pro"
- Button 3: "Microphone Mute Toggle" (mute during meetings)
- Button 4: "Set Input → Desk Microphone"
- Button 5: "Set Output → Speakers"
- Button 6: "Output Mute Toggle"

## Project Structure

```
com.moraes.anysound.ulanziPlugin/
├── manifest.json              # Plugin metadata and configuration
├── plugin/
│   ├── app.js                # Main application logic (source)
│   └── actions/
│       ├── audioapi.js       # Core audio device API
│       ├── inputdevice.js    # Input device action class
│       ├── outputdevice.js   # Output device action class
│       ├── micmute.js        # Microphone mute toggle action class
│       └── outputmute.js     # Output mute toggle action class
├── dist/
│   └── app.js                # Bundled application (production)
├── property-inspector/
│   └── config/
│       ├── inputdevice.html  # Input device settings UI
│       └── outputdevice.html # Output device settings UI
├── assets/
│   └── actions/
│       ├── input/            # Input device icons
│       ├── output/           # Output device icons
│       ├── micmute/          # Microphone mute icons
│       └── outputmute/       # Output mute icons
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

-- Microphone mute control
device = hs.audiodevice.defaultInputDevice()
device:inputMuted() -- Get mute status
device:setInputMuted(true) -- Mute
device:setInputMuted(false) -- Unmute

-- Output mute control
device = hs.audiodevice.defaultOutputDevice()
device:outputMuted() -- Get mute status
device:setOutputMuted(true) -- Mute
device:setOutputMuted(false) -- Unmute
```

### Code Architecture

**audioapi.js** - Core API singleton:
- `AudioAPI.listInputDevices()` - Get all input devices
- `AudioAPI.listOutputDevices()` - Get all output devices
- `AudioAPI.getCurrentInputDevice()` - Get active input
- `AudioAPI.getCurrentOutputDevice()` - Get active output
- `AudioAPI.setInputDevice(name)` - Switch input device
- `AudioAPI.setOutputDevice(name)` - Switch output device
- `AudioAPI.callAPI(endpoint)` - Generic HTTP API caller for mute endpoints

**inputdevice.js / outputdevice.js** - Device switching action classes:
- Constructor: Initialize with context and settings
- `run()`: Execute device switch
- `setActive(active)`: Handle button visibility changes
- `setParams(params)`: Update settings from Property Inspector
- `updateIcon()`: Refresh button appearance based on device state

**micmute.js / outputmute.js** - Mute toggle action classes:
- Constructor: Initialize with context, listen for device change events
- `run()`: Toggle mute/unmute with fast-click protection
- `refreshMuteStatus()`: Query current mute state from API
- `setActive(active)`: Refresh status when button becomes visible
- `updateIcon()`: Update button state and dynamic label ("Mute" or "Unmute")

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

### v2.0.0 (January 16, 2026)
- ✅ **NEW:** Microphone Mute Toggle action
- ✅ **NEW:** Output Mute Toggle action (speakers/headphones)
- ✅ **NEW:** Independent mute state (persists when switching devices)
- ✅ **NEW:** Dynamic labels showing next action ("Mute" or "Unmute")
- ✅ **NEW:** External mute change detection capability
- ✅ **NEW:** Fast-click protection on mute toggle buttons
- ✅ Enhanced API with mute control endpoints
- ✅ Event-driven architecture for device change monitoring

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
- [ ] Audio level meter visualization on buttons
- [ ] Device hotkey support (switch without Ulanzi Deck)
- [ ] Audio routing matrix (input to output mapping)
- [ ] Multi-device profiles (switch multiple devices with one button)
- [ ] Real-time external mute change sync to button UI
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

**Note:** This README assumes the plugin is stable and production-ready as of version 2.0.0. For development versions, refer to commit history and development notes.

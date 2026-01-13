#!/bin/bash
#
# Development Installation Script for AnySound Plugin
# This script builds and installs the plugin to Ulanzi Deck for testing
#

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Plugin info
PLUGIN_NAME="com.moraes.anysound.ulanziPlugin"
PLUGIN_DIR="$HOME/Library/Application Support/Ulanzi/UlanziDeck/Plugins/$PLUGIN_NAME"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  AnySound Plugin - Development Install${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if Ulanzi plugins directory exists
if [ ! -d "$HOME/Library/Application Support/Ulanzi/UlanziDeck/Plugins" ]; then
    echo -e "${RED}Error: Ulanzi Deck plugins directory not found!${NC}"
    echo "Please install Ulanzi Deck software first."
    exit 1
fi

# Check if Hammerspoon is installed
if ! command -v hs &> /dev/null; then
    echo -e "${YELLOW}Warning: Hammerspoon (hs) not found in PATH${NC}"
    echo "Install with: brew install --cask hammerspoon"
    echo ""
fi

# Build the plugin
echo -e "${YELLOW}Building plugin...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build successful${NC}"
echo ""

# Remove old installation
if [ -d "$PLUGIN_DIR" ]; then
    echo -e "${YELLOW}Removing old installation...${NC}"
    rm -rf "$PLUGIN_DIR"
    echo -e "${GREEN}✓ Old installation removed${NC}"
fi

# Create plugin directory
echo -e "${YELLOW}Installing plugin...${NC}"
mkdir -p "$PLUGIN_DIR"

# Copy files
cp -r dist "$PLUGIN_DIR/"
cp -r plugin "$PLUGIN_DIR/"
cp -r property-inspector "$PLUGIN_DIR/"
cp -r assets "$PLUGIN_DIR/"
cp -r libs "$PLUGIN_DIR/"
cp manifest.json "$PLUGIN_DIR/"

echo -e "${GREEN}✓ Plugin files copied${NC}"
echo ""

# Check if Ulanzi Studio is running
if pgrep -x "Ulanzi Studio" > /dev/null; then
    echo -e "${YELLOW}Ulanzi Studio is running.${NC}"
    read -p "Restart Ulanzi Studio now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Restarting Ulanzi Studio...${NC}"
        killall "Ulanzi Studio" || true
        sleep 2
        open -a "Ulanzi Studio"
        echo -e "${GREEN}✓ Ulanzi Studio restarted${NC}"
    else
        echo -e "${YELLOW}Please restart Ulanzi Studio manually to load the plugin.${NC}"
    fi
else
    echo -e "${YELLOW}Ulanzi Studio is not running.${NC}"
    read -p "Start Ulanzi Studio now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open -a "Ulanzi Studio"
        echo -e "${GREEN}✓ Ulanzi Studio started${NC}"
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Installation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Plugin installed to:"
echo "  $PLUGIN_DIR"
echo ""
echo "Next steps:"
echo "  1. Open Ulanzi Studio"
echo "  2. Look for 'AnySound' category"
echo "  3. Drag 'Set Input Device' or 'Set Output Device' to your deck"
echo ""

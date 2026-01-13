#!/bin/bash
#
# Uninstall Script for AnySound Plugin
# This script removes the plugin from Ulanzi Deck
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

echo -e "${RED}========================================${NC}"
echo -e "${RED}  AnySound Plugin - Uninstall${NC}"
echo -e "${RED}========================================${NC}"
echo ""

# Check if plugin is installed
if [ ! -d "$PLUGIN_DIR" ]; then
    echo -e "${YELLOW}Plugin is not installed.${NC}"
    exit 0
fi

echo "Plugin location:"
echo "  $PLUGIN_DIR"
echo ""

read -p "Are you sure you want to uninstall AnySound Plugin? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Uninstall cancelled.${NC}"
    exit 0
fi

echo -e "${YELLOW}Uninstalling plugin...${NC}"

# Remove plugin directory
rm -rf "$PLUGIN_DIR"

echo -e "${GREEN}✓ Plugin removed${NC}"
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
        echo -e "${YELLOW}Please restart Ulanzi Studio manually.${NC}"
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Uninstall Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

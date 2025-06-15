#!/bin/bash

# generate-icons.sh
# Generates browser extension icons from a 1024x1024 source image

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ICONS_DIR="$PROJECT_ROOT/src/icons"

# Source image path
SOURCE_IMAGE="$ICONS_DIR/icon1024.png"

# Target sizes for browser extensions
declare -a SIZES=("16" "48" "128")

echo -e "${GREEN}🎨 Browser Extension Icon Generator${NC}"
echo "=================================="

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo -e "${RED}❌ Error: ImageMagick is not installed${NC}"
    echo "Please install ImageMagick:"
    echo "  macOS: brew install imagemagick"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  Windows: Download from https://imagemagick.org"
    exit 1
fi

# Check if source image exists
if [ ! -f "$SOURCE_IMAGE" ]; then
    echo -e "${RED}❌ Error: Source image not found: $SOURCE_IMAGE${NC}"
    echo "Please place a 1024x1024 PNG image at: $SOURCE_IMAGE"
    exit 1
fi

# Verify source image dimensions
DIMENSIONS=$(magick identify -format "%wx%h" "$SOURCE_IMAGE")
if [ "$DIMENSIONS" != "1024x1024" ]; then
    echo -e "${YELLOW}⚠️  Warning: Source image is not 1024x1024 (current: $DIMENSIONS)${NC}"
    echo "For best results, use a 1024x1024 image"
fi

echo "Source: $SOURCE_IMAGE"
echo "Target directory: $ICONS_DIR"
echo ""

# Generate icons for each size
for size in "${SIZES[@]}"; do
    output_file="$ICONS_DIR/icon${size}.png"
    echo -e "Generating ${YELLOW}${size}x${size}${NC} icon..."
    
    magick "$SOURCE_IMAGE" -resize "${size}x${size}" "$output_file"
    
    if [ -f "$output_file" ]; then
        file_size=$(du -h "$output_file" | cut -f1)
        echo -e "  ✅ Created: icon${size}.png (${file_size})"
    else
        echo -e "  ${RED}❌ Failed to create: icon${size}.png${NC}"
        exit 1
    fi
done

echo ""
echo -e "${GREEN}✅ All icons generated successfully!${NC}"
echo ""
echo "Generated files:"
find "$ICONS_DIR" -name "icon*.png" -exec ls -la {} \; | while read -r line; do
    echo "  $line"
done

echo ""
echo "Next steps:"
echo "1. Run 'npm run build' to include new icons in the build"
echo "2. Reload the extension in your browser to see the new icons"
echo "3. Check the icons in:"
echo "   - Toolbar (16x16)"
echo "   - Extension management page (48x48)" 
echo "   - Chrome Web Store (128x128)"
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser extension project called "hover-copy-tool" that allows users to extract specific parts of URLs using regular expressions when hovering over links on web pages. The extension is designed for Chrome and Firefox, targeting web developers and QA engineers who frequently need to extract IDs or parameters from URLs.

## Current Status

The project is in its initial planning phase with:

- Comprehensive PRD (Product Requirements Document) in Japanese at `docs/PRD.md`
- Mise configuration for Node.js development environment
- No source code implementation yet

## Development Environment

The project uses Mise for development environment management:

- Node.js (latest version)
- Claude Code CLI tool

To set up the development environment:

```bash
mise install
```

## Planned Architecture

Based on the PRD, the extension will consist of:

### Core Components

- **Content Script**: Handles link hover detection and regex extraction
- **Popup Interface**: Configuration UI for managing regex patterns
- **Background Script**: Manages extension state and settings
- **Hover Window**: Displays extraction results and copy functionality

### Key Features

1. **URL Pattern Extraction**: Extract substrings from URLs using user-defined regex patterns
2. **Multi-pattern Support**: Users can save and switch between multiple regex configurations
3. **Hover Interface**: Non-intrusive popup showing extraction results
4. **Clipboard Integration**: Copy extracted strings with user confirmation
5. **Cross-browser Compatibility**: Support for Chrome and Firefox

## File Structure (To Be Implemented)

The project will need:

- `manifest.json` - Browser extension manifest
- `src/` - Source code directory
  - `content/` - Content scripts for webpage interaction
  - `popup/` - Extension popup UI
  - `background/` - Background scripts
- `package.json` - Node.js dependencies and build scripts
- Build configuration (webpack/rollup)
- Test framework setup

## Development Notes

- The PRD is written in Japanese and contains detailed functional specifications
- Focus on performance with pages containing many links
- Security considerations for user-defined regex patterns
- Intuitive UI design for both hover window and settings popup

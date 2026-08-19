# Group My Tabs

A Chrome extension that collects overflowing tabs into lists so you can find and reopen them later.

## Features

- **One-click grouping**: Click the toolbar icon to collect open tabs into lists
- **Keyboard shortcut**: `Command+G` (Mac) or `Ctrl+G` (Windows/Linux)
- **By site**: Collect tabs from the same domain
- **Idle tabs**: Collect tabs unused for 3+ hours
- **Search results**: Collect tabs opened from search engines
- **Context menu**: Right-click a page and choose **Group my tabs**
- **Restore**: Reopen a list in the current or a new window
- **Languages**: English, Chinese, Spanish, French, Arabic, Hindi, Portuguese, Bengali, Russian

## Installation

### From source
1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable Developer mode
4. Click Load unpacked and select this folder

## Usage

1. Click the Group My Tabs icon in the toolbar
2. Or press the keyboard shortcut
3. Or use the page context menu
4. Open **Options** from the extension menu to configure:
   - Group tabs per domain
   - Group rarely used tabs
   - Group search results
   - Show/hide context menu item
   - Remove duplicate tabs
   - Close blank tabs
5. Use **Open all links** to restore a list
6. Customize the shortcut at `chrome://extensions/shortcuts`

## Development

```
ext-group-tabs/
├── bg/                 # Background scripts
├── options/           # Settings page
├── whatsnew/          # What's new page
├── _locales/          # Internationalization
├── img/               # Icons and images
├── libs/              # Third-party libraries
├── group.html         # Main list interface
├── group.js           # Main grouping logic
├── group.css          # Styling
└── manifest.json      # Extension manifest
```

### Package

```bash
mkdir -p dist && zip -r "dist/group-my-tabs-v3.4-$(date +%Y%m%d-%H%M%S).zip" . -x "*.git*" "*.DS_Store*" "*.vscode*" "node_modules/*" "*.log" "dist/*"
```

## Permissions

- `tabs`: Access and manage browser tabs
- `storage`: Save preferences and shelved lists
- `contextMenus`: Add a right-click menu item

## Author

Shixin Guo

## Version

3.4

## License

This project is open source. See the license file for details.

# Group Your Tabs

A Chrome extension that helps you organize your tabs when you have too many open. Simply click the extension button and all your tabs will be grouped into pretty lists for better management.

## Background

This is a fork and open-source version of the original "Group Your Tabs" extension. The original v2 extension was removed from the Chrome Web Store, so we decided to fork the project and make it open source to keep this useful tool available for everyone.

## Features

- **One-click Tab Grouping**: Click the extension button to instantly organize all your open tabs
- **Domain-based Grouping**: Group tabs by domain/website
- **Rarely Used Tab Detection**: Automatically group tabs you haven't used in 3+ hours
- **Search Results Grouping**: Group tabs opened from search engines (Google, Yandex)
- **Context Menu Integration**: Right-click to quickly group tabs
- **Restore Groups**: Open all grouped tabs in current or new window
- **Multi-language Support**: Available in English and Russian

## Installation

### From Chrome Web Store
Visit the [Chrome Web Store page](https://chrome.google.com/webstore/detail/group-your-tabs/chaoejepfhlcelgpicelfccoiojpiofn) and click "Add to Chrome".

### From Source
1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder

## Usage

1. **Quick Grouping**: Click the extension icon in the toolbar to group all open tabs
2. **Context Menu**: Right-click on any webpage and select "Group!" from the context menu
3. **Settings**: Right-click the extension icon and select "Options" to configure:
   - Group tabs per domain
   - Group rarely used tabs
   - Group search results
   - Show/hide context menu item
4. **Restore Groups**: Click "Open all links" to restore grouped tabs

## Development

### Project Structure
```
ext-group-tabs/
├── bg/                 # Background scripts
├── options/           # Settings page
├── whatsnew/          # What's new page
├── _locales/          # Internationalization
├── img/               # Icons and images
├── libs/              # Third-party libraries
├── group.html         # Main grouping interface
├── group.js           # Main grouping logic
├── group.css          # Styling
└── manifest.json      # Extension manifest
```

### Build

Build zip file with timestamp to dist folder:

```bash
mkdir -p dist && zip -r "dist/group-tabs-extension-v2.0-$(date +%Y%m%d-%H%M%S).zip" . -x "*.git*" "*.DS_Store*" "*.vscode*" "node_modules/*" "*.log" "dist/*"
```

## Permissions

- `tabs`: To access and manage browser tabs
- `storage`: To save user preferences and grouped tabs
- `contextMenus`: To add right-click menu options

## Author

Vitaliy Potapov

## Version

2.0

## License

This project is open source. Please check the license file for more details.
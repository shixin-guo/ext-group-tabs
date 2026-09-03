# Privacy Policy for Group My Tabs

**Last updated:** September 3, 2025

This Privacy Policy describes how the "Group My Tabs" Chrome extension ("the extension", "we", "our") handles information. We believe privacy is a fundamental right, so the extension is designed to keep **all of your data on your own device**. Nothing is ever sent to us, to our servers, or to any third party — because we have no servers and collect no data.

By installing and using the extension, you agree to the practices described in this policy.

---

## 1. Data we collect

### 1.1 We do not collect personal information

The extension does **not** collect, transmit, or store any personal information, including (but not limited to) your name, email address, account credentials, browsing history, or any data that could identify you.

### 1.2 We do not use cookies or trackers

The extension contains **no cookies, no analytics, no advertising, no fingerprinting, and no tracking code** of any kind.

### 1.3 Data processed locally

To perform its core function — grouping the tabs in your current browser window — the extension reads the **titles and URLs of your currently open tabs** in the active window. This information is processed entirely on your device and is only used to build the grouping lists you see in the extension's interface.

---

## 2. How data is stored

### 2.1 Local storage only

When you ask the extension to shelve or group your tabs, the resulting lists (tab titles and URLs) and your extension preferences (settings you choose on the Options page) are saved using Chrome's built-in **`chrome.storage.local`** API.

This means your data is stored:

- **On your own computer**, inside your Chrome profile, and
- **Nowhere else.**

The extension does **not** use cloud storage, does not sync data to your Google account, and does not send data to any remote server.

### 2.2 Removing your data

All stored data can be removed by you at any time:

- Use the extension's own controls to delete individual saved lists, or
- Remove all extension data in Chrome by going to `chrome://extensions`, clicking **Details** on the extension, and choosing **Remove**, or by clearing the extension's site data / browser data for this extension.

---

## 3. How data is used

Tab titles and URLs are used exclusively for the purpose you request:

- Grouping and shelving your open tabs into lists.
- Restoring (reopening) those tabs later when you ask the extension to do so.
- Grouping tabs by domain, detecting idle or duplicate tabs, and identifying tabs opened from search results, as configured in the Options page.

This data is never used for any other purpose.

---

## 4. Sharing of data

The extension does **not** share, sell, rent, or disclose any data to any third party. There is nothing to share: no data ever leaves your device. The extension makes **no network requests at all** while it runs.

---

## 5. Permissions used

The extension requests the following Chrome permissions, each of which is needed for its core functionality:

| Permission  | Why it is needed |
| ----------- | ---------------- |
| `tabs`      | To read the titles and URLs of your open tabs so they can be grouped and restored. |
| `storage`   | To save your preferences and your shelved tab lists locally on your device (`chrome.storage.local`). |
| `contextMenus` | To add the optional "Group my tabs" item to the browser's right-click context menu. |

No permission grants access to your personal information, and no permission is used to collect or transmit data.

---

## 6. Children's privacy

The extension does not knowingly collect any personal information from anyone, including children under the age of 13. Because no data is collected at all, this policy applies equally to all users regardless of age.

---

## 7. Security

Because your data never leaves your device, the primary protection is that there is no remote attack surface for your data. Data is stored within the secure sandboxed storage provided by Chrome and is only accessible to the extension on your local machine.

---

## 8. Changes to this Privacy Policy

If this Privacy Policy changes, the "Last updated" date at the top of this page will be revised and the updated policy will be posted at the same location. Changes will be reflected in the version of the policy published with the extension.

---

## 9. Contact

If you have any questions about this Privacy Policy or the extension's handling of data, you can reach us at:

- **Developer:** Shixin Guo
- **Project page / repository:** <https://github.com/shixin-guo/ext-group-tabs>

---

_Summary: Group My Tabs is a privacy-friendly, offline extension. All tab grouping happens locally on your device, and all data is stored only in Chrome's local storage on your computer. We do not collect, transmit, sell, or share any personal data._

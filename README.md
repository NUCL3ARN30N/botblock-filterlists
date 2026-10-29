# BotBlock Filter Lists

[![GitHub stars](https://img.shields.io/github/stars/NUCL3ARN30N/botblock-filterlists?style=for-the-badge)](https://github.com/NUCL3ARN30N/botblock-filterlists/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/NUCL3ARN30N/botblock-filterlists?style=for-the-badge)](https://github.com/NUCL3ARN30N/botblock-filterlists/network/members)
[![GitHub issues](https://img.shields.io/github/issues/NUCL3ARN30N/botblock-filterlists?style=for-the-badge)](https://github.com/NUCL3ARN30N/botblock-filterlists/issues)
[![GitHub license](https://img.shields.io/github/license/NUCL3ARN30N/botblock-filterlists?style=for-the-badge)](LICENSE)

![JSON](https://img.shields.io/badge/JSON-000000?style=for-the-badge&logo=json&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
[![Validate filter lists](https://img.shields.io/github/actions/workflow/status/NUCL3ARN30N/botblock-filterlists/validate.yml?style=for-the-badge&label=validate)](https://github.com/NUCL3ARN30N/botblock-filterlists/actions/workflows/validate.yml)

> Community-maintained filter lists of chat/AI widget rules for [BotBlock](https://github.com/NUCL3ARN30N/BotBlock) — subscribe to a list instead of adding every vendor by hand

## Quick Start

1. Open BotBlock's options page (right-click the toolbar icon → **Options**, or the gear icon in the popup).
2. Under **Filter List Subscriptions**, paste this list's raw URL:

   ```
   https://raw.githubusercontent.com/NUCL3ARN30N/botblock-filterlists/main/filterlist.json
   ```

3. Click **Subscribe**. BotBlock refreshes subscribed lists automatically about once a day, or any time via the update button next to a subscription.

Each widget in a subscribed list is merged into BotBlock's blocking exactly like a built-in vendor —
network requests to its domains are blocked, and any leftover DOM is hidden by id/class/tag token
match. Per-site "allow" exceptions and the global Trusted Sites list both work on subscribed widgets too.

## Filter List Format

A filter list is a single JSON file:

```json
{
  "botblockFilterList": true,
  "name": "My Filter List",
  "version": 1,
  "updatedAt": "2026-08-05T00:00:00Z",
  "widgets": [
    {
      "key": "example-widget",
      "name": "Example Widget",
      "domains": ["widget.example.com"],
      "tokens": ["example-widget", "example-chat-launcher"]
    }
  ]
}
```

| Field                    | Required | Notes                                                          |
| ------------------------ | -------- | -------------------------------------------------------------- |
| **`botblockFilterList`** | yes      | Must be `true` — identifies the file as a BotBlock filter list |
| **`name`**               | no       | Shown in BotBlock's options page. Defaults to "Untitled list"  |
| **`widgets`**            | yes      | Array of widget rules (see below)                              |

## Widget Rules

Each entry in `widgets`:

| Field         | Required | Notes                                                                                                                                                                     |
| ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`key`**     | no       | Short slug identifying the vendor (e.g. `"acme-chat"`). Falls back to a slug of `name`. BotBlock prefixes it internally, so it only needs to be unique *within this list* |
| **`name`**    | **yes**  | Display name shown in BotBlock's UI                                                                                                                                       |
| **`domains`** | no       | Hostnames the widget loads from (script/iframe/XHR/websocket), blocked via `declarativeNetRequest`. Omit for a DOM-only rule                                              |
| **`tokens`**  | **yes**  | Substrings matched case-insensitively against an element's `id`, `class`, or tag name. At least one required. Literal substring, not a regex                              |

## Contributing a Widget

| #  | Step                                                                                                                  |
| -- | --------------------------------------------------------------------------------------------------------------------- |
| 1  | Fork this repo                                                                                                        |
| 2  | Add an entry to the `widgets` array in `filterlist.json` — keep it alphabetically sorted by `key`                     |
| 3  | Bump `updatedAt` to the current UTC time (`version` only changes on a breaking format change, not for adding widgets) |
| 4  | Run `node scripts/validate.js` locally and fix anything it flags                                                      |
| 5  | Open a PR with a short description of the vendor and, ideally, a public site where it's visible                       |

Keep `tokens` specific enough to avoid false positives — a generic token like `"chat"` alone would
match far more than the intended widget. Prefer vendor-specific substrings (e.g. `"acme-chat-widget"`
over `"chat-widget"`).

## Validation

Every PR runs `scripts/validate.js` in CI (see the badge above) and must pass before merging. It's a
dependency-free Node script, so `node scripts/validate.js` from the repo root reproduces the check exactly.

| #  | Check                                                                                                     |
| -- | --------------------------------------------------------------------------------------------------------- |
| 1  | Valid JSON, with `"botblockFilterList": true` and a `widgets` array                                       |
| 2  | Each widget has a `name` and at least one non-empty `tokens` entry                                        |
| 3  | `key`, if given, is a lowercase slug and unique within the file                                           |
| 4  | `domains`, if given, are bare hostnames — no `https://`, no path                                          |
| 5  | Tokens aren't a single overly generic word (`"chat"`, `"bot"`, `"widget"`, etc. alone)                    |
| 6  | No more than 200 widgets per file — BotBlock's per-list cap; anything beyond is silently dropped on fetch |

## Requirements

**Consumer:** [BotBlock](https://github.com/NUCL3ARN30N/BotBlock) with Filter List Subscriptions  
**Validator:** Node.js — no dependencies, no `npm install`

---

Badges from [envoy1084/awesome-badges](https://github.com/envoy1084/awesome-badges)

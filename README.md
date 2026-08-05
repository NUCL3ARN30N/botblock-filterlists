# BotBlock Filter Lists

Community-maintained filter lists of chat/AI widget rules for
[BotBlock](https://github.com/NUCL3ARN30N/BotBlock) — subscribe to a list
instead of adding every vendor to BotBlock's options page by hand.

## Subscribing

1. Open BotBlock's options page (right-click the toolbar icon → **Options**, or the gear icon in the popup).
2. Under **Filter List Subscriptions**, paste this list's raw URL:

   ```
   https://raw.githubusercontent.com/NUCL3ARN30N/botblock-filterlists/main/filterlist.json
   ```

3. Click **Subscribe**. BotBlock refreshes subscribed lists automatically about once a day, or any time via the update button next to a subscription.

Each widget in a subscribed list is merged into BotBlock's blocking exactly like a built-in vendor — network requests to its domains are blocked, and any leftover DOM is hidden by id/class/tag token match. Per-site "allow" exceptions and the global Trusted Sites list both work on subscribed widgets too.

## Filter list format

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

| Field | Required | Notes |
|---|---|---|
| `botblockFilterList` | yes | Must be `true` — identifies the file as a BotBlock filter list. |
| `name` | no | Shown in BotBlock's options page. Defaults to "Untitled list". |
| `widgets` | yes | Array of widget rules (see below). |

Each entry in `widgets`:

| Field | Required | Notes |
|---|---|---|
| `key` | no | A short slug identifying the vendor (e.g. `"acme-chat"`). Falls back to a slug of `name` if omitted. BotBlock prefixes it internally to avoid collisions, so it only needs to be unique *within this list*. |
| `name` | **yes** | Display name shown in BotBlock's UI. |
| `domains` | no | Hostnames the widget loads from (script/iframe/XHR/websocket). Used for network-level blocking via `declarativeNetRequest`. Omit for a DOM-only rule. |
| `tokens` | **yes** | Substrings matched (case-insensitively) against an element's `id`, `class`, or tag name to catch leftover DOM if the widget's script still loads. At least one required. Treated as a literal substring, not a regex. |

## Contributing a widget

1. Fork this repo.
2. Add an entry to the `widgets` array in `filterlist.json` — keep it alphabetically sorted by `key`.
3. Bump `updatedAt` to the current UTC time (`version` only needs bumping on a breaking format change, not for adding widgets).
4. Open a PR with a short description of the widget/vendor and, ideally, a public site where it's visible (helps reviewers verify the domain/token match without guessing).

Keep `tokens` specific enough to avoid false positives — a generic token like `"chat"` alone would match far more than the intended widget. Prefer vendor-specific substrings (e.g. `"acme-chat-widget"` over `"chat-widget"`).

## License

MIT — see [LICENSE](LICENSE).

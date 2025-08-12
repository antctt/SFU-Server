Mic Controller Queue Integration
================================

Overview
--------
When a participant raises or lowers their hand in MiroTalk SFU, the server can call an external “Mic Controller” backend to manage a speaking queue.

- On manual hand raise: send a POST to add the participant to the queue
- On manual hand lower: send a DELETE to remove the participant from the queue
- VIPs are skipped (no calls)
- Admin-driven hand lowers (mute, mute-all, explicit lower) do not trigger remove

Trigger Points
--------------
- Manual raise/lower via `updatePeerInfo(type='hand')` from the client UI
- Admin actions (mute/mute-all/lower-hand) will update UI state but are intentionally ignored by this integration for removal calls

External API Calls
------------------
- Add to queue (on raise):
  - Method: POST
  - URL: `{MICCTRL_BASE_URL}/api/queue/add`
  - Query params: `id=<peer_uuid>&source=online&name=<displayName>[&party_name=<Party Name>]`
  - Headers: `X-API-Key: <MICCTRL_API_KEY>`
  - Notes: `party_name` is optional; if available from Party Lookup, it will be sent

- Remove from queue (on manual lower):
  - Method: DELETE
  - URL: `{MICCTRL_BASE_URL}/api/queue/remove/<peer_uuid>`
  - Headers: `X-API-Key: <MICCTRL_API_KEY>`

Standalone Calls (manual examples)
---------------------------------

curl (bash)
```
# Add to queue (raise)
curl -X POST \
  "${MICCTRL_BASE_URL}/api/queue/add?id=abc123&source=online&name=John%20Doe&party_name=Partid%20Verde" \
  -H "X-API-Key: ${MICCTRL_API_KEY}"

# Remove from queue (manual lower)
curl -X DELETE \
  "${MICCTRL_BASE_URL}/api/queue/remove/abc123" \
  -H "X-API-Key: ${MICCTRL_API_KEY}"
```

PowerShell
```
$Base = $env:MICCTRL_BASE_URL
$Key  = $env:MICCTRL_API_KEY

# Add to queue (raise)
$id   = 'abc123'              # Use peer_uuid from admin participants
$name = [uri]::EscapeDataString('John Doe')
$party = [uri]::EscapeDataString('Partid Verde')
$url  = "$Base/api/queue/add?id=$id&source=online&name=$name&party_name=$party"
Invoke-RestMethod -Method Post -Uri $url -Headers @{ 'X-API-Key' = $Key }

# Remove from queue (manual lower)
$removeUrl = "$Base/api/queue/remove/$id"
Invoke-RestMethod -Method Delete -Uri $removeUrl -Headers @{ 'X-API-Key' = $Key }
```

Parameters
```
- id          (required): participant stable id (peer_uuid)
- source      (required): must be "online"
- name        (required): display name (URL-encoded)
- party_name  (optional): party name (URL-encoded) resolved via Party Lookup
```

Identity Used
-------------
- Uses `peer_uuid` as the stable participant identifier. Falls back to `peer_id` only if `peer_uuid` is missing.
- Admin participants listing (`GET /api/v1/admin/participants`) now returns `id = peer_uuid` (fallback: `peer_id`).

VIP Handling
------------
- VIPs defined in `ADMIN_VIP_PARTICIPANTS` or matching `ADMIN_VIP_PATTERNS` are excluded from both add and remove calls.

Configuration
-------------
Set the following environment variables in `.env` (already added in `.env.template`):

MICCTRL_ENABLED=true
MICCTRL_BASE_URL=https://mic-controller-backend.onrender.com
MICCTRL_API_KEY=your_key

# Optional: Party Lookup (to resolve party_name)
PARTY_LOOKUP_ENABLED=true
PARTY_LOOKUP_BASE_URL=https://vot.sector5.ro
PARTY_LOOKUP_API_KEY=your_party_lookup_key

- MICCTRL_ENABLED: feature toggle
- MICCTRL_BASE_URL: base URL of the Mic Controller backend
- MICCTRL_API_KEY: sent as `X-API-Key` header
- Source is always `online` as required by the external API

Behavior Details
----------------
- Debounced by state change: the server compares previous vs next `peer_hand` state to avoid duplicate outbound calls
- Calls are non-blocking; errors are logged and do not impact room flow
- 5s HTTP timeout is applied to outbound calls

How to Test Locally
-------------------
1) Enable in `.env`:
   - `MICCTRL_ENABLED=true`
   - `MICCTRL_BASE_URL=https://mic-controller-backend.onrender.com`
   - `MICCTRL_API_KEY=your_key`
2) `npm install` (first run), then `npm run start-dev`
3) Open `http://localhost:3010/room-test` in two tabs, raise/lower hand
4) Check server logs:
   - On raise: `MicCtrl add queued` (with party if resolved)
   - On manual lower: `MicCtrl removed from queue`
5) VIPs (names/patterns) will not trigger calls

Admin Participants API
----------------------
- Endpoint: `GET /api/v1/admin/participants`
- Header: `authorization: <ADMIN_API_KEY>`
- Response now includes `id` as `peer_uuid` (fallback: `peer_id`)

Troubleshooting
---------------
- Ensure `.env` changes are applied (restart process if not using nodemon)
- Verify `MICCTRL_ENABLED=true` and correct `MICCTRL_API_KEY`
- Confirm participant is not VIP if you expect calls
- Check network firewalls and that `{MICCTRL_BASE_URL}` is reachable



# MiroTalk SFU - Flutter App Integration Plan

## Overview

Add admin endpoints to MiroTalk SFU for Flutter app to manage participants across all rooms.

## Requirements

- View all participants from all active rooms
- See which participants have raised their hands
- Mute/unmute individual participants
- Mute all participants at once (with VIP bypass)
- Automatically lower hands when participants are muted
- Lower participant hand individually via admin action
- Real-time updates when participants change their own audio status

## API Endpoints

### 1. Get All Participants (✅ Implemented)

- **Endpoint**: `GET /api/v1/admin/participants`
- **Auth**: Admin API key in `authorization` header
- **Response**: List of all participants with their status (audio, video, hand, VIP, etc.)
- **Command:**
  ```powershell
  $resp = Invoke-RestMethod `
            http://localhost:3010/api/v1/admin/participants `
            -Headers @{ authorization = "my_admin_secret" }

  $resp.participants          # lists every participant
  ```

### 2. Toggle Participant Audio (✅ Implemented)

- **Endpoint**: `POST /api/v1/admin/participant/{participantName}/toggle-audio`
- **Auth**: Admin API key in `authorization` header
- **Action**: Toggles mute/unmute (auto-lowers hand when muted)
- **Command:**

```powershell
$participantName = "John Doe"      # <-- replace with participant's display name
$adminKey        = "my_admin_secret" # <-- replace

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3010/api/v1/admin/participant/$participantName/toggle-audio" `
  -Headers @{ authorization = $adminKey }
```

### 3. Enable Participant Audio (✅ Implemented)

- **Endpoint**: `POST /api/v1/admin/participant/{participantName}/enable-audio`
- **Auth**: Admin API key in `authorization` header
- **Action**: Forces unmute (auto-confirms president modal, participant still sees confirmation)
- **Command:**

```powershell
$participantName = "John Doe"      # <-- replace with participant's display name
$adminKey        = "my_admin_secret" # <-- replace

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3010/api/v1/admin/participant/$participantName/enable-audio" `
  -Headers @{ authorization = $adminKey }
```

### 4. Disable Participant Audio (✅ Implemented)

- **Endpoint**: `POST /api/v1/admin/participant/{participantName}/disable-audio`
- **Auth**: Admin API key in `authorization` header
- **Action**: Forces mute (auto-confirms president modal, participant still sees confirmation)
- **Command:**

```powershell
$participantName = "John Doe"      # <-- replace with participant's display name
$adminKey        = "my_admin_secret" # <-- replace

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3010/api/v1/admin/participant/$participantName/disable-audio" `
  -Headers @{ authorization = $adminKey }
```

### 5. Mute All Participants (✅ Implemented)

- **Endpoint**: `POST /api/v1/admin/mute-all`
- **Auth**: Admin API key in `authorization` header
- **Action**: Mute all non-VIP participants (auto-lowers hands)
- **Command:**

```powershell
$adminKey = "my_admin_secret" # <-- replace

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3010/api/v1/admin/mute-all" `
  -Headers @{ authorization = $adminKey }
```

### 6. Lower Participant Hand (✅ Implemented)

- **Endpoint**: `POST /api/v1/admin/participant/{participantName}/lower-hand`
- **Auth**: Admin API key in `authorization` header
- **Action**: Forces the participant's raised hand to be lowered (no audio change)
- **Command:**

```powershell
$participantName = "John Doe"      # <-- replace with participant's display name
$adminKey        = "my_admin_secret" # <-- replace

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3010/api/v1/admin/participant/$participantName/lower-hand" `
  -Headers @{ authorization = $adminKey }
```

## Implementation Details

### Configuration

Add to `config.template.js` in the main config object:

```javascript
admin: {
    enabled: process.env.ADMIN_ENABLED === 'true',
    apiKey: process.env.ADMIN_API_KEY || 'mirotalksfu_admin_secret',
    vipParticipants: process.env.ADMIN_VIP_PARTICIPANTS ? 
        process.env.ADMIN_VIP_PARTICIPANTS.split(',').map(name => name.trim()) : [],
    vipPatterns: process.env.ADMIN_VIP_PATTERNS ? 
        process.env.ADMIN_VIP_PATTERNS.split(',').map(pattern => pattern.trim()) : [],
}
```

### Data Structure

Map existing `peer_info` to admin response:

- `peer_info.peer_name` → `name`
- `peer_info.peer_audio` → `isAudioEnabled`
- `peer_info.peer_video` → `isVideoEnabled`
- `peer_info.peer_screen` → `isScreenSharing`
- `peer_info.peer_hand` → `hasRaisedHand`
- `peer_info.peer_presenter` → `isPresenter`
- Add `isVip` field based on VIP configuration

### Authentication

- Use same header-based auth as existing API (`authorization` header)
- Admin API key is separate from regular API key
- Admin endpoints bypass room security completely

### Error Handling

- Return 403 if admin is disabled
- Return 404 if participant not found
- Return 200 with empty array if no rooms/participants
- Return 400 for invalid requests

### Integration Points

- Access existing `roomList` Map in `Server.js`
- Iterate through all rooms and their peers
- Use existing `ServerApi.js` class for consistency
- Extend existing Socket.IO handlers for real-time events

### VIP System

- Exact name matching from `vipParticipants` array
- Pattern matching using `*` wildcards (e.g., `*Manager*`)
- VIPs protected from bulk mute operations
- Individual mute can still affect VIPs

### WebSocket Events

Extend existing Socket.IO to emit admin events:

- `admin:participantAudioChanged`
- `admin:participantHandChanged`
- `admin:participantJoined`
- `admin:participantLeft`

### Testing

Test scenarios:

- Admin authentication (valid/invalid key)
- Empty room list
- Rooms with no participants
- VIP detection and protection
- Hand lowering when muting
- Cross-room participant access

## Implementation Order

1. Add admin config to `config.template.js`
2. Extend `ServerApi.js` with admin methods
3. Add admin endpoints to `Server.js`
4. Add admin authentication logic
5. Implement VIP system
6. Add WebSocket event emission
7. Write tests
8. Test with Flutter app

## Environment Variables

```bash
ADMIN_ENABLED=true
ADMIN_API_KEY=your_admin_secret_key
ADMIN_VIP_PARTICIPANTS=Alice Smith,Bob Johnson
ADMIN_VIP_PATTERNS=*Manager*,*Director*
```

## Developer Notes & Troubleshooting (added after first endpoint implementation)

These tips capture all the hiccups we faced while wiring up `GET /api/v1/admin/participants` so the next endpoints are smoother.

### 1. Register admin routes **before** generic catch-alls

Express matches paths top-down. The existing handler

```js
app.get('/:roomId', …)
```

will swallow any request whose first segment isn't already matched (e.g. `/api/…` becomes `roomId = 'api'`).
Always place new API routes (e.g. `/api/v1/admin/*`) **above** that catch-all or tighten its pattern.

### 2. Restart the Node process after code / .env edits

`nodemon` handles this automatically, but for plain `npm run start` you must `Ctrl-C` and re-launch or the changes won't load.

### 3. Testing from PowerShell

* `curl`

### 4. Participant Identification Change (Updated)

**Previous**: Admin APIs used `peer_id` (socket.id) for participant identification
**Current**: Admin APIs now use `peer_name` (display name) for easier integration

**Benefits**:
- No need to lookup `peer_id` from participant list
- Direct integration with apps that only know participant names
- Simpler API usage for external applications

**Considerations**:
- URL-encode participant names with spaces (e.g., "John Doe" → "John%20Doe")
- First match wins if duplicate names exist
- Performance: O(n) lookup instead of O(1) Map access

# Flutter App Real-Time API Documentation

## Overview

This document describes the API endpoints that the Flutter app must expose to receive real-time updates from MiroTalk SFU server. The Flutter app will maintain two sections:

1. **"People Who Want to Speak"** - Participants with hand raised AND mic OFF
2. **"People Speaking"** - Participants with mic ON

## Base URL

```
http://flutter-app:port/api/realtime
```

## Authentication

All endpoints require authentication. Use the same admin API key as MiroTalk SFU:

```
Authorization: your_admin_secret_key
```

## Endpoints

### 1. Participant Hand Changed

**Endpoint:** `POST /api/realtime/hand-changed`

**Description:** Called when a participant raises or lowers their hand

**Request Body:**

```json
{
  "participantId": "abc123",
  "name": "John Doe",
  "hasRaisedHand": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Hand change event received"
}
```

**Flutter App Logic:**

- If `hasRaisedHand: true` → Add to "People Who Want to Speak" section
- If `hasRaisedHand: false` → Remove from "People Who Want to Speak" section

### 2. Participant Audio Changed

**Endpoint:** `POST /api/realtime/audio-changed`

**Description:** Called when a participant changes their audio status (mute/unmute)

**Request Body:**

```json
{
  "participantId": "abc123",
  "name": "John Doe",
  "isAudioEnabled": true,
  "timestamp": "2024-01-15T10:32:00Z"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Audio change event received"
}
```

**Flutter App Logic:**

- If `isAudioEnabled: true` → Add to "People Speaking" section AND remove from "People Who Want to Speak" section
- If `isAudioEnabled: false` → Remove from "People Speaking" section

## Error Handling

### HTTP Status Codes

- `200 OK` - Event processed successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Invalid or missing API key
- `500 Internal Server Error` - Flutter app error

### Error Response Format

```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE"
}
```

## Implementation Notes

### 1. Idempotency

All endpoints should be idempotent. Receiving the same event multiple times should not cause issues.

### 2. Event Ordering

Events may arrive out of order. Flutter app should handle this gracefully:

- Use timestamps to determine event order
- Maintain consistent state regardless of event arrival order

### 3. Retry Logic

MiroTalk SFU will implement retry logic for failed requests:

- Exponential backoff (1s, 2s, 4s, 8s)
- Maximum 3 retry attempts
- Events older than 30 seconds will be dropped

## Flutter App State Management

### Data Structures

```dart
// Participant in "Want to Speak" section
class WantToSpeakParticipant {
  final String participantId;
  final String name;
  final DateTime timestamp;
}

// Participant in "Speaking" section  
class SpeakingParticipant {
  final String participantId;
  final String name;
  final DateTime timestamp;
}
```

### State Updates

```dart
// Example state management logic
void handleHandChanged(Map<String, dynamic> data) {
  final participantId = data['participantId'];
  final hasRaisedHand = data['hasRaisedHand'];
  
  if (hasRaisedHand) {
    // Add to "Want to Speak" section
    wantToSpeakList.add(WantToSpeakParticipant(...));
  } else {
    // Remove from "Want to Speak" section
    wantToSpeakList.removeWhere((p) => p.participantId == participantId);
  }
}

void handleAudioChanged(Map<String, dynamic> data) {
  final participantId = data['participantId'];
  final isAudioEnabled = data['isAudioEnabled'];
  
  if (isAudioEnabled) {
    // Add to "Speaking" section
    speakingList.add(SpeakingParticipant(...));
    // Remove from "Want to Speak" section (they're now speaking)
    wantToSpeakList.removeWhere((p) => p.participantId == participantId);
  } else {
    // Remove from "Speaking" section
    speakingList.removeWhere((p) => p.participantId == participantId);
  }
}
```

## Testing

### Test Scenarios

1. **Hand raised** → Should appear in "Want to Speak" section
2. **Hand lowered** → Should remove from "Want to Speak" section
3. **Mic turned ON** → Should add to "Speaking" section AND remove from "Want to Speak" section
4. **Mic turned OFF** → Should remove from "Speaking" section
5. **Hand raised + Mic ON** → Should appear in "Speaking" section only (hand event adds to "Want to Speak", then audio event moves to "Speaking")

### Test Commands

```bash
# Test 1: Hand raised
curl -X POST http://flutter-app:port/api/realtime/hand-changed \
  -H "Authorization: your_admin_secret_key" \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "test123",
    "name": "Test User",
    "hasRaisedHand": true,
    "timestamp": "2024-01-15T10:30:00Z"
  }'

# Test 2: Hand lowered
curl -X POST http://flutter-app:port/api/realtime/hand-changed \
  -H "Authorization: your_admin_secret_key" \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "test123",
    "name": "Test User",
    "hasRaisedHand": false,
    "timestamp": "2024-01-15T10:31:00Z"
  }'

# Test 3: Mic turned ON
curl -X POST http://flutter-app:port/api/realtime/audio-changed \
  -H "Authorization: your_admin_secret_key" \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "test123",
    "name": "Test User",
    "isAudioEnabled": true,
    "timestamp": "2024-01-15T10:32:00Z"
  }'

# Test 4: Mic turned OFF
curl -X POST http://flutter-app:port/api/realtime/audio-changed \
  -H "Authorization: your_admin_secret_key" \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "test123",
    "name": "Test User",
    "isAudioEnabled": false,
    "timestamp": "2024-01-15T10:33:00Z"
  }'
```

## Security Considerations

1. **API Key Validation** - Validate admin API key on every request
2. **Input Validation** - Validate all incoming data
3. **Rate Limiting** - Prevent abuse
4. **HTTPS** - Use HTTPS in production
5. **Logging** - Log all events for debugging and audit

## Integration with MiroTalk SFU

The MiroTalk SFU server will call these endpoints when:

- **`hand-changed`**: Participant raises or lowers their hand
- **`audio-changed`**: Participant changes their audio status (mute/unmute)
- **Admin actions**: When admin mutes/unmutes participants (triggers `audio-changed`)

### Event Flow Examples:

1. **Participant raises hand** → `hand-changed` with `hasRaisedHand: true`
2. **Participant turns on mic** → `audio-changed` with `isAudioEnabled: true` (also removes from "Want to Speak")
3. **Admin mutes participant** → `audio-changed` with `isAudioEnabled: false`
4. **Participant lowers hand** → `hand-changed` with `hasRaisedHand: false`

No confirmation of admin actions is sent - assume they succeed unless explicitly failed.

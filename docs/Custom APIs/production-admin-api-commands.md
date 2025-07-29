# Production Admin API Commands

This document contains curl commands for the MiroTalk SFU production admin APIs at `https://conf.sector5.ro`.

## Prerequisites

- API Key: `"4a1f9b7c2e8d4f6a9c3b5e7f1a2d3c4e"`
- Replace `"John Doe"` with actual participant names from the `/participants` response
- Ensure you have `curl` installed on your system

## API Commands

### 1. Get All Participants

**Bash/Linux/macOS:**

```bash
curl -X GET "https://conf.sector5.ro/api/v1/admin/participants" \
  -H "authorization: 4a1f9b7c2e8d4f6a9c3b5e7f1a2d3c4e"
```

**Windows Command Prompt:**

```cmd
curl -X GET "https://conf.sector5.ro/api/v1/admin/participants" -H "authorization: 4a1f9b7c2e8d4f6a9c3b5e7f1a2d3c4e"
```

### 2. Enable Participant Audio

**Bash/Linux/macOS:**

```bash
curl -X POST "https://conf.sector5.ro/api/v1/admin/participant/John%20Doe/enable-audio" \
  -H "authorization: 4a1f9b7c2e8d4f6a9c3b5e7f1a2d3c4e"
```

**Windows Command Prompt:**

```cmd
curl -X POST "https://conf.sector5.ro/api/v1/admin/participant/John%%20Doe/enable-audio" -H "authorization: 4a1f9b7c2e8d4f6a9c3b5e7f1a2d3c4e"
```

### 3. Disable Participant Audio

**Bash/Linux/macOS:**

```bash
curl -X POST "https://conf.sector5.ro/api/v1/admin/participant/John%20Doe/disable-audio" \
  -H "authorization: 4a1f9b7c2e8d4f6a9c3b5e7f1a2d3c4e"
```

**Windows Command Prompt:**

```cmd
curl -X POST "https://conf.sector5.ro/api/v1/admin/participant/John%%20Doe/disable-audio" -H "authorization: 4a1f9b7c2e8d4f6a9c3b5e7f1a2d3c4e"
```

### 4. Mute All Participants

**Bash/Linux/macOS:**

```bash
curl -X POST "https://conf.sector5.ro/api/v1/admin/mute-all" \
  -H "authorization: 4a1f9b7c2e8d4f6a9c3b5e7f1a2d3c4e"
```

**Windows Command Prompt:**

```cmd
curl -X POST "https://conf.sector5.ro/api/v1/admin/mute-all" -H "authorization: 4a1f9b7c2e8d4f6a9c3b5e7f1a2d3c4e"
```

### 5. Lower Participant Hand

**Bash/Linux/macOS:**

```bash
curl -X POST "https://conf.sector5.ro/api/v1/admin/participant/John%20Doe/lower-hand" \
  -H "authorization: 4a1f9b7c2e8d4f6a9c3b5e7f1a2d3c4e"
```

**Windows Command Prompt:**

```cmd
curl -X POST "https://conf.sector5.ro/api/v1/admin/participant/John%%20Doe/lower-hand" -H "authorization: 4a1f9b7c2e8d4f6a9c3b5e7f1a2d3c4e"
```

## Quick Test Commands

### Test Connection and Get Participants (with pretty printing)

**Bash/Linux/macOS:**

```bash
curl -X GET "https://conf.sector5.ro/api/v1/admin/participants" \
  -H "authorization: 4a1f9b7c2e8d4f6a9c3b5e7f1a2d3c4e" \
  | jq '.'
```

**Windows Command Prompt:**

```cmd
curl -X GET "https://conf.sector5.ro/api/v1/admin/participants" -H "authorization: 4a1f9b7c2e8d4f6a9c3b5e7f1a2d3c4e"
```

## Response Examples

### Get All Participants Response

```json
{
  "participants": [
    {
      "id": "abc123",
      "name": "John Doe",
      "isAudioEnabled": true,
      "isVideoEnabled": false,
      "hasRaisedHand": false,
      "isVip": false,
      "roomId": "room1"
    },
    {
      "id": "def456",
      "name": "Cameraman",
      "isAudioEnabled": true,
      "isVideoEnabled": true,
      "hasRaisedHand": false,
      "isVip": true,
      "roomId": "room1"
    }
  ]
}
```

### Success Response (for POST operations)

```json
{
  "participantName": "John Doe",
  "peerId": "abc123def456",
  "action": "unmute"
}
```

## Important Notes

- **VIP Protection**: The "Cameraman" participant is configured as VIP and will be protected from bulk mute operations
- **HTTPS**: All production calls use HTTPS for secure communication
- **Error Handling**: Check HTTP status codes and response messages for error details
- **Rate Limiting**: Be mindful of API call frequency in production
- **URL Encoding**: Participant names with spaces must be URL-encoded (e.g., "John Doe" becomes "John%20Doe")
- **Name Matching**: Uses exact name matching (first match wins if duplicates exist)

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check that your admin API key is correct
2. **404 Not Found**: Verify the participant name exists (URL-encode spaces as %20)
3. **403 Forbidden**: Ensure admin functionality is enabled in production
4. **500 Internal Server Error**: Contact system administrator

### Debug Commands

**Verbose curl output:**

```bash
curl -v -X GET "https://conf.sector5.ro/api/v1/admin/participants" \
  -H "authorization: 4a1f9b7c2e8d4f6a9c3b5e7f1a2d3c4e"
```

**Check HTTP status only:**

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -X GET "https://conf.sector5.ro/api/v1/admin/participants" \
  -H "authorization: 4a1f9b7c2e8d4f6a9c3b5e7f1a2d3c4e"
```

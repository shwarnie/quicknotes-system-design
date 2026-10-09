# QuickNotes API Design

This is the REST API the backend team should build (not JSONPlaceholder). Base URL: `https://api.quicknotes.example/v1`. All bodies are JSON. All endpoints except `POST /auth/login` need the header `Authorization: Bearer <token>`. Users only see their own notes.

## Endpoints

| # | Method | Path | Description | Success status |
|---|--------|------|-------------|----------------|
| 1 | POST | `/auth/login` | Exchange email and password for a token | 200 OK |
| 2 | GET | `/notes?limit=10&cursor=...&tag=work` | List my notes (newest first, paginated, optional tag filter) | 200 OK |
| 3 | POST | `/notes` | Create a note | 201 Created |
| 4 | GET | `/notes/{id}` | Get one note | 200 OK |
| 5 | PUT | `/notes/{id}` | Replace a note (title, body, tags) | 200 OK |
| 6 | DELETE | `/notes/{id}` | Delete a note | 204 No Content |
| 7 | GET | `/tags` | List my tags | 200 OK |
| 8 | POST | `/notes/{id}/tags` | Attach a tag to a note | 201 Created |
| 9 | DELETE | `/notes/{id}/tags/{tagId}` | Remove a tag from a note | 204 No Content |

Design rules: nouns in paths (plural), HTTP verbs carry the action, stateless requests, cursor pagination (stable when notes are added), versioned URL (`/v1`).

## Example: create a note

`POST /notes`

```json
{
  "title": "Buy milk",
  "body": "2 litres, full cream",
  "tags": ["errands"]
}
```

Response `201 Created` with header `Location: /v1/notes/5021`:

```json
{
  "id": 5021,
  "title": "Buy milk",
  "body": "2 litres, full cream",
  "tags": ["errands"],
  "userId": 17,
  "createdAt": "2026-10-09T08:15:00Z",
  "updatedAt": "2026-10-09T08:15:00Z"
}
```

## Example: list notes

`GET /notes?limit=2`

Response `200 OK`:

```json
{
  "data": [
    { "id": 5021, "title": "Buy milk", "body": "2 litres, full cream", "tags": ["errands"], "createdAt": "2026-10-09T08:15:00Z" },
    { "id": 5020, "title": "Team notes", "body": "Agenda for Monday", "tags": ["work"], "createdAt": "2026-10-08T16:40:00Z" }
  ],
  "nextCursor": "eyJpZCI6NTAyMH0=",
  "count": 2
}
```

An empty list is still `200 OK` with `"data": []` (not 404).

## Error codes

| Status | Meaning | When |
|--------|---------|------|
| 400 Bad Request | Invalid input | Missing title, title over 100 characters, malformed JSON |
| 401 Unauthorized | Not authenticated | Missing, expired or invalid token |
| 403 Forbidden | Authenticated but not allowed | Accessing another user's note |
| 404 Not Found | Resource does not exist | Unknown note id or path |
| 429 Too Many Requests | Rate limit exceeded | Too many requests per minute |
| 500 Internal Server Error | Server bug or outage | Unhandled exception, database down |

Every error uses the same body shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required and must be at most 100 characters.",
    "status": 400,
    "details": [{ "field": "title", "issue": "too_long", "max": 100 }],
    "requestId": "req_8f2c1a"
  }
}
```

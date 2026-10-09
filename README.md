# QuickNotes System Design

QuickNotes is moving from a browser-only app to an online service for 1 million users. This repository has two parts:

1. **A front-end API client** (HTML, CSS, JavaScript) that proves the browser can talk to a REST API. It uses the [JSONPlaceholder](https://jsonplaceholder.typicode.com/) practice API to load, create and delete notes.
2. **Three design documents** that the backend team can build from: the API design, the data model and the system architecture.

## How to run the API client

No build step or install is needed.

1. Clone the repo: `git clone https://github.com/your-username/quicknotes-system-design.git`
2. Open `index.html` in a browser (or run `python3 -m http.server 8000` and visit `http://localhost:8000`).
3. Click **Load notes** to fetch 10 notes (GET).
4. Fill in the form and click **Create note** (POST). The title is required (max 100 characters).
5. Click **Delete** on any note (DELETE).

Note: JSONPlaceholder is a fake API, so created and deleted notes are not really stored. See the comment above `deleteNote()` in `api.js` for how this is handled.

## Documents

- [API design](docs/api-design.md) - REST endpoints, JSON examples and error codes
- [Data model](docs/data-model.md) - tables, relationships, SQL and the SQL vs NoSQL decision
- [Architecture](docs/architecture.md) - requirements, load estimate, diagram, request flows and trade-offs

## What I learned

- **REST in practice:** each HTTP method has a clear meaning (GET reads, POST creates and returns 201, DELETE removes), and a reusable `request()` function that checks `response.ok` keeps error handling in one place, because `fetch` does not throw on 404 or 500.
- **Good UIs show every state:** loading, success, error and empty states, plus disabling buttons during requests, make an app feel reliable and prevent duplicate submissions. Using `textContent` instead of `innerHTML` prevents XSS.
- **Data modelling:** a many-to-many relationship (notes and tags) needs a join table, and indexes should match the most frequent query (`user_id, created_at`).
- **Back-of-the-envelope estimates drive design:** 1M users is only ~1,000 reads/s and ~100 writes/s at peak, so the real challenge is availability, not raw throughput.
- **Every component solves a specific problem,** and each one introduces trade-offs (cache staleness, replica lag) and a possible single point of failure that must be removed with redundancy.

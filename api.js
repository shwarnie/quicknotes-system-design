// QuickNotes API client - talks to the JSONPlaceholder practice API.
const API_URL = "https://jsonplaceholder.typicode.com/posts";
const MAX_TITLE_LENGTH = 100;

const loadBtn = document.getElementById("load-btn");
const submitBtn = document.getElementById("submit-btn");
const statusEl = document.getElementById("status");
const listEl = document.getElementById("notes-list");
const form = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");

// ---------- UI helpers ----------

// type: "loading" | "success" | "error" (styled differently in style.css)
function setStatus(message, type) {
  statusEl.textContent = message; // textContent only, never innerHTML
  statusEl.className = type || "";
}

// Disable every button that can start a request while one is running.
function setBusy(busy) {
  loadBtn.disabled = busy;
  submitBtn.disabled = busy;
  listEl.querySelectorAll(".delete-btn").forEach((b) => (b.disabled = busy));
}

function removeEmptyState() {
  const empty = listEl.querySelector("li.empty");
  if (empty) empty.remove();
}

function showEmptyState() {
  const li = document.createElement("li");
  li.className = "empty";
  li.textContent = "No notes yet. Load notes or create one above.";
  listEl.appendChild(li);
}

function createNoteItem(note) {
  const li = document.createElement("li");
  li.dataset.id = note.id;

  const h = document.createElement("h3");
  h.textContent = note.title;      // user/server text: textContent only

  const p = document.createElement("p");
  p.textContent = note.body || "";

  const del = document.createElement("button");
  del.type = "button";
  del.className = "delete-btn";
  del.textContent = "Delete";
  del.addEventListener("click", () => deleteNote(note.id, li));

  li.append(h, p, del);
  return li;
}

function renderNotes(notes) {
  listEl.replaceChildren();
  if (notes.length === 0) {
    showEmptyState();
    return;
  }
  notes.forEach((n) => listEl.appendChild(createNoteItem(n)));
}

// ---------- Reusable request function ----------

// Calls fetch, throws on network errors AND on non-2xx responses.
// Returns { data, status } so callers can show the status code.
async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  const data = await response.json(); // DELETE returns {} on JSONPlaceholder
  return { data, status: response.status };
}

// ---------- GET ----------

async function loadNotes() {
  setStatus("Loading notes...", "loading");
  setBusy(true);
  try {
    const { data } = await request(`${API_URL}?_limit=10`);
    renderNotes(data);
    setStatus(
      data.length ? `Loaded ${data.length} notes from the server.` : "The server returned no notes.",
      "success"
    );
  } catch (err) {
    console.error(err);
    setStatus("Sorry, we could not load your notes. Please check your connection and try again.", "error");
  } finally {
    setBusy(false);
  }
}

// ---------- POST ----------

function validateTitle(title) {
  if (!title) return "Please enter a title.";
  if (title.length > MAX_TITLE_LENGTH) {
    return `Title must be ${MAX_TITLE_LENGTH} characters or fewer (currently ${title.length}).`;
  }
  return null;
}

async function createNote(event) {
  event.preventDefault();
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim(); // optional

  const problem = validateTitle(title);
  if (problem) {
    setStatus(problem, "error");
    titleInput.focus();
    return;
  }

  setStatus("Creating note...", "loading");
  setBusy(true);
  try {
    const { data, status } = await request(API_URL, {
      method: "POST",
      body: JSON.stringify({ title, body, userId: 1 }),
    });
    removeEmptyState();
    listEl.prepend(createNoteItem(data)); // newest note on top
    setStatus(`Note created (status ${status}, id ${data.id}).`, "success");
    form.reset();
  } catch (err) {
    console.error(err);
    setStatus("Sorry, the note could not be created. Please try again.", "error");
  } finally {
    setBusy(false);
  }
}

// ---------- DELETE ----------

// NOTE ON JSONPLACEHOLDER: it is a fake API. It accepts our POST and returns
// id 101, but never stores it, so DELETE /posts/101 would not delete anything
// real (and GET /posts/101 would 404). My approach: treat any 2xx answer to
// DELETE as success and remove the note from the page (the UI state is the
// source of truth in this demo). A later "Load notes" re-fetches the original
// 10 posts, because the server's data never changed. A real backend would
// persist changes, and the UI code would stay exactly the same.
async function deleteNote(id, li) {
  setStatus(`Deleting note ${id}...`, "loading");
  setBusy(true);
  try {
    const { status } = await request(`${API_URL}/${id}`, { method: "DELETE" });
    li.remove();
    if (listEl.children.length === 0) showEmptyState();
    setStatus(`Note ${id} deleted (status ${status}).`, "success");
  } catch (err) {
    console.error(err);
    setStatus(`Sorry, note ${id} could not be deleted. Please try again.`, "error");
  } finally {
    setBusy(false);
  }
}

// ---------- Wire up ----------
loadBtn.addEventListener("click", loadNotes);
form.addEventListener("submit", createNote);

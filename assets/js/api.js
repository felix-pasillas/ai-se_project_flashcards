const baseUrl = "https://se-flashcards-api.en.tripleten-services.com/v1";

function processResponse(res) {
  if (res.ok) {
    return res.json();
  }
  return Promise.reject(`Error: ${res.status}`);
}

function getDecks() {
  return fetch(`${baseUrl}/decks`).then(processResponse);
}

export { getDecks };

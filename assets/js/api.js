const baseUrl = "https://se-flashcards-api.en.tripleten-services.com/v1";

const headers = {
  "Content-Type": "application/json",
  Authorization: "019fb51d-58ce-7474-8f68-3f7b44bda743",
};

/**
 * Resolves successful HTTP responses to JSON and rejects unsuccessful ones.
 * This converts fetch responses into a rejected Promise with a status-based error message when the response is not ok.
 * @param {Response} res
 * @returns {Promise<unknown>}
 */
function processResponse(res) {
  if (res.ok) {
    return res.json();
  }
  return Promise.reject(`Error: ${res.status}`);
}

/**
 * Requests all decks from the remote API.
 * This performs an HTTP GET request and returns the parsed JSON payload from the server.
 * @returns {Promise<object[]>}
 */
function getDecks() {
  return fetch(`${baseUrl}/decks`, { headers }).then(processResponse);
}

/**
 * Deletes a deck by ID through the remote API.
 * This performs an HTTP DELETE request and returns the server response payload.
 * @param {string | number} id
 * @returns {Promise<unknown>}
 */
function deleteDeck(id) {
  return fetch(`${baseUrl}/decks/${id}`, {
    method: "DELETE",
    headers: headers,
  }).then(processResponse);
}

/**
 * Creates a new deck on the remote API with name, color, and cards.
 * This performs an HTTP POST request with a JSON body and returns the created deck payload.
 * @param {object} deck
 * @param {string} deck.name
 * @param {string} deck.color
 * @param {object[]} deck.cards
 * @returns {Promise<object>}
 */
function addDeck({ name, color, cards }) {
  return fetch(`${baseUrl}/decks`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name,
      color,
      cards,
    }),
  }).then(processResponse);
}

export { getDecks, deleteDeck, addDeck };

import { fetchedDecks } from "./cards.js";
import { addDeck } from "./api.js";

const HEX_DIGITS = /^[0-9a-fA-F]{6}$/;

/**
 * Converts a string to a URL-safe slug: lowercase with any run of
 * non-alphanumeric characters replaced by a single hyphen, and no leading or
 * trailing hyphens.
 *
 * @param {string} str
 * @returns {string}
 */
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Returns a consistent lowercase hex color string with a leading "#".
 * Accepts values with or without a leading "#". Returns "#64d583" as a
 * fallback if the value is missing or not a valid 6-digit hex.
 *
 * @param {string|undefined} color
 * @returns {string}
 */
function normalizeColor(color) {
  if (!color) return "#64d583";
  const hex = color.startsWith("#") ? color.slice(1) : color;
  if (!HEX_DIGITS.test(hex)) return "#64d583";
  return "#" + hex.toLowerCase();
}

const form = document.querySelector(".new-deck-view__form");
const textarea = document.querySelector(".new-deck-view__textarea");
const submitBtn = document.querySelector(".new-deck-view__submit");

const errorModal = document.querySelector("#error-modal");
const errorCloseBtn = document.querySelector(".modal__close");
const errorMessage = document.querySelector(".modal__error");

/**
 * Displays an error modal with the provided message.
 * This mutates modal DOM state by updating the error text and adding the visible class.
 * @param {string} message
 */
function showError(message) {
  errorMessage.textContent = message;
  errorModal.classList.add("modal_visible");
}
errorCloseBtn.addEventListener("click", () => {
  errorModal.classList.remove("modal_visible");
});

/**
 * Validates deck name input and only accepts strings between 2 and 80 characters.
 * Returns null when the input is missing, not a string, or outside the allowed length bounds.
 * @param {unknown} name
 * @returns {string | null}
 */
function validateName(name) {
  if (typeof name != "string" || name.length < 2 || name.length > 80) {
    return null;
  }
  return name;
}

/**
 * Attempts to parse a JSON payload and returns the parsed value.
 * If parsing fails, it returns null instead of throwing.
 * @param {string} jsonString
 * @returns {*| null}
 */
function parseJSON(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return null;
  }
}

/**
 * Handles new deck form submission by parsing JSON input, validating fields, and saving the deck.
 * This prevents default form submission, may call the addDeck API, updates in-memory deck data, mutates UI state, and navigates to the home route.
 * @param {SubmitEvent} event
 */
function handleSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const values = Object.fromEntries(formData);
  const deckJSON = values["deck-json"] || textarea.value;

  try {
    const deck = parseJSON(deckJSON);

    if (!deck) {
      showError("Invalid JSON.");
      return;
    }

    if (
      typeof deck.color == "string" &&
      deck.color.toLowerCase() !== values.color.toLowerCase()
    ) {
      showError("The JSON color does not match the selected color.");
      return;
    }

    const name = validateName(deck.name);

    if (!name) {
      showError("The deck name must be between 2 and 80 characters.");
      return;
    }

    if (!Array.isArray(deck.cards)) {
      showError("The deck must contain a cards array.");
      return;
    }

    values.name =
      typeof values.name === "string" && values.name.trim()
        ? values.name
        : typeof deck.name === "string" && deck.name.trim()
          ? deck.name
          : "Untitled Deck";
    const deckCards = Array.isArray(deck.cards)
      ? deck.cards
      : Array.isArray(deck)
        ? deck
        : [];
    const uniqueDeckId = `${slugify(values.name)}-${Date.now()}`;
    const color = normalizeColor(
      values.color || values["deck-color-picker"] || deck.color,
    );

    submitBtn.disabled = true;

    addDeck({ name: values.name, color, cards: deckCards })
      .then((savedDeck) => {
        const newDeck = {
          id: uniqueDeckId,
          ...savedDeck,
          color: savedDeck.color || color,
          name: savedDeck.name || values.name,
          cards: savedDeck.cards || deckCards,
        };

        fetchedDecks.push(newDeck);

        if (window.location.hash === "#home") {
          window.dispatchEvent(new HashChangeEvent("hashchange"));
        } else {
          window.location.hash = "#home";
        }
      })

      .catch((error) => {
        console.error(error);
        showError("Could not save the deck. Please try again.");
      })
      .finally(() => {
        submitBtn.disabled = false;
      });
  } catch (error) {
    console.error("Invalid JSON", error);
    showError("Something went wrong while creating the deck.");
  }
}

form.addEventListener("submit", handleSubmit);

/**
 * Re-enables the submit button for the new deck form.
 * This mutates button state in the DOM.
 */
function disableSubmitBtn() {
  submitBtn.disabled = false;
}

export { slugify, normalizeColor, disableSubmitBtn, showError };

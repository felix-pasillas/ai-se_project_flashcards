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

function handleSubmit(event) {
  event.preventDefault();

  const deckJSON = textarea.value;

  try {
    const deck = JSON.parse(deckJSON);
  } catch (error) {
    console.error("Invalid JSON", error);
  }
}

form.addEventListener("submit", handleSubmit);

function disableSubmitBtn() {
  submitBtn.disabled = false;
}

export { slugify, normalizeColor, disableSubmitBtn };

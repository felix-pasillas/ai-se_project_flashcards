import { removeColorClasses, hexToString } from "./colors.js";

const flashcardTemplate =
  document.getElementById("flashcard-template")?.content;
const deckViewList = document.querySelector("#deck-view .gallery__list");
const deckViewTitle = document.querySelector("#deck-view .gallery__title");
const practiceButton = document.querySelector(".gallery__practice-btn");

/**
 * Removes all currently rendered flashcard elements from the deck view list.
 * This mutates the DOM by deleting each element matching the .card selector inside the list.
 */
function clearDeckViewCards() {
  if (!deckViewList) {
    return;
  }

  deckViewList.querySelectorAll(".card").forEach((cardElement) => {
    cardElement.remove();
  });
}

/**
 * Creates a flashcard DOM element from the template and fills it with card data.
 * This mutates the cloned element by setting its title text and applying the deck color class.
 * @param {{ question: string }} card
 * @param {string} colorName
 * @returns {HTMLElement | null}
 */
function createFlashcardElement(card, colorName) {
  if (!flashcardTemplate) {
    return null;
  }

  const flashcardElement = flashcardTemplate
    .querySelector(".card")
    .cloneNode(true);

  flashcardElement.querySelector(".card__title").textContent = card.question;
  removeColorClasses(flashcardElement);
  flashcardElement.classList.add(`card_color_${colorName}`);

  return flashcardElement;
}

/**
 * Renders the selected deck in the deck-view section, including title, practice link, and all flashcards.
 * This mutates the DOM by updating text, changing the practice button target, clearing prior cards, and appending new card elements.
 * @param {{ name: string, color: string, cards: Array<{ question: string }>, id?: string | number, _id?: string }} deck
 */
function renderDeckView(deck) {
  if (!deckViewList || !deckViewTitle) {
    return;
  }

  deckViewTitle.textContent = deck.name;

  if (practiceButton) {
    practiceButton.href = `#carousel/${deck.id ?? deck._id}`;
  }

  clearDeckViewCards();

  const colorName = hexToString(deck.color) || "green";
  deck.cards.forEach((card) => {
    const flashcardElement = createFlashcardElement(card, colorName);

    if (flashcardElement) {
      deckViewList.appendChild(flashcardElement);
    }
  });
}

export { renderDeckView };

import { removeColorClasses, hexToString } from "./colors.js";

const flashcardTemplate =
  document.getElementById("flashcard-template")?.content;
const deckViewList = document.querySelector("#deck-view .gallery__list");
const deckViewTitle = document.querySelector("#deck-view .gallery__title");
const practiceButton = document.querySelector(".gallery__practice-btn");

function clearDeckViewCards() {
  if (!deckViewList) {
    return;
  }

  deckViewList.querySelectorAll(".card").forEach((cardElement) => {
    cardElement.remove();
  });
}

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

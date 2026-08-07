import { getDecks, deleteDeck } from "./api.js";
import { fetchedDecks, getDeckByID } from "./cards.js";
import { removeColorClasses, hexToString } from "./colors.js";
import { renderCarouselView } from "./carousel.js";
import { renderDeckView } from "./deck-view.js";
import {
  slugify,
  normalizeColor,
  disableSubmitBtn,
  showError,
} from "./new-deck-view.js";

let currentDeck = null;

const deckTemplate = document.getElementById("deck-template")?.content;
const homeDeckList = document.querySelector("#home .gallery__list");
const deckViewList = document.querySelector("#deck-view .gallery__list");
const homeSection = document.getElementById("home");
const deckViewSection = document.getElementById("deck-view");
const notFoundSection = document.getElementById("not-found");
const carouselView = document.querySelector(".page__main-content > .carousel");
const pageElement = document.querySelector(".page");
const newDeckSection = document.querySelector("#new-deck-view");
const aboutSection = document.querySelector("#about");

/**
 * Removes all rendered deck card elements from the provided list container.
 * This mutates the DOM by deleting every descendant matching the .card selector.
 * @param {Element | null} listElement
 */
function clearRenderedCards(listElement) {
  if (!listElement) {
    return;
  }

  listElement.querySelectorAll(".card").forEach((cardElement) => {
    cardElement.remove();
  });
}

/**
 * Builds a deck card element from template data and wires up delete behavior.
 * The function mutates the cloned DOM node, attaches a click handler, and may trigger an API delete when the delete button is used.
 * @param {{ name: string, cards: object[], color: string, id?: string | number, _id?: string }} item
 * @returns {HTMLElement | null}
 */
function createDeckElement(item) {
  if (!deckTemplate) {
    return null;
  }

  const deckElement = deckTemplate.querySelector(".card").cloneNode(true);

  deckElement.querySelector(".card__title").textContent = item.name;
  deckElement.querySelector(".card__count").textContent =
    `${item.cards.length} cards`;

  const colorName = hexToString(item.color);
  removeColorClasses(deckElement);
  deckElement.classList.add(`card_color_${colorName}`);

  deckElement.querySelector(".card__link").href =
    `#deck/${item.id ?? item._id}`;

  const deleteButton = deckElement.querySelector(".gallery__delete-btn");
  deleteButton?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const deckId = item._id ?? item.id;

    if (item._id) {
      deleteDeck(item._id)
        .then(() => {
          deckElement.remove();
          removeDeckFromState(deckId);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      deckElement.remove();
      removeDeckFromState(deckId);
    }
  });

  return deckElement;
}

/**
 * Removes a deck entry from the fetched decks collection by its id or _id.
 * This mutates fetchedDecks in place.
 * @param {string | number} deckId
 */
function removeDeckFromState(deckId) {
  const index = fetchedDecks.findIndex(
    (deck) => `${deck._id ?? deck.id}` === `${deckId}`,
  );
  if (index !== -1) {
    fetchedDecks.splice(index, 1);
  }
}

/**
 * Creates and appends a single deck card to the home gallery list.
 * This mutates the DOM by adding a rendered deck element when a valid template clone is available.
 * @param {{ name: string, cards: object[], color: string, id?: string | number, _id?: string }} item
 */
function renderDecks(item) {
  if (!homeDeckList) {
    return;
  }

  const deckElement = createDeckElement(item);
  if (!deckElement) {
    return;
  }

  homeDeckList.appendChild(deckElement);
}

/**
 * Renders the special New Deck card in the home gallery.
 * This mutates the cloned template DOM by replacing text, removing controls, applying classes, and appending the card to the home list.
 */
function renderNewDeckCard() {
  if (!homeDeckList || !deckTemplate) {
    return;
  }

  const newDeckCardElement = deckTemplate
    .querySelector(".card")
    .cloneNode(true);
  const cardTitleElement = newDeckCardElement.querySelector(".card__title");
  const cardCountElement = newDeckCardElement.querySelector(".card__count");

  if (cardTitleElement) {
    cardTitleElement.textContent = "+ New Deck";
  }

  if (cardCountElement) {
    cardCountElement.textContent = "";
  }

  removeColorClasses(newDeckCardElement);
  newDeckCardElement.classList.add("card_color_grey", "gallery__new-deck-card");

  newDeckCardElement.querySelector(".card__link")?.remove();
  newDeckCardElement.querySelector(".gallery__delete-btn")?.remove();

  homeDeckList.appendChild(newDeckCardElement);
}

/**
 * Prepares the new-deck screen state when that route is shown.
 * This triggers submit-button state updates for the new deck form.
 */
function renderNewDeckView() {
  if (!newDeckSection) {
    return;
  }

  disableSubmitBtn();
}

/**
 * Toggles top-level sections so only the requested view is visible.
 * This mutates DOM display styles and page classes to control layout and mobile-bar behavior.
 * @param {object} options
 * @param {boolean} options.showHome
 * @param {boolean} options.showDeckView
 * @param {boolean} options.showCarousel
 * @param {boolean} options.showNotFound
 * @param {boolean} [options.showNewDeckView]
 * @param {boolean} options.showAbout
 */
function showView({
  showHome,
  showDeckView,
  showCarousel,
  showNotFound,
  showNewDeckView,
  showAbout,
}) {
  if (showCarousel || showNotFound) {
    pageElement?.classList.add("page_no-mobile-bar");
  } else {
    pageElement?.classList.remove("page_no-mobile-bar");
  }

  if (homeSection) {
    homeSection.style.display = showHome ? "block" : "none";
  }

  if (deckViewSection) {
    deckViewSection.style.display = showDeckView ? "block" : "none";
  }

  if (carouselView) {
    carouselView.style.display = showCarousel ? "flex" : "none";
  }

  if (notFoundSection) {
    notFoundSection.style.display = showNotFound ? "block" : "none";
  }

  if (newDeckSection) {
    newDeckSection.style.display = showNewDeckView ? "block" : "none";
  }
  if (aboutSection) {
    aboutSection.style.display = showAbout ? "block" : "none";
  }
}

/**
 * Switches to the home view and renders the provided deck collection.
 * This updates view visibility and mutates the home gallery DOM by clearing existing cards and appending deck cards plus the New Deck card.
 * @param {Array<{ name: string, cards: object[], color: string, id?: string | number, _id?: string }>} deckList
 */
function renderHomeView(deckList) {
  if (!homeDeckList) {
    return;
  }

  showView({
    showHome: true,
    showDeckView: false,
    showCarousel: false,
    showNotFound: false,
    showAbout: false,
  });

  clearRenderedCards(homeDeckList);
  deckList.forEach(renderDecks);
  renderNewDeckCard();
}

/**
 * Displays the not-found route state and clears previously rendered cards.
 * This mutates section visibility and removes card nodes from both home and deck-view lists.
 */
function renderNotFoundView() {
  showView({
    showHome: false,
    showDeckView: false,
    showCarousel: false,
    showNotFound: true,
    showAbout: false,
  });

  clearRenderedCards(homeDeckList);
  clearRenderedCards(deckViewList);
}

/**
 * Resolves the current hash route and renders the corresponding page view.
 * Depending on route state, this updates currentDeck, toggles visible sections, and may trigger deck/carousel rendering or a not-found view.
 */
function handleRoute() {
  console.log("handleRoute", window.location.hash);
  const hash = window.location.hash || "#home";
  const isHomeView = hash === "#home";
  const isDeckView = hash.startsWith("#deck/");
  const isCarouselView = hash.startsWith("#carousel/");
  const isNewDeckView = hash === "#new-deck-view";
  const isAboutView = hash === "#about";

  if (isHomeView) {
    renderHomeView(fetchedDecks);
  } else if (isDeckView) {
    const deckId = hash.split("/")[1];
    const deck = getDeckByID(deckId);

    if (!deck) {
      console.log("Rendering 404. hash =", hash);
      renderNotFoundView();
      return;
    }

    currentDeck = deck;

    showView({
      showHome: false,
      showDeckView: true,
      showCarousel: false,
      showNotFound: false,
      showAbout: false,
    });

    renderDeckView(deck);
  } else if (isCarouselView) {
    const deckId = hash.split("/")[1];
    const deck = getDeckByID(deckId);

    if (deck) {
      showView({
        showHome: false,
        showDeckView: false,
        showCarousel: true,
        showNotFound: false,
        showAbout: false,
      });

      renderCarouselView(deck);
    } else {
      renderNotFoundView();
    }
  } else if (isNewDeckView) {
    showView({
      showHome: false,
      showDeckView: false,
      showCarousel: false,
      showNotFound: false,
      showNewDeckView: true,
      showAbout: false,
    });

    renderNewDeckView();
  } else if (isAboutView) {
    showView({
      showHome: false,
      showDeckView: false,
      showCarousel: false,
      showNotFound: false,
      showAbout: true,
    });
  } else {
    renderNotFoundView();
  }
}

window.addEventListener("hashchange", handleRoute);

homeSection?.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  const newCardButton = target.closest(
    ".gallery__new-card-btn, .gallery__new-deck-card",
  );

  if (!newCardButton || !homeSection.contains(newCardButton)) {
    return;
  }

  window.location.hash = "#new-deck-view";
});

document.addEventListener("DOMContentLoaded", () => {
  getDecks()
    .then((apiDecks) => {
      fetchedDecks.push(...apiDecks);
    })
    .catch((error) => {
      showError(error);
    })
    .finally(() => {
      handleRoute();
    });
});

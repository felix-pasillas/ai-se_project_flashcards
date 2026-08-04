import { getDecks, deleteDeck } from "./api.js";
import { decks, fetchedDecks, getDeckByID } from "./cards.js";
import { removeColorClasses, hexToString } from "./colors.js";
import { renderCarouselView } from "./carousel.js";
import { renderDeckView } from "./deck-view.js";
import { slugify, normalizeColor, disableSubmitBtn } from "./new-deck-view.js";

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

function clearRenderedCards(listElement) {
  if (!listElement) {
    return;
  }

  listElement.querySelectorAll(".card").forEach((cardElement) => {
    cardElement.remove();
  });
}

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

function removeDeckFromState(deckId) {
  const fetchedIndex = fetchedDecks.findIndex(
    (deck) => `${deck._id ?? deck.id}` === `${deckId}`,
  );
  if (fetchedIndex !== -1) {
    fetchedDecks.splice(fetchedIndex, 1);
  }

  const localIndex = decks.findIndex(
    (deck) => `${deck._id ?? deck.id}` === `${deckId}`,
  );
  if (localIndex !== -1) {
    decks.splice(localIndex, 1);
    localStorage.setItem("decks", JSON.stringify(decks));
  }
}

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

function renderNewDeckView() {
  if (!newDeckSection) {
    return;
  }

  disableSubmitBtn();
}

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

function renderHomeView(decks) {
  if (!homeDeckList) {
    return;
  }

  showView({
    showHome: true,
    showDeckView: false,
    showCarousel: false,
    showNotFound: false,
  });

  clearRenderedCards(homeDeckList);
  decks.forEach(renderDecks);
  renderNewDeckCard();
}

function renderNotFoundView() {
  showView({
    showHome: false,
    showDeckView: false,
    showCarousel: false,
    showNotFound: true,
  });

  clearRenderedCards(homeDeckList);
  clearRenderedCards(deckViewList);
}

function handleRoute() {
  console.log("handleRoute", window.location.hash);
  const hash = window.location.hash || "#home";
  const isHomeView = hash === "#home";
  const isDeckView = hash.startsWith("#deck/");
  const isCarouselView = hash.startsWith("#carousel/");
  const isNewDeckView = hash === "#new-deck-view";
  const isAboutView = hash === "#about";

  if (isHomeView) {
    renderHomeView(decks);
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
    });

    renderNewDeckView();
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
    .then((decks) => {
      fetchedDecks.push(...decks);
      decks.forEach(renderDecks);
    })
    .catch((error) => {
      showError(error);
    })
    .finally(() => {
      handleRoute();
    });
});

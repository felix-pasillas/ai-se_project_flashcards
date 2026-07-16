import { decks, getDeckByID } from "./cards.js";
import { removeColorClasses, hexToString } from "./colors.js";
import { renderCarouselView } from "./carousel.js";
import { renderDeckView } from "./deck-view.js";

let currentDeck = null;

const deckTemplate = document.getElementById("deck-template")?.content;
const homeDeckList = document.querySelector("#home .gallery__list");
const deckViewList = document.querySelector("#deck-view .gallery__list");
const homeSection = document.getElementById("home");
const deckViewSection = document.getElementById("deck-view");
const notFoundSection = document.getElementById("not-found");
const carouselView = document.querySelector(".page__main-content > .carousel");
const pageElement = document.querySelector(".page");

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

  deckElement.querySelector(".card__link").href = `#deck/${item.id}`;

  const deleteButton = deckElement.querySelector(".gallery__delete-btn");
  deleteButton?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    deckElement.remove();
  });

  return deckElement;
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

function showView({ showHome, showDeckView, showCarousel, showNotFound }) {
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
}

function renderHomeView() {
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
  const hash = window.location.hash || "#home";
  const isHomeView = hash === "#home";
  const isDeckView = hash.startsWith("#deck/");
  const isCarouselView = hash.startsWith("#carousel/");

  if (isHomeView) {
    renderHomeView();
  } else if (isDeckView) {
    const deckId = hash.split("/")[1];
    const deck = getDeckByID(deckId);

    if (!deck) {
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
  } else {
    renderNotFoundView();
  }
}

window.addEventListener("hashchange", handleRoute);
handleRoute();

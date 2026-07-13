import { decks, getDeckByID } from "./decks.js";
import { removeColorClasses, hexToString } from "./colors.js";
import { renderCarouselView } from "./carousel.js";

const deckTemplate = document.getElementById("deck-template").content;
const deckList = document.querySelector(".decks__list");
const homeSection = document.getElementById("home");
const notFoundSection = document.getElementById("not-found");

function createDeckElement(item) {
  const deckElement = deckTemplate.querySelector(".deck").cloneNode(true);

  deckElement.querySelector(".deck__title").textContent = item.name;
  deckElement.querySelector(".deck__count").textContent =
    `${item.cards.length} cards`;

  const colorName = hexToString(item.color);
  removeColorClasses(deckElement);
  deckElement.classList.add(`deck_color_${colorName}`);

  const currentDeckID = item.id;
  deckElement.querySelector(".deck__link").href = `#carousel/${currentDeckID}`;

  const deleteButton = deckElement.querySelector(".decks__delete-btn");
  deleteButton.addEventListener("click", (event) => {
    deckElement.remove();
  });

  return deckElement;
}

function renderDecks(item) {
  if (!deckList) {
    return;
  }

  const deckElement = createDeckElement(item);
  deckList.appendChild(deckElement);
}

function renderHomeView() {
  if (!deckList) {
    return;
  }

  const carouselView = document.querySelector(
    ".page__main-content > .carousel",
  );

  if (carouselView) {
    carouselView.style.display = "none";
  }

  if (homeSection) {
    homeSection.hidden = false;
  }

  if (notFoundSection) {
    notFoundSection.hidden = true;
  }

  deckList.innerHTML = "";
  decks.forEach(renderDecks);
}

function handleRoute() {
  const hash = window.location.hash || "#home";
  const isHomeView = hash === "#home";
  const isCarouselView = hash.startsWith("#carousel/");
  const isKnownRoute = isHomeView || isCarouselView;

  if (homeSection) {
    homeSection.style.display = isHomeView ? "block" : "none";
  }

  if (notFoundSection) {
    notFoundSection.style.display = isKnownRoute ? "none" : "block";
  }

  if (isHomeView) {
    renderHomeView();
  } else if (isCarouselView) {
    const deckId = hash.split("/")[1];
    const deck = getDeckByID(deckId);

    if (deck) {
      renderCarouselView(deck);
    } else {
      if (deckList) {
        deckList.innerHTML = "";
      }

      if (notFoundSection) {
        notFoundSection.style.display = "block";
      }
    }
  } else {
    const carouselView = document.querySelector(
      ".page__main-content > .carousel",
    );

    if (carouselView) {
      carouselView.style.display = "none";
    }

    if (deckList) {
      deckList.innerHTML = "";
    }
  }
}

window.addEventListener("hashchange", handleRoute);
handleRoute();

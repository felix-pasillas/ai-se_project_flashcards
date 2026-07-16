import { hexToString } from "./colors.js";

export function renderCarouselView(deck) {
  const mainContent = document.querySelector(".page__main-content");

  if (!mainContent || !deck) {
    return;
  }

  const carouselView = document.querySelector(
    ".page__main-content > .carousel",
  );

  if (!carouselView) {
    return;
  }

  carouselView.style.display = "flex";

  const colorName = hexToString(deck.color) || "green";
  const colorClass = `card__carousel_color_${colorName}`;

  let currentCardIndex = 0;
  let showingQuestion = true;

  const updateDisplay = () => {
    const currentCard = deck.cards[currentCardIndex];

    if (!currentCard) {
      return;
    }

    const isFirstCard = currentCardIndex === 0;
    const isLastCard = currentCardIndex === deck.cards.length - 1;

    const cardClasses = showingQuestion
      ? `carousel__card ${colorClass}`
      : `carousel__card ${colorClass} carousel__card_color_white`;

    carouselView.innerHTML = `
      <section class="carousel">
        <h2 class="carousel__title">${deck.name} · ${currentCardIndex + 1}/${deck.cards.length}</h2>

        <div class="carousel__grid">
          <button
            class="carousel__btn carousel__btn_type_left"
            type="button"
            aria-label="Previous card"
            ${isFirstCard ? "disabled" : ""}
          ></button>

          <div class="carousel__card-wrapper">
            <div class="${cardClasses}">
              <p class="carousel__card-text"></p>
            </div>
          </div>

          <button
            class="carousel__btn carousel__btn_type_right"
            type="button"
            aria-label="Next card"
            ${isLastCard ? "disabled" : ""}
          ></button>

          <button
            class="carousel__btn carousel__btn_type_flip"
            type="button"
            aria-label="Flip card"
          ></button>
        </div>
      </section>
    `;

    const carouselCardText = carouselView.querySelector(".carousel__card-text");
    if (carouselCardText) {
      carouselCardText.textContent = showingQuestion
        ? currentCard.question
        : currentCard.answer;
    }

    const leftButton = carouselView.querySelector(".carousel__btn_type_left");
    const rightButton = carouselView.querySelector(".carousel__btn_type_right");
    const flipButton = carouselView.querySelector(".carousel__btn_type_flip");

    leftButton?.addEventListener("click", () => {
      currentCardIndex = Math.max(0, currentCardIndex - 1);
      showingQuestion = true;
      updateDisplay();
    });

    rightButton?.addEventListener("click", () => {
      currentCardIndex = Math.min(deck.cards.length - 1, currentCardIndex + 1);
      showingQuestion = true;
      updateDisplay();
    });

    flipButton?.addEventListener("click", () => {
      showingQuestion = !showingQuestion;
      updateDisplay();
    });
  };

  updateDisplay();
}

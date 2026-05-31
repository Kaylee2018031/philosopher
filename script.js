const starterQuotes = [
  {
    quote: "There is nothing outside of the text.",
    author: "Jacques Derrida",
    theme: "Interpretation",
  },
  {
    quote: "He who has a why to live can bear almost any how.",
    author: "Friedrich Nietzsche",
    theme: "Meaning",
  },
  {
    quote: "The only thing I know is that I know nothing.",
    author: "Socrates",
    theme: "Humility",
  },
  {
    quote: "Man is condemned to be free.",
    author: "Jean-Paul Sartre",
    theme: "Freedom",
  },
  {
    quote: "No man's knowledge here can go beyond his experience.",
    author: "John Locke",
    theme: "Experience",
  },
  {
    quote: "Happiness is not an ideal of reason, but of imagination.",
    author: "Immanuel Kant",
    theme: "Happiness",
  },
];

const quoteGrid = document.querySelector("#quote-grid");
const quoteForm = document.querySelector("#quote-form");
const quoteTemplate = document.querySelector("#quote-card-template");
const formHint = document.querySelector("#form-hint");

const normalizeEntry = (formData) => ({
  quote: formData.get("quote").trim(),
  author: formData.get("author").trim(),
  theme: formData.get("theme").trim(),
});

const createQuoteCard = ({ quote, author, theme }) => {
  const card = quoteTemplate.content.firstElementChild.cloneNode(true);

  card.querySelector(".quote-card__theme").textContent = theme;
  card.querySelector("blockquote").textContent = quote;
  card.querySelector(".quote-card__author").textContent = author;
  card.querySelector(".quote-card__remove").addEventListener("click", () => {
    card.remove();
    formHint.textContent = `Removed ${author}'s quote from the collection.`;
  });

  return card;
};

const renderQuote = (quote, position = "append") => {
  const card = createQuoteCard(quote);

  if (position === "prepend") {
    quoteGrid.prepend(card);
    return;
  }

  quoteGrid.append(card);
};

starterQuotes.forEach((quote) => renderQuote(quote));

quoteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const entry = normalizeEntry(new FormData(quoteForm));

  if (!entry.quote || !entry.author || !entry.theme) {
    formHint.textContent = "Please complete every field before creating a card.";
    return;
  }

  renderQuote(entry, "prepend");
  quoteForm.reset();
  formHint.textContent = `Added a new quote by ${entry.author}.`;
});

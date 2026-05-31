const STORAGE_KEY = "philosopher-user-quotes";
const LEGACY_STORAGE_KEY = "philosopher-quotes";

const sampleQuotes = [
  {
    id: "sample-derrida",
    source: "sample",
    philosopher: "Jacques Derrida",
    book: "Of Grammatology",
    original: "There is nothing outside of the text.",
    translation: "텍스트 바깥에는 아무것도 없다.",
    explanation:
      "의미는 순수한 바깥에서 직접 주어지지 않고, 기호와 맥락, 해석의 관계망 안에서 형성된다는 문제의식을 보여준다.",
    citation: "프랑스어 원문: 『De la grammatologie』(1967). 영어 번역: Gayatri Chakravorty Spivak, 1976.",
  },
  {
    id: "sample-foucault",
    source: "sample",
    philosopher: "Michel Foucault",
    book: "The History of Sexuality, Volume 1",
    original: "Where there is power, there is resistance.",
    translation: "권력이 있는 곳에는 저항이 있다.",
    explanation:
      "권력은 일방적으로 소유되는 물건이 아니라 사회적 관계 속에서 작동하며, 그 작동 지점마다 저항의 가능성도 함께 생긴다는 뜻이다.",
    citation: "프랑스어 초판 1976년. 영어 번역: Robert Hurley, 1978.",
  },
  {
    id: "sample-arendt",
    source: "sample",
    philosopher: "Hannah Arendt",
    book: "The Human Condition",
    original: "Men, not Man, live on the earth and inhabit the world.",
    translation: "인간 일반이 아니라 복수의 사람들이 지상에 살며 세계에 거주한다.",
    explanation:
      "아렌트 정치철학의 핵심인 복수성을 압축하는 문장으로, 정치적 삶은 서로 다른 사람들이 함께 나타나는 공간에서 시작된다.",
    citation: "초판 1958년, University of Chicago Press.",
  },
  {
    id: "sample-weil",
    source: "sample",
    philosopher: "Simone Weil",
    book: "Waiting for God",
    original: "Attention is the rarest and purest form of generosity.",
    translation: "주의 깊은 관심은 가장 드물고 가장 순수한 관대함의 형식이다.",
    explanation:
      "타인을 진정으로 바라보고 듣는 일이 단순한 친절을 넘어 윤리적 헌신의 방식이 될 수 있음을 말한다.",
    citation: "사후 출간 1950년. 영어 번역: Emma Craufurd, 1951.",
  },
];

const quoteForm = document.querySelector("#quote-form");
const quoteList = document.querySelector("#quote-list");
const quoteTemplate = document.querySelector("#quote-card-template");
const searchInput = document.querySelector("#search");
const quoteCount = document.querySelector("#quote-count");
const emptyState = document.querySelector("#empty-state");
const formFeedback = document.querySelector("#form-feedback");
const filterTabs = document.querySelectorAll(".filter-tab");

let userQuotes = loadUserQuotes();
let activeFilter = "all";

quoteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(quoteForm);
  const quote = {
    id: createQuoteId(),
    source: "user",
    philosopher: formData.get("philosopher").trim(),
    book: formData.get("book").trim(),
    original: formData.get("original").trim(),
    translation: formData.get("translation").trim(),
    explanation: formData.get("explanation").trim(),
    citation: formData.get("citation").trim(),
  };

  userQuotes = [quote, ...userQuotes];
  saveUserQuotes(userQuotes);
  quoteForm.reset();
  searchInput.value = "";
  setActiveFilter("all");
  formFeedback.textContent = `“${quote.philosopher}” 카드가 추가되었습니다. 계속 입력해 여러 카드를 만들 수 있습니다.`;
  renderQuotes();
});

searchInput.addEventListener("input", renderQuotes);

filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setActiveFilter(tab.dataset.filter);
    renderQuotes();
  });
});

setActiveFilter(activeFilter);
renderQuotes();

function loadUserQuotes() {
  const storedQuotes = localStorage.getItem(STORAGE_KEY);
  const legacyQuotes = localStorage.getItem(LEGACY_STORAGE_KEY);
  const rawQuotes = storedQuotes || legacyQuotes;

  if (!rawQuotes) {
    return [];
  }

  try {
    const parsedQuotes = JSON.parse(rawQuotes);
    const normalizedQuotes = Array.isArray(parsedQuotes) ? parsedQuotes.filter(isUserQuote).map(normalizeUserQuote) : [];

    if (!storedQuotes && normalizedQuotes.length > 0) {
      saveUserQuotes(normalizedQuotes);
    }

    return normalizedQuotes;
  } catch {
    return [];
  }
}

function isUserQuote(quote) {
  const matchesSample = sampleQuotes.some(
    (sampleQuote) =>
      sampleQuote.philosopher === quote.philosopher &&
      sampleQuote.book === quote.book &&
      sampleQuote.original === quote.original,
  );

  return quote.source !== "sample" && !String(quote.id || "").startsWith("sample-") && !matchesSample;
}

function normalizeUserQuote(quote) {
  return {
    id: quote.id || createQuoteId(),
    source: "user",
    philosopher: quote.philosopher || "",
    book: quote.book || "",
    original: quote.original || "",
    translation: quote.translation || "",
    explanation: quote.explanation || "",
    citation: quote.citation || "",
  };
}

function saveUserQuotes(nextQuotes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextQuotes));
}

function createQuoteId() {
  if (crypto.randomUUID) {
    return `user-${crypto.randomUUID()}`;
  }

  return `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function setActiveFilter(nextFilter) {
  activeFilter = nextFilter;

  filterTabs.forEach((tab) => {
    const isActive = tab.dataset.filter === activeFilter;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });
}

function getAllQuotes() {
  return [...userQuotes, ...sampleQuotes];
}

function renderQuotes() {
  const keyword = searchInput.value.trim().toLowerCase();
  const allQuotes = getAllQuotes();
  const filteredQuotes = allQuotes.filter((quote) => {
    const matchesFilter = activeFilter === "all" || quote.source === activeFilter;
    const matchesKeyword = Object.values(quote).some((value) => String(value).toLowerCase().includes(keyword));

    return matchesFilter && matchesKeyword;
  });

  quoteList.replaceChildren();

  filteredQuotes.forEach((quote) => {
    const card = quoteTemplate.content.firstElementChild.cloneNode(true);

    card.dataset.source = quote.source;
    card.querySelector("h3").textContent = quote.philosopher;
    card.querySelector(".quote-card__book").textContent = quote.book;
    card.querySelector(".quote-card__source").textContent = quote.source === "user" ? "내 카드" : "샘플";
    card.querySelector(".quote-card__original").textContent = `“${quote.original}”`;
    card.querySelector(".quote-card__translation").textContent = quote.translation;
    card.querySelector(".quote-card__explanation").textContent = quote.explanation;
    card.querySelector(".quote-card__citation").textContent = quote.citation;

    quoteList.append(card);
  });

  const filterLabel = activeFilter === "sample" ? "샘플" : activeFilter === "user" ? "내가 추가한" : "전체";
  quoteCount.textContent = `${filterLabel} 인용 카드 ${filteredQuotes.length}개가 표시됩니다. 저장된 내 카드: ${userQuotes.length}개.`;
  emptyState.hidden = filteredQuotes.length > 0;
}

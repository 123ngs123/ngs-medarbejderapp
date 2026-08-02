(() => {
  const julieEmail = "julieandersen0605@gmail.com";

  function currentLanguage() {
    return document.documentElement.lang === "pl" ? "pl" : "da";
  }

  function translateSupportFields() {
    const language = currentLanguage();
    const message = document.getElementById("issueMessage");
    const sender = document.getElementById("issueSender");

    if (message) {
      message.placeholder = language === "da"
        ? "Skriv her, hvad der ikke virker, eller hvad der mangler..."
        : "Napisz tutaj, co nie działa lub czego brakuje...";
    }

    if (sender) {
      sender.placeholder = language === "da"
        ? "Dit navn"
        : "Twoje imię";
    }
  }

  const newsText = document.querySelector(".news-copy p");
  if (newsText) {
    newsText.dataset.da = "Appen er opdateret. Du kan nu åbne en vejledning og skrive fejl eller mangler direkte til Julie.";
    newsText.dataset.pl = "Aplikacja została zaktualizowana. Możesz teraz otworzyć instrukcję i napisać bezpośrednio do Julie o błędach lub brakach.";
    newsText.textContent = newsText.dataset[currentLanguage()];
  }

  const supportCard = document.querySelector(".support-card");
  if (!supportCard) return;

  supportCard.innerHTML = `
    <h2 data-da="Fejl eller mangler i appen?" data-pl="Błąd lub brak w aplikacji?">Fejl eller mangler i appen?</h2>
    <p data-da="Skriv beskeden her i appen. Når du trykker på knappen, åbnes en e-mail til Julie med beskeden klar."
       data-pl="Napisz wiadomość tutaj w aplikacji. Po naciśnięciu przycisku otworzy się e-mail do Julie z gotową wiadomością.">
      Skriv beskeden her i appen. Når du trykker på knappen, åbnes en e-mail til Julie med beskeden klar.
    </p>
    <form class="issue-form" id="issueForm">
      <label for="issueSender" data-da="Navn" data-pl="Imię">Navn</label>
      <input id="issueSender" name="sender" type="text" autocomplete="name" required>

      <label for="issueMessage" data-da="Besked til Julie" data-pl="Wiadomość do Julie">Besked til Julie</label>
      <textarea id="issueMessage" name="message" rows="5" required></textarea>

      <button class="email-button" type="submit">
        <span aria-hidden="true">✉️</span>
        <span data-da="Send til Julie" data-pl="Wyślij do Julie">Send til Julie</span>
      </button>
      <p class="email-note" data-da="Beskeden sendes som e-mail – ikke som SMS."
         data-pl="Wiadomość zostanie wysłana e-mailem, a nie SMS-em.">
        Beskeden sendes som e-mail – ikke som SMS.
      </p>
    </form>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .issue-form { display: grid; gap: 8px; }
    .issue-form label { margin-top: 3px; color: #fff; font-size: .72rem; font-weight: 800; }
    .issue-form input,
    .issue-form textarea {
      width: 100%;
      border: 1px solid #5a5a54;
      border-radius: 10px;
      padding: 12px;
      color: #171713;
      background: #fff;
      font: inherit;
      font-size: .82rem;
      line-height: 1.4;
    }
    .issue-form textarea { min-height: 118px; resize: vertical; }
    .issue-form input:focus,
    .issue-form textarea:focus { outline: 3px solid rgba(255,196,0,.32); border-color: #ffc400; }
    .email-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      min-height: 50px;
      margin-top: 5px;
      border: 1px solid #e3aa00;
      border-radius: 10px;
      color: #171713;
      background: #ffc400;
      font-size: .84rem;
      font-weight: 900;
      cursor: pointer;
    }
    .email-button:active { background: #e6ad00; }
    .support-card .email-note { margin: 2px 0 0; color: #bdbcb4; font-size: .66rem; text-align: center; }
  `;
  document.head.appendChild(style);

  translateSupportFields();

  const languageButton = document.getElementById("languageButton");
  if (languageButton) {
    languageButton.addEventListener("click", () => {
      window.setTimeout(translateSupportFields, 0);
    });
  }

  document.getElementById("issueForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const language = currentLanguage();
    const sender = document.getElementById("issueSender").value.trim();
    const message = document.getElementById("issueMessage").value.trim();
    const selectedEmployee = localStorage.getItem("ngs-employee") || "Ikke valgt";

    if (!sender || !message) return;

    const subject = language === "da"
      ? "Fejl eller mangel i NGS-medarbejderappen"
      : "Błąd lub brak w aplikacji pracowniczej NGS";

    const body = language === "da"
      ? `Hej Julie,\n\n${message}\n\nAfsender: ${sender}\nValgt medarbejder i appen: ${selectedEmployee}`
      : `Cześć Julie,\n\n${message}\n\nNadawca: ${sender}\nPracownik wybrany w aplikacji: ${selectedEmployee}`;

    window.location.href = `mailto:${julieEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();

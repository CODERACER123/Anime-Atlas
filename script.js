const facts = [
  "Studio Ghibli famously hand-paints every frame detail for a warm, tactile look.",
  "Spirited Away was the first anime film to win the Oscar for Best Animated Feature.",
  "Akira used over 160,000 cels to achieve its cinematic animation quality.",
  "One Piece has remained a top-selling manga for over two decades.",
  "Attack on Titan reimagined political fantasy within a survival story.",
  "Your Name became a global hit thanks to its emotional time-twist narrative.",
];

const factText = document.getElementById("fact-text");
const button = document.getElementById("random-fact");

const updateFact = () => {
  if (!factText) {
    return;
  }
  const next = facts[Math.floor(Math.random() * facts.length)];
  factText.textContent = next;
};

if (button) {
  button.addEventListener("click", updateFact);
}

const isValidEmail = (value) =>
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(
    value
  );

const createSignupDialog = () => {
  if (document.getElementById("signup-dialog")) {
    return;
  }

  const dialog = document.createElement("dialog");
  dialog.id = "signup-dialog";
  dialog.className = "signup-dialog";
  dialog.innerHTML = `
    <form class="signup-form" method="POST" action="https://formspree.io/f/mjgeawvy">
      <h3>Join the Anime Atlas Club</h3>
      <p>Get monthly recommendations and new story drops.</p>
      <label class="signup-field">
        Email address
        <input type="email" name="email" placeholder="you@example.com" required />
      </label>
      <label class="signup-check">
        <input type="checkbox" required />
        I agree to receive updates and can unsubscribe anytime.
      </label>
      <div class="signup-actions">
        <button type="button" class="ghost" data-close>Cancel</button>
        <button type="submit" class="primary">Join now</button>
      </div>
      <p class="signup-note">
        Replace the Formspree URL with your email provider for double opt-in.
      </p>
    </form>
  `;
  document.body.appendChild(dialog);

  dialog.querySelector("[data-close]")?.addEventListener("click", () => {
    dialog.close();
  });
};

const openSignupDialog = () => {
  createSignupDialog();
  const dialog = document.getElementById("signup-dialog");
  if (dialog?.showModal) {
    dialog.showModal();
    return;
  }
  const email = window.prompt("Join the club! Enter your email address:");
  if (!email) {
    return;
  }
  if (!isValidEmail(email.trim())) {
    window.alert("Please enter a valid email address.");
    return;
  }
  window.alert("Thanks for joining! Watchlist updates are on the way.");
};

document.querySelectorAll(".cta").forEach((ctaButton) => {
  ctaButton.addEventListener("click", openSignupDialog);
});

const scheduleData = [
  { title: "Naruto", query: "Naruto" },
  { title: "One Piece", query: "One Piece" },
  { title: "Attack on Titan", query: "Shingeki no Kyojin" },
  { title: "My Hero Academia", query: "Boku no Hero Academia" },
  { title: "Dragon Ball Z", query: "Dragon Ball Z" },
  { title: "Demon Slayer", query: "Kimetsu no Yaiba" },
  { title: "One Punch Man", query: "One Punch Man" },
  { title: "Spy x Family", query: "Spy x Family" },
  { title: "Chainsaw Man", query: "Chainsaw Man" },
  { title: "Jujutsu Kaisen", query: "Jujutsu Kaisen" },
];

const scheduleSelect = document.getElementById("anime-select");
const scheduleResult = document.getElementById("schedule-result");

const renderScheduleOptions = () => {
  if (!scheduleSelect) {
    return;
  }
  scheduleData.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.title;
    option.textContent = item.title;
    scheduleSelect.appendChild(option);
  });
};

const renderScheduleMessage = (title, details) => {
  if (!scheduleResult) {
    return;
  }
  scheduleResult.innerHTML = `
    <h3>${title}</h3>
    ${details}
  `;
};

const updateSchedule = async (title) => {
  if (!title) {
    renderScheduleMessage(
      "Next episode",
      "<p>Select an anime to view the schedule.</p>"
    );
    return;
  }

  renderScheduleMessage(title, "<p>Loading latest schedule...</p>");

  const item = scheduleData.find((entry) => entry.title === title);
  if (!item) {
    renderScheduleMessage(title, "<p>Title not found in the schedule list.</p>");
    return;
  }

  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        title {
          romaji
          english
        }
        status
        episodes
        nextAiringEpisode {
          airingAt
          episode
        }
        siteUrl
      }
    }
  `;

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { search: item.query },
      }),
    });

    if (!response.ok) {
      throw new Error("AniList request failed");
    }

    const payload = await response.json();
    const media = payload?.data?.Media;

    if (!media) {
      renderScheduleMessage(title, "<p>No matching title found on AniList.</p>");
      return;
    }

    const displayTitle =
      media.title?.english || media.title?.romaji || item.title;
    const status = media.status ? media.status.replaceAll("_", " ") : "Unknown";
    const totalEpisodes = media.episodes ? `${media.episodes}` : "Unknown";

    let nextEpisodeLine = "Not currently scheduled";
    let nextAirDateLine = "";

    if (media.nextAiringEpisode) {
      const date = new Date(media.nextAiringEpisode.airingAt * 1000);
      nextEpisodeLine = `Episode ${media.nextAiringEpisode.episode}`;
      nextAirDateLine = `<p><strong>Airs on:</strong> ${date.toLocaleString()}</p>`;
    }

    const extraNote =
      item.title === "Jujutsu Kaisen"
        ? "<p><strong>Note:</strong> The story continues into the Culling Game arc.</p>"
        : "";

    renderScheduleMessage(
      displayTitle,
      `
        <p><strong>Status:</strong> ${status}</p>
        <p><strong>Next episode:</strong> ${nextEpisodeLine}</p>
        ${nextAirDateLine}
        <p><strong>Total episodes:</strong> ${totalEpisodes}</p>
        ${extraNote}
        <p><a href="${media.siteUrl}" target="_blank" rel="noreferrer">View on AniList</a></p>
      `
    );
  } catch (error) {
    renderScheduleMessage(
      title,
      "<p>Unable to load schedule right now. Please try again later.</p>"
    );
  }
};

if (scheduleSelect) {
  renderScheduleOptions();
  scheduleSelect.addEventListener("change", (event) => {
    updateSchedule(event.target.value);
  });
}

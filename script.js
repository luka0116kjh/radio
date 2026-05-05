const stations = [
  {
    freq: 88.7,
    title: "Rainy Window Piano",
    meta: "piano jazz 쨌 rainy cafe 쨌 soft static",
    art: "RW"
  },
  {
    freq: 94.3,
    title: "Neon City Pop Hour",
    meta: "80s city pop 쨌 night drive 쨌 clean radio mix",
    art: "NC"
  },
  {
    freq: 99.6,
    title: "Velvet Static Cafe",
    meta: "lofi jazz 쨌 warm radio mix 쨌 vinyl noise",
    art: "99.6"
  },
  {
    freq: 104.8,
    title: "Vintage Sax Broadcast",
    meta: "smoky saxophone 쨌 acoustic guitar 쨌 late night",
    art: "VS"
  }
];

const radio = document.getElementById("radio");
const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");
const favoriteBtn = document.getElementById("favoriteBtn");
const audioUpload = document.getElementById("audioUpload");
const mediaUrl = document.getElementById("mediaUrl");
const loadUrlBtn = document.getElementById("loadUrlBtn");
const youtubeHost = document.getElementById("youtubeHost");
const tuner = document.getElementById("tuner");
const trackTitle = document.getElementById("trackTitle");
const trackMeta = document.getElementById("trackMeta");
const albumArt = document.getElementById("albumArt");
const statusText = document.getElementById("statusText");
const visualizer = document.getElementById("visualizer");
const favoritesList = document.getElementById("favoritesList");
const bookmarkHint = document.getElementById("bookmarkHint");

let currentStation = stations[2];
let favorites = JSON.parse(localStorage.getItem("radioFavorites") || "[]");
let activeYouTubeUrl = "";

function makeBars() {
  for (let i = 0; i < 42; i += 1) {
    const bar = document.createElement("span");
    bar.className = "bar";
    bar.style.setProperty("--h", `${28 + Math.random() * 68}%`);
    bar.style.animationDelay = `${Math.random() * -1.2}s`;
    visualizer.appendChild(bar);
  }
}

function findStation(freq) {
  return stations.reduce((closest, station) => {
    return Math.abs(station.freq - freq) < Math.abs(closest.freq - freq) ? station : closest;
  }, stations[0]);
}

function stationKey(station) {
  return `${station.freq} ${station.title}`;
}

function renderStation(station) {
  currentStation = station;
  trackTitle.textContent = station.title;
  trackMeta.textContent = `${station.freq.toFixed(1)} FM 쨌 ${station.meta}`;
  albumArt.textContent = station.art;
  statusText.textContent = `ON AIR: ${station.title}`;
  favoriteBtn.classList.toggle("active", favorites.includes(stationKey(station)));
}

function renderFavorites() {
  favoritesList.innerHTML = "";
  bookmarkHint.hidden = favorites.length > 0;
  favorites.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    favoritesList.appendChild(li);
  });
}

function extractYouTubeId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1).split("/")[0];
    }

    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/shorts/") || parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2];
      }

      return parsed.searchParams.get("v");
    }
  } catch (error) {
    return "";
  }

  return "";
}

function toGitHubRawUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "raw.githubusercontent.com") {
      return parsed.href;
    }

    if (parsed.hostname === "github.com") {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const blobIndex = parts.indexOf("blob");
      if (parts.length > 4 && blobIndex === 2) {
        const user = parts[0];
        const repo = parts[1];
        const branch = parts[3];
        const filePath = parts.slice(4).join("/");
        return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${filePath}`;
      }
    }
  } catch (error) {
    return url;
  }

  return url;
}

function stopYouTube() {
  youtubeHost.innerHTML = "";
  activeYouTubeUrl = "";
}

function playYouTubeAudio(url) {
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    statusText.textContent = "YouTube link could not be read.";
    return;
  }

  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  activeYouTubeUrl = url;
  youtubeHost.innerHTML = "";

  const iframe = document.createElement("iframe");
  iframe.allow = "autoplay; encrypted-media";
  iframe.title = "YouTube audio source";
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&controls=0&modestbranding=1`;
  youtubeHost.appendChild(iframe);

  currentStation = {
    freq: Number(tuner.value),
    title: "YouTube Voice Audio",
    meta: "youtube link audio",
    art: "YT"
  };
  trackTitle.textContent = currentStation.title;
  trackMeta.textContent = "YouTube link loaded 쨌 video is minimized";
  albumArt.textContent = currentStation.art;
  statusText.textContent = "LIVE NOW: YouTube audio";
  radio.classList.add("is-playing");
  favoriteBtn.classList.toggle("active", favorites.includes(stationKey(currentStation)));
}

async function playExternalAudio(url) {
  stopYouTube();
  const rawUrl = toGitHubRawUrl(url);
  audio.src = rawUrl;

  currentStation = {
    freq: Number(tuner.value),
    title: rawUrl.includes("github") ? "GitHub Audio Link" : "External Audio Link",
    meta: "linked audio source",
    art: rawUrl.includes("github") ? "GH" : "URL"
  };
  trackTitle.textContent = currentStation.title;
  trackMeta.textContent = rawUrl;
  albumArt.textContent = currentStation.art;
  statusText.textContent = "Loading linked audio...";
  radio.classList.add("is-playing");

  try {
    await audio.play();
    statusText.textContent = `LIVE NOW: ${currentStation.title}`;
  } catch (error) {
    radio.classList.remove("is-playing");
    statusText.textContent = "This link cannot be played directly. Use a raw .mp3/.wav/.ogg URL.";
  }
}

playBtn.addEventListener("click", async () => {
  radio.classList.add("is-playing");
  statusText.textContent = `LIVE NOW: ${currentStation.title}`;

  if (activeYouTubeUrl) {
    playYouTubeAudio(activeYouTubeUrl);
    return;
  }

  if (audio.src) {
    try {
      await audio.play();
    } catch (error) {
      statusText.textContent = "UPLOAD???뚯븙???ㅼ떆 ?ъ깮??二쇱꽭??";
    }
  }
});

stopBtn.addEventListener("click", () => {
  radio.classList.remove("is-playing");
  stopYouTube();
  audio.pause();
  statusText.textContent = `ON AIR: ${currentStation.title}`;
});

favoriteBtn.addEventListener("click", () => {
  const key = stationKey(currentStation);
  favorites = favorites.includes(key)
    ? favorites.filter((item) => item !== key)
    : [...favorites, key];
  localStorage.setItem("radioFavorites", JSON.stringify(favorites));
  renderStation(currentStation);
  renderFavorites();
});

tuner.addEventListener("input", () => {
  renderStation(findStation(Number(tuner.value)));
});

audioUpload.addEventListener("change", () => {
  const file = audioUpload.files[0];
  if (!file) return;

  stopYouTube();
  audio.src = URL.createObjectURL(file);
  trackTitle.textContent = file.name.replace(/\.[^/.]+$/, "");
  trackMeta.textContent = "uploaded background music 쨌 local file";
  albumArt.textContent = "LOCAL";
  statusText.textContent = "?낅줈?쒗븳 諛곌꼍?뚯븙??以鍮꾨릺?덉뒿?덈떎.";
  currentStation = {
    freq: Number(tuner.value),
    title: trackTitle.textContent,
    meta: "uploaded background music",
    art: "LOCAL"
  };
});

loadUrlBtn.addEventListener("click", () => {
  const url = mediaUrl.value.trim();
  if (!url) {
    statusText.textContent = "Paste a YouTube or GitHub audio URL first.";
    return;
  }

  if (extractYouTubeId(url)) {
    playYouTubeAudio(url);
    return;
  }

  playExternalAudio(url);
});

makeBars();
renderStation(currentStation);
renderFavorites();

const audio = document.getElementById("audio");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const cover = document.getElementById("cover");
const progress = document.getElementById("progress");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const volume = document.getElementById("volume");
const volumeValue = document.getElementById("volumeValue");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const autoplay = document.getElementById("autoplay");
const fileInput = document.getElementById("fileInput");
const playlistElement = document.getElementById("playlist");

let songs = [];
let currentIndex = -1;
let isShuffle = false;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function loadSong(index, autoPlay = false) {
  if (!songs[index]) return;

  currentIndex = index;
  const song = songs[index];

  audio.src = song.url;
  title.textContent = song.name;
  artist.textContent = "Local music";
  cover.textContent = song.name.charAt(0).toUpperCase();

  progress.value = 0;
  currentTime.textContent = "0:00";
  duration.textContent = "0:00";

  renderPlaylist();

  if (autoPlay) {
    playSong();
  }
}

async function playSong() {
  if (!songs.length) {
    fileInput.click();
    return;
  }

  if (currentIndex === -1) {
    loadSong(0);
  }

  try {
    await audio.play();
    playBtn.textContent = "Pause";
    playBtn.setAttribute("aria-label", "Pause");
  } catch (error) {
    console.log("Playback was not started:", error);
  }
}

function pauseSong() {
  audio.pause();
  playBtn.textContent = "Play";
  playBtn.setAttribute("aria-label", "Play");
}

function nextSong() {
  if (!songs.length) return;

  let nextIndex;

  if (isShuffle && songs.length > 1) {
    do {
      nextIndex = Math.floor(Math.random() * songs.length);
    } while (nextIndex === currentIndex);
  } else {
    nextIndex = (currentIndex + 1) % songs.length;
  }

  loadSong(nextIndex, true);
}

function previousSong() {
  if (!songs.length) return;

  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  const previousIndex =
    (currentIndex - 1 + songs.length) % songs.length;

  loadSong(previousIndex, true);
}

function renderPlaylist() {
  playlistElement.innerHTML = "";

  if (!songs.length) {
    playlistElement.innerHTML = `
      <p class="empty-message">
        Choose MP3 files from your computer to start listening.
      </p>
    `;
    return;
  }

  songs.forEach((song, index) => {
    const item = document.createElement("div");
    item.className = `track ${index === currentIndex ? "active" : ""}`;

    item.innerHTML = `
      <div class="track-name">
        <strong>${escapeHTML(song.name)}</strong>
        <span>Local music</span>
      </div>
      <div>
        <span class="track-duration">${song.duration || "--:--"}</span>
        <button class="remove-track" type="button" aria-label="Remove ${escapeHTML(song.name)}">Remove</button>
      </div>
    `;

    item.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-track")) return;
      loadSong(index, true);
    });

    item.querySelector(".remove-track").addEventListener("click", () => {
      removeSong(index);
    });

    playlistElement.appendChild(item);
  });
}

function removeSong(index) {
  const wasCurrent = index === currentIndex;
  const removedUrl = songs[index]?.url;

  if (removedUrl) URL.revokeObjectURL(removedUrl);

  songs.splice(index, 1);

  if (!songs.length) {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    currentIndex = -1;
    title.textContent = "No song selected";
    artist.textContent = "Add music to your playlist";
    cover.textContent = "M";
    progress.value = 0;
    currentTime.textContent = "0:00";
    duration.textContent = "0:00";
    pauseSong();
  } else if (wasCurrent) {
    const newIndex = Math.min(index, songs.length - 1);
    loadSong(newIndex, false);
    pauseSong();
  } else if (index < currentIndex) {
    currentIndex--;
  }

  renderPlaylist();
}

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

fileInput.addEventListener("change", (event) => {
  const files = Array.from(event.target.files || [])
    .filter(file => file.type.startsWith("audio/") || /\.(mp3|wav|ogg|m4a)$/i.test(file.name));

  files.forEach(file => {
    const url = URL.createObjectURL(file);

    const song = {
      name: file.name.replace(/\.[^/.]+$/, ""),
      url,
      duration: null
    };

    songs.push(song);

    const tempAudio = new Audio();
    tempAudio.preload = "metadata";
    tempAudio.src = url;

    tempAudio.addEventListener("loadedmetadata", () => {
      song.duration = formatTime(tempAudio.duration);
      renderPlaylist();
    }, { once: true });
  });

  if (currentIndex === -1 && songs.length) {
    loadSong(0, false);
  } else {
    renderPlaylist();
  }

  fileInput.value = "";
});

playBtn.addEventListener("click", () => {
  if (audio.paused) {
    playSong();
  } else {
    pauseSong();
  }
});

prevBtn.addEventListener("click", previousSong);
nextBtn.addEventListener("click", nextSong);

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;

  progress.value = (audio.currentTime / audio.duration) * 100;
  currentTime.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  duration.textContent = formatTime(audio.duration);
});

audio.addEventListener("ended", () => {
  if (autoplay.checked) {
    nextSong();
  } else {
    pauseSong();
  }
});

progress.addEventListener("input", () => {
  if (!audio.duration) return;

  audio.currentTime = (progress.value / 100) * audio.duration;
});

volume.addEventListener("input", () => {
  audio.volume = volume.value / 100;
  volumeValue.textContent = `${volume.value}%`;
});

shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
  shuffleBtn.textContent = isShuffle ? "Shuffle On" : "Shuffle";
});

document.addEventListener("keydown", (event) => {
  const tag = document.activeElement.tagName.toLowerCase();

  if (tag === "input" || tag === "button") return;

  if (event.code === "Space") {
    event.preventDefault();
    if (audio.paused) playSong();
    else pauseSong();
  }

  if (event.key === "ArrowRight" && audio.duration) {
    audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
  }

  if (event.key === "ArrowLeft" && audio.duration) {
    audio.currentTime = Math.max(audio.currentTime - 5, 0);
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    volume.value = Math.min(Number(volume.value) + 5, 100);
    volume.dispatchEvent(new Event("input"));
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    volume.value = Math.max(Number(volume.value) - 5, 0);
    volume.dispatchEvent(new Event("input"));
  }
});

audio.volume = 0.8;
renderPlaylist();

const audio = document.getElementById("audio");

const playBtn = document.getElementById("playBtn");
const playText = document.getElementById("playText");

const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");

const progressBar = document.getElementById("progressBar");

const currentTimeDisplay = document.getElementById("currentTime");
const durationDisplay = document.getElementById("duration");

const volumeBar = document.getElementById("volumeBar");
const volumeValue = document.getElementById("volumeValue");

const songTitle = document.getElementById("songTitle");
const artistName = document.getElementById("artistName");

const playlistElement = document.getElementById("playlist");

const autoplayToggle = document.getElementById("autoplayToggle");
const shuffleBtn = document.getElementById("shuffleBtn");

const coverLetter = document.getElementById("coverLetter");


/*
    Playlist
    Replace the audio file paths with your own MP3 files.
*/

const songs = [
    {
        title: "Lonely At the Top",
        artist: "Asake",
        src: "music/lonely-at-the-top.mp3"
    },
    {
        title: "City Boys",
        artist: "Burna Boy",
        src: "music/city-boys.mp3"
    },
    {
        title: "Feel",
        artist: "Davido",
        src: "music/feel.mp3"
    }
];


let currentSongIndex = 0;
let isShuffle = false;


/* Load selected song */

function loadSong(index) {

    currentSongIndex = index;

    const song = songs[currentSongIndex];

    audio.src = song.src;

    songTitle.textContent = song.title;
    artistName.textContent = song.artist;

    coverLetter.textContent = song.title.charAt(0).toUpperCase();

    progressBar.value = 0;

    currentTimeDisplay.textContent = "0:00";
    durationDisplay.textContent = "0:00";

    updatePlaylist();
}


/* Play song */

function playSong() {

    audio.play()
        .then(() => {
            playText.textContent = "PAUSE";
        })
        .catch((error) => {
            console.log("Audio could not be played:", error);
        });
}


/* Pause song */

function pauseSong() {

    audio.pause();

    playText.textContent = "PLAY";
}


/* Play / pause button */

playBtn.addEventListener("click", () => {

    if (audio.paused) {
        playSong();
    } else {
        pauseSong();
    }

});


/* Next song */

function nextSong() {

    if (isShuffle) {

        let nextIndex;

        do {
            nextIndex = Math.floor(Math.random() * songs.length);
        } while (nextIndex === currentSongIndex && songs.length > 1);

        currentSongIndex = nextIndex;

    } else {

        currentSongIndex++;

        if (currentSongIndex >= songs.length) {
            currentSongIndex = 0;
        }

    }

    loadSong(currentSongIndex);
    playSong();
}


nextBtn.addEventListener("click", nextSong);


/* Previous song */

function previousSong() {

    currentSongIndex--;

    if (currentSongIndex < 0) {
        currentSongIndex = songs.length - 1;
    }

    loadSong(currentSongIndex);
    playSong();
}


previousBtn.addEventListener("click", previousSong);


/* Update progress */

audio.addEventListener("timeupdate", () => {

    if (!audio.duration) {
        return;
    }

    const progress = (audio.currentTime / audio.duration) * 100;

    progressBar.value = progress;

    currentTimeDisplay.textContent =
        formatTime(audio.currentTime);

});


/* Load duration */

audio.addEventListener("loadedmetadata", () => {

    durationDisplay.textContent =
        formatTime(audio.duration);

});


/* Seek through song */

progressBar.addEventListener("input", () => {

    if (!audio.duration) {
        return;
    }

    const newTime =
        (progressBar.value / 100) * audio.duration;

    audio.currentTime = newTime;

});


/* Volume */

volumeBar.addEventListener("input", () => {

    audio.volume = volumeBar.value;

    const percentage =
        Math.round(volumeBar.value * 100);

    volumeValue.textContent = `${percentage}%`;

});


/* Autoplay */

audio.addEventListener("ended", () => {

    if (autoplayToggle.checked) {

        nextSong();

    } else {

        playText.textContent = "PLAY";
        progressBar.value = 0;

    }

});


/* Shuffle */

shuffleBtn.addEventListener("click", () => {

    isShuffle = !isShuffle;

    shuffleBtn.classList.toggle("active", isShuffle);

});


/* Playlist */

function createPlaylist() {

    playlistElement.innerHTML = "";

    songs.forEach((song, index) => {

        const item = document.createElement("div");

        item.classList.add("playlist-item");

        item.innerHTML = `
            <div class="track-info">

                <span class="track-number">
                    ${String(index + 1).padStart(2, "0")}
                </span>

                <div>
                    <div class="track-title">
                        ${song.title}
                    </div>

                    <div class="track-artist">
                        ${song.artist}
                    </div>
                </div>

            </div>

            <span class="track-duration">
                --
            </span>
        `;

        item.addEventListener("click", () => {

            loadSong(index);
            playSong();

        });

        playlistElement.appendChild(item);

    });

    updatePlaylist();

}


/* Highlight active song */

function updatePlaylist() {

    const playlistItems =
        document.querySelectorAll(".playlist-item");

    playlistItems.forEach((item, index) => {

        item.classList.toggle(
            "active",
            index === currentSongIndex
        );

    });

}


/* Format time */

function formatTime(seconds) {

    if (isNaN(seconds)) {
        return "0:00";
    }

    const minutes =
        Math.floor(seconds / 60);

    const remainingSeconds =
        Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;

}


/* Keyboard controls */

document.addEventListener("keydown", (event) => {

    /*
        Space = Play/Pause
        Arrow Right = Forward 5 seconds
        Arrow Left = Back 5 seconds
        Arrow Up = Increase volume
        Arrow Down = Decrease volume
    */

    if (
        event.target.tagName === "INPUT"
    ) {
        return;
    }

    if (event.code === "Space") {

        event.preventDefault();

        if (audio.paused) {
            playSong();
        } else {
            pauseSong();
        }

    }

    if (event.code === "ArrowRight") {

        audio.currentTime =
            Math.min(
                audio.currentTime + 5,
                audio.duration || audio.currentTime
            );

    }

    if (event.code === "ArrowLeft") {

        audio.currentTime =
            Math.max(
                audio.currentTime - 5,
                0
            );

    }

    if (event.code === "ArrowUp") {

        event.preventDefault();

        audio.volume =
            Math.min(audio.volume + 0.1, 1);

        volumeBar.value = audio.volume;

        volumeValue.textContent =
            `${Math.round(audio.volume * 100)}%`;

    }

    if (event.code === "ArrowDown") {

        event.preventDefault();

        audio.volume =
            Math.max(audio.volume - 0.1, 0);

        volumeBar.value = audio.volume;

        volumeValue.textContent =
            `${Math.round(audio.volume * 100)}%`;

    }

});


/* Initialize player */

audio.volume = 0.8;

loadSong(0);

createPlaylist();

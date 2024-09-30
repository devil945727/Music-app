console.log("Thi is js");
let currentsong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currfolder = folder;

    // Use relative paths for Netlify compatibility
    let response = await fetch(`/${folder}`);
    let htmlText = await response.text();

    let div = document.createElement("div");
    div.innerHTML = htmlText;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // Show all songs in the playlist
    let songUL = document.querySelector(".song-list ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li>
            <img class="invert" src="img/svg/music.svg" alt="">
            <div class="song-name">
                <div>${decodeURI(song)}</div>
                <div>Aman</div>
            </div>
            <div class="play-now">
                <img class="invert" height="20px" src="img/svg/play.svg" alt="">
            </div>
        </li>`;
    }

    // Attach event listener to each song
    Array.from(document.querySelectorAll(".song-list li")).forEach((e) => {
        e.addEventListener("click", (element) => {
            playMusic(e.querySelector(".song-name div").innerHTML.trim());
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentsong.src = `/${currfolder}/` + track;
    if (!pause) {
        currentsong.play();
        play.src = "img/svg/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function displayAlbum() {
    // Use relative paths for fetching album data
    let response = await fetch(`/songs/`);
    let htmlText = await response.text();

    let div = document.createElement("div");
    div.innerHTML = htmlText;
    let anchors = div.getElementsByTagName("a");

    let cardCont = document.querySelector(".cardCont");
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0];

            // Fetch album metadata
            let respond = await fetch(`/songs/${folder}/info.json`).then((r) => r.json());

            cardCont.innerHTML += `
                <div data-folder="${folder}" class="card flex rounded">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path
                                d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"></path>
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" class="card-img" alt="">
                    <h2>${respond.title}</h2>
                    <p>${respond.description}</p>
                </div>`;
        }
    }

    // Add event listeners for loading songs
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async (item) => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    await getSongs("songs/cs");
    playMusic(songs[0], true);

    // Display albums
    displayAlbum();

    // Event listener for play button
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/svg/pause.svg";
        } else {
            currentsong.pause();
            play.src = "img/svg/play.svg";
        }
    });

    // Update time and seekbar
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    // Seekbar control
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    });

    // Volume control
    document.querySelector(".range input").addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
    });

    // Mute control
    document.querySelector(".vlmimg").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentsong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentsong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });

    // Next/Previous controls
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index + 1 <= songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    });
}

main();

let currentSong = new Audio();
let songsn;
let currentFolder;
const btn = document.querySelector(".play-btn");

async function getSong(folder , firstTime = true) {
  currentFolder = folder;
  let a = await fetch(`../music/${folder}`);
  let res = await a.text();
  let div = document.createElement("div");
  div.innerHTML = res;
  let as = div.getElementsByTagName("a");
  let song = [];
  let songs = [];
  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith(".mp3")) {
      song.push(decodeURI(element.href.split(`/music/${folder}`)[1]));
      songs.push(element.href)
    }
  }

  //show all songs in playlist
  let songlist = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songlist.innerHTML = "";
  for (const songn of song) {
    songname = songn.replaceAll("%20", " ").replace(".mp3", "");
    songlist.innerHTML =
      songlist.innerHTML +
      `<li>
                <img src="images/music.svg" alt="music" />
                <div class="info">
                  <div>${songname.split("/")[1]}</div>
                  <div>${decodeURI(folder)}</div>
                </div>
                <div class="playnow">
                  <span>Play Now</span>
                  <img src="images/play.svg" alt="play" class="invert" />
                </div>
              </li>`;
  }

  //play first song
  let daf =
    document
      .querySelector(".songlist")
      .getElementsByTagName("li")[0]
      .querySelector(".info").children[0].innerHTML + ".mp3";

  if(firstTime == true){
    playMusic(daf, true);
  }


  console.log("song", song);

  //atach an event listner to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      let a = e.querySelector(".info").children[0].innerHTML + ".mp3";
      console.log(a);
      playMusic(a);
    });
  });

  //atach an event listner to play,pause,next,prev
  function songOp() {
    play.addEventListener("click", () => {
      console.log("play Clicked");
      if (currentSong.paused) {
        currentSong.play();
        play.src = "images/pause.svg";
      } else {
        currentSong.pause();
        play.src = "images/play.svg";
      }
    });

    //time upadate event
    currentSong.addEventListener("timeupdate", () => {
      document.querySelector(".songtime").innerHTML = `${formatTime(
        currentSong.currentTime
      )} / ${formatTime(currentSong.duration)}`;

      let percent = (currentSong.currentTime / currentSong.duration) * 100;
      document.querySelector(".circle").style.left =
        percent + "%";
      localStorage.setItem("currentTime", percent)
      // console.log("percent",percent,"==",localStorage.currentTime);
      
    });
    currentSong.addEventListener('ended', () => {

      let index = songs.indexOf(currentSong.src);
      console.log("song ended", index);
      if (index + 1 < songs.length) {
        playMusic(songs[index + 1].split(`/music/${folder}/`)[1]);
      } else {
        console.log("Access denied");
      }
      
    })
    //previous next functions

    let prev = document.querySelector("#prev");
    prev = removeAllListeners(prev);
    prev.addEventListener("click", () => {
      let index = songs.indexOf(currentSong.src);
      console.log(index);
      console.log("Previous Clikced");
      if (index - 1 >= 0) {
        playMusic(songs[index - 1].split(`/music/${folder}/`)[1]);
      } else {
        console.log("Access denied");
      }
      console.log(songs);
    });

    let next = document.querySelector("#next");
    next = removeAllListeners(next);
    next.addEventListener("click", () => {
      let index = songs.indexOf(currentSong.src);
      console.log(songs, currentSong.src);
      if (index + 1 < songs.length) {
        playMusic(songs[index + 1].split(`/music/${folder}/`)[1]);
      } else {
        console.log("Access denied");
      }
    });

  }

  songOp()
  return song;
}

const playMusic = (track, muted = false) => {
  // set current song
  localStorage.setItem('currentSong', track);
  currentSong.src = `music/${currentFolder}/` + track;
  
  if (!muted) {
    currentSong.play();
    play.src = "images/pause.svg";
    play.title = "Play music"
  } else {
    play.src = "images/play.svg";
    play.title = "Play music"
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(
    track.replace(".mp3", "")
  );
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function dipslayAlbmus() {
  let a = await fetch(`../music/`);
  let res = await a.text();
  let div = document.createElement("div");
  div.innerHTML = res;

  let anchors = div.getElementsByTagName("a");
  let cardConatiner = document.querySelector(".card-container");

  let array = Array.from(anchors);
  let albums = []

  //showing cards and ataching event lisners
  for (let i = 0; i < array.length; i++) {
    const e = array[i];
    if (e.href.includes("/music/")) {
      let folder = e.href.split("/").slice(-1)[0];
      albums.push(folder)
      //metadata
      let a = await fetch(`../music/${folder}/info.json`);
      let res = await a.json();
      console.log(cardConatiner);

      //dom manipulation
      cardConatiner.innerHTML += `<div class="card" data-folder="${folder}">
                <div class="img">
                  <img
                    src="music/${folder}/cover.jpeg"
                    alt="playlist"
                  />
                  <div class="play">
                    <img src="images/play.svg" alt="" />
                  </div>
                </div>
                <h2>${res.title}</h2>
                <p>
                  "${res.discription}"
                </p>
              </div>`;
    }

    //event listner to each card
    Array.from(document.querySelectorAll(".card")).forEach((e) => {
      e.addEventListener("click", async (item) => {
        songsn = await getSong(`${e.dataset.folder}`);

        playMusic(songsn[0].split("/")[1])
        //current folder to loacl storage
        localStorage.setItem('currentFolder', e.dataset.folder);
      });
    });
  }
  return albums
}

async function main() {
  //display albums
  let albumsRes = await dipslayAlbmus();
  //get local starage song folder
  
  if (localStorage.currentFolder && albumsRes.includes(localStorage.currentFolder)) {
    let getSongRes = await getSong(localStorage.currentFolder ,false)
    console.log(getSongRes)

    //get sogn name
    if (localStorage.currentSong) {
      playMusic(localStorage.currentSong, true)

      //get song volume 
      if(localStorage.volume){
        currentSong.volume = localStorage.volume
      }

      //get song time
      if (localStorage.currentTime) {
        
        currentSong.addEventListener('loadedmetadata', function () {
          // duration = currentSong.duration // Duration will be available here
          currentSong.currentTime = parseInt(localStorage.currentTime) / 100 * currentSong.duration;
          console.log(currentSong.currentTime,currentSong.duration);
        });
        
      }
      else {
        currentSong.currentTime = 0;
      }
      console.log("loaded song " + localStorage.currentSong);
    }
    else {
      playMusic(getSongRes[0],true);
      console.log("failed to load song " + getSongRes[0]);
      
    }
    // console.log(a)
  }
  else {
    getSong(albumsRes[0])
    localStorage.setItem("currentFolder",albumsRes[0]);
    console.log("executing else");
    
  }

  //seekbar functionality
  let seekbar = document.querySelector(".seekbar");
  seekbar.addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //event listner for hamburger
  let hamburger = document.querySelector(".ham");
  hamburger.addEventListener("click", () => {
    document.querySelector(".left").style.left = "0%";
  });
  document.querySelector(".cross").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  //volume control
  let volume = document.querySelector("#volume");
  volume.addEventListener("input", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
    console.log("Setting volume to " + e.target.value, "/100");
    localStorage.setItem("volume", currentSong.volume);
  });
  volume.value = currentSong.volume * 100;

  //mute the track
  let mute = document.querySelector(".volume img");
  mute.addEventListener("click", () => {
    if (currentSong.muted) {
      currentSong.muted = false;
      volume.value = currentSong.volume * 100;
      volume.removeAttribute("disabled", "");
      mute.src = "images/volume.svg";
    } else {
      currentSong.muted = true;
      volume.value = 0;
      volume.setAttribute("disabled", "");
      mute.src = "images/mute.svg";
    }
  });
}

try {
  main();

} catch (error) {
  console.error(error);
}

function formatTime(decimalSeconds) {
  const totalSeconds = Math.floor(decimalSeconds); // Convert decimal seconds to whole seconds
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  let formattedMinutes = minutes.toString().padStart(2, "0");
  let formattedSeconds = secs.toString().padStart(2, "0");
  if (isNaN(formattedMinutes)) {
    formattedMinutes = "00";
  }
  if (isNaN(formattedSeconds)) {
    formattedSeconds = "00";
  }
  return `${formattedMinutes}:${formattedSeconds}`;
}

function removeAllListeners(element) {
  const newElement = element.cloneNode(true);
  element.parentNode.replaceChild(newElement, element);
  return newElement;
}

// c.style.height = (c.clientHeight+100)+"px";
console.log("Thi is js");
let currentsong=new Audio;
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
    currfolder=folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}`);
    let response = await a.text();
    // console.log(response);
    let div=document.createElement("div");
    div.innerHTML=response;
    let as=div.getElementsByTagName("a");
    songs=[]
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
        
    }
    //show all song in the playlist
    let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0]
    songUL.innerHTML=""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="img/svg/music.svg" alt="">
                            <div class="song-name">
                                <div> ${decodeURI(song)} </div>
                                <div>Aman</div>
                            </div>  
                            <div class="play-now">
                                <img class="invert" height="20px" src="img/svg/play.svg" alt="">
                            </div></li>`;
    }
    //Attach an event listener to each song
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click",element=>{
            playMusic(e.querySelector(".song-name").firstElementChild.innerHTML.trim())
        })
    })
}

const playMusic = (track,pause=false)=>{
    // let audio=new Audio("/Project-2%20Spotify/songs/" + track)
    currentsong.src=`/${currfolder}/` + track
    if(!pause){
        currentsong.play()
        play.src="img/svg/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML=decodeURI(track)
    document.querySelector(".songtime").innerHTML="00:00/00:00"
}

async function displayAlbum(){
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div=document.createElement("div");
    div.innerHTML=response;
    let anchors=div.getElementsByTagName("a")
    let cardCont = document.querySelector(".cardCont")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("/songs/")){
            let folder= e.href.split("/").slice(-1)[0]
            //get metadata
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let respond= await a.json();
            console.log(respond);
            cardCont.innerHTML = cardCont.innerHTML + `<div data-folder="${folder}" class="card flex rounded">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                    color="#000000" fill="">
                    <path
                        d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                        stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" class="card-img" alt="">
            <h2>${respond.title}</h2>
            <p>${respond.description}</p>
        </div>`;
        }
    }
    //add event for load the song
     Array.from(document.getElementsByClassName("card")).forEach(e=>{
        // console.log(e)
        e.addEventListener("click",async item=>{
            console.log(item,item.currentTarget.dataset)
            song=await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
      })
}

async function main(){
    
    await getSongs("songs/ncs")
    playMusic(songs[0],true)

    //display album
    displayAlbum()

    //attach an event listner to play the song
    play.addEventListener("click",() => {
        if(currentsong.paused){
            currentsong.play()
            play.src="img/svg/pause.svg"
        } 
        else{
            currentsong.pause()
            play.src="img/svg/play.svg"
        }     
    })

    //for time update
    currentsong.addEventListener("timeupdate",() => {
        // console.log(currentsong.currentTime,currentsong.duration);
        document.querySelector(".songtime").innerHTML=`${secondsToMinutesSeconds(currentsong.
            currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left=(currentsong.currentTime/currentsong.duration) * 100 +"%"
        })

        // Add seekbar motion
        document.querySelector(".seekbar").addEventListener("click", e => {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            currentsong.currentTime = ((currentsong.duration) * percent) / 100
        })

        //add an event for haamburger
        document.querySelector(".hambur").addEventListener("click",() => {
            document.querySelector(".left").style.left="0"          
        })

        // add event for ham close
        document.querySelector(".close").addEventListener("click",() => {
            document.querySelector(".left").style.left="-100%"          
        })

        //add event for next 
        next.addEventListener("click",() => {
            currentsong.pause();
            // console.log("Next button clicked")
          let index=songs.indexOf(currentsong.src.split("/").splice(-1)[0]);
          if((index+1)<= songs.length-1){
            playMusic(songs[index+1])
          }
        })
        //add event for previous 
        previous.addEventListener("click",() => {
            // console.log("previous button clicked")
            let index=songs.indexOf(currentsong.src.split("/").splice(-1)[0]);
            if((index-1)>=0){
              playMusic(songs[index-1])
            }
          })

          //add event for volume
          document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e) => {
            console.log(e,e.target.value)  
            currentsong.volume=parseInt(e.target.value)/100          
          })

         //add event for mute on click
         document.querySelector(".vlmimg").addEventListener("click", e=>{
            if(e.target.src.includes("volume.svg")){
                console.log(e.target)
                e.target.src = e.target.src.replace("volume.svg","mute.svg")
                currentsong.volume=0;
                document.querySelector(".range").getElementsByTagName("input")[0].value=0
            }
            else{
                e.target.src = e.target.src.replace("mute.svg","volume.svg")
                currentsong.volume=.1;
                document.querySelector(".range").getElementsByTagName("input")[0].value=10;

            }
         })


    //play first song
        // var audio = new Audio(songs[0]);
        // audio.play();
        // audio.addEventListener("loadeddata",() => {
        //   let duration=audio.duration;
        //   console.log(duration);
        // });
}

main()

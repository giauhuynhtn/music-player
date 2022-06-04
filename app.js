const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Noi minh dung chan',
            singer: 'My Tam',
            path: './assets/music/song1.mp3',
            image: './assets/img/song1.jpeg',
        },
        {
            name: 'Untamed OST',
            singer: 'Vuong Nhat Bac',
            path: './assets/music/song2.mp3',
            image: './assets/img/song2.jpeg',
        },
        {
            name: 'Ai cung co ngay xua',
            singer: 'Phan Manh Quynh',
            path: './assets/music/song3.mp3',
            image: './assets/img/song3.jpeg',
        },
        {
            name: 'Co chang trai viet len cay',
            singer: 'Phan Manh Quynh',
            path: './assets/music/song4.mp3',
            image: './assets/img/song4.jpeg',
        },
        {
            name: 'Con mo bang gia',
            singer: 'Bang Kieu',
            path: './assets/music/song5.mp3',
            image: './assets/img/song5.jpeg',
        },
        {
            name: 'Tan phai giac mo',
            singer: 'Hoang Bach',
            path: './assets/music/song6.mp3',
            image: './assets/img/song6.jpeg',
        },
        {
            name: 'Neu anh di',
            singer: 'My Tam',
            path: './assets/music/song7.mp3',
            image: './assets/img/song7.jpeg',
        },
        {
            name: 'Vi sao the',
            singer: 'Anh Khoa',
            path: './assets/music/song8.mp3',
            image: './assets/img/song8.jpeg',
        },
        {
            name: 'Canh hong phai',
            singer: 'Tran Thanh',
            path: './assets/music/song9.mp3',
            image: './assets/img/song9.jpeg',
        }
    ],
    setConfig: function (key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" 
                    style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        $('.playlist').innerHTML = htmls.join('')
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function () {
        const _this = this
        const cdWidth = cd.offsetWidth

        // Handle CD rotate/stop events
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        // handle zoom in/out CD img
        document.onscroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth
        }
        // handle when click Play button
        playBtn.onclick = () => {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // when song is played
        audio.onplay = () => {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // when song is paused
        audio.onpause = () => {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // when time of song is changed
        audio.ontimeupdate = () => {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime/audio.duration *100)
                progress.value = progressPercent
            }
        }

        // handle when seek song
        progress.oninput = (e) => {
            const seekTime = e.target.value / 100 * audio.duration;
            audio.currentTime = seekTime
        }

        // when go to next song
        nextBtn.onclick = () => {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // when go to previous song
        prevBtn.onclick = () => {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // handle activate/deactivate random mode
        randomBtn.onclick = () => {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // handle activate/deactivate repeat mode
        repeatBtn.onclick = () => {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // handle next song when audio ended
        audio.onended = () => {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.onclick()
            }
        }

        // Listen event click on playlist
        playlist.onclick = (e) => {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')) {
                // handle when click on song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
                // handle when click on song option
                if (e.target.closest('.option')) {

                }
            }
        }
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 500)
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function () {
        let newIndex 
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    start: function() {
        // Merge setting from config to app
        this.loadConfig()

        // defind properties for object
        this.defineProperties()

        // listen/ handle DOM events
        this.handleEvents()

        // load the first song when start apply
        this.loadCurrentSong()

        // render playlist
        this.render()

        // initial condition of repeat and random buttons
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)

    }
}

app.start()


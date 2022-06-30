const $ =document.querySelector.bind(document);
const $$ =document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY ='F8_PLAYER'

const heading =$('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn =$('.btn-repeat')
const playlist =$('.playlist')


const app ={
    //lấy vị trí đâu tiên
    currentIndex: 0,
    isPlaying:false,
    isRandom:false,
    // cái gì liên quan tới có hoặc không thì nên gán biến boolean
    isRepeat:false,
    //get lấy ra set đặt lại,
    // CÁCH LƯU TRÊN LOCALSTORAGE DỄ KIỂM SOÁT (**) khi load lại vẫn giữ data cũ 
    config:JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    songs: [
        {
          name: "Ai Thấu Lòng Anh",
          singer: "Phạm sắc lệnh",
          path: "./asserts/song/Ai-Thau-Long-Anh-Thien-An-Pham-Sac-Lenh.mp3",
          image: "./asserts/img/ai_thau_long_anh.jpg"
        },
        {
            name: "Chạy về khóc với anh",
            singer: "Erik",
            path: "./asserts/song/Chay-Ve-Khoc-Voi-Anh-ERIK.mp3",
            image: "./asserts/img/chay_ve_khoc_voi_anh.jpg"
        },
        {
            name: "Chạy về nơi phía anh",
            singer: "Khắc việt",
            path: "./asserts/song/Chay-Ve-Noi-Phia-Anh-Khac-Viet.mp3",
            image: "./asserts/img/chay_ve_phia_anh.jpg"
        },
        {
            name: "Nhạt nhòa mưa phai",
            singer: "hương ly",
            path: "./asserts/song/Nhat-Nhoa-Mua-Phai-Huong-Ly-Son-Vie.mp3",
            image: "./asserts/img/nhat_nhoa_mua_phai.jpg"
        },
        {
            name: "Tình đơn côi",
            singer: "Vicky Nhung",
            path: "./asserts/song/Tinh-Don-Coi-Vicky-Nhung-Long-Rex.mp3",
            image: "./asserts/img/tinh_don_coi.jpg"
        },
        {
            name: "Vài câu nói",
            singer: "Vicky Nhung",
            path: "./asserts/song/Vài câu nói có khiên thay đổi.mp3",
            image: "./asserts/img/vai_cau_noi.jpg"
        },
    ],
    // ** tạo config
    setConfig:function(key,value){
        this.config[key]=value;
        // storage chỉ lưu chuỗi thôi
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config))
    },
    // 1. Render songs :xuat bai hat
    render: function(){
        const htmls = this.songs.map((song,index)=>{
            return `<div class="song ${index === this.currentIndex ? 'active':'' }" data-index="${index}">
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>`
        })
        playlist.innerHTML = htmls.join('')
    },

    //xử lý sự kiện DOM
    handleEvent:function(){
        const cdWidth = cd.offsetWidth
        //KIẾN THỨC MỚI NÈ NHỚ ĐÓ xử lý Cd xoay và dừngg
        //tự động quay khi load web
        //NHỚ TÌM THÊM PHƯƠNG THỨC CỦA ANIMATE RẤT HAY ==>CONSOLE.LOG
        const cdThumbAnimate = cdThumb.animate([
            //rotate là xoay scale phóng ra từ giữa
            {transform: 'rotate(360deg)'}
        ],{
            duration: 10000,
            //lặp lại bao nhiêu lần 
            iterations: Infinity
        })
        cdThumbAnimate.pause()
        //2. Scroll top
        document.onscroll=function(){
                // documentElêmnt là đang lấy html vì đang chọc vô nó
                //lấy ra cái sự duyên chuyển srcoll
                const srcollTop = window.scrollY || document.documentElement.scrollTop
                const newCdWidth = cdWidth - srcollTop
                //mỗi lần scroll là ảnh thay đổi theo 
                //khi kéo tới kích thước ấm thì k thực thi newCdwidth vào cd bởi vì vô lý ==> có hiện hình chút ét
                cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
                // HÔNG HIỂU LUN , làm mờ theo sự kiện sroll
                cd.style.opacity = newCdWidth / cdWidth
        } 
        const _this = this
        //xử lý khi play 
        playBtn.onclick =function(){
            //nếu dùng this lất isplay thì k đc vì this bh là playbtn
            if(_this.isPlaying){
                audio.pause()
            } else
            {
                audio.play();
            }
        }
        audio.onplay =function(){
            _this.isPlaying =true
            player.classList.toggle('playing')
            cdThumbAnimate.play()
        }
        audio.onpause=function(){
            _this.isPlaying =false 
            player.classList.toggle('playing')
            cdThumbAnimate.pause()
        }
        //  khi tiến độ bài hát thay đổi ,khi bài hát đang phát
        audio.ontimeupdate =function(){
            //currentTime chạy nhạc theo giây
            //floor: 5.95 => 5
            
               if(audio.duration){
                   // vì audio chạy theo phần trăm => nến suy ra phần trăm vd: 5 tổng 500 thì 5 sẽ là 1%
                   const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                    progress.value =progressPercent;
               }
        }
        //xử lý khi tua bài hát
        //ONCHANGE TRẢ RA GIÁ TRỊ
        progress.onchange =function(e){
            //e.target == progress ,target là hành động click thẻ nào ăn thẻ đó
            //currentTime là time hiện tại của bài hát 
            // ví dụ  tổng bài hát là 200s ,% của progress là 50% để progress thành giấy thì lấy 200/100 *50
             const seekTime = e.target.value / 100 * audio.duration
             //==> thì sẽ chay ở vị trí 50 chạy tiếp 
             //onchange bắt sự thay đổi thay đổi thực sự nằm ở audio bài hát
             audio.currentTime = seekTime;
        }  
        nextBtn.onclick =function(){

            if(_this.isRandom){
                _this.randomSong()
                audio.play()
            }else{
                 //chỉ làm nhiệm vụ next nó hk play bài hát
                _this.nextSong()
                //nên pải play nó
                audio.play()
            }
            //nó render lại bài hát thì bài hát hiện tại sẽ được tô màu
            _this.render()
            _this.srollToActiveSong()
           
        }  
        prevBtn.onclick =function(){
            if(_this.isRandom){
                _this.randomSong()
                audio.play()
            }else{
            //chỉ làm nhiệm vụ next nó hk play bài hát
            _this.prevSong()
            //nên pải play nó
            audio.play()
            }
            _this.srollToActiveSong()

        }
        randomBtn.onclick =function(){
           _this.isRandom=!_this.isRandom
        //    **
           _this.setConfig('isRandom',_this.isRandom)
           randomBtn.classList.toggle('active')

        }
        //xử lý lặp lại một song
        repeatBtn.onclick=function(){
            _this.isRepeat=!_this.isRepeat;
            //**/
            _this.setConfig('isRepeat',_this.isRepeat)
            repeatBtn.classList.toggle('active');
        }
       //xử lý next song khi audio ended
       audio.onended =function(){
           if(_this.isRepeat){
                audio.play()
           }else
          nextBtn.click()
       }
       playlist.onclick=function(e){
        // HAY,closset sẽ trả ngay đúng thẻ cha vì closest gán 
        const songNode = e.target.closest('.song:not(.active)')
            if( songNode || e.target.closest('.option')){
                //xử lý khi click vào song
                if(songNode){
                   
                    // LẠI QUÊN QUÊN HOÀI
                    //getAttribute là lấy ra giá trị rồi không cần value
                    //CÁCH 2 : .dataset.index do gán attribute là data-
                    //gán biến lại thành nummber do ban đầu data-index để là chuỗi (XỬ LÝ HAY)
                    _this.currentIndex =Number( songNode.getAttribute('data-index'))
                    _this.loadCurrentSong()
                    audio.play()
                    _this.render()
                    _this.setConfig("index",_this.currentIndex)
                    _this.setConfig("song",_this.currentSong)


                    
                }
                //xử lý khi click vào option
                if(e.target.closest('.option')){

                }
            }
       }
    },

    defineProperties: function(){
        //định nghĩa get , trả ra giá trị đầu tiên của song 
        //currentSong : song[0]
        //thêm thuộc tính
        Object.defineProperty(this,'currentSong',{
            get:function(){
                    return this.songs[this.currentIndex]
            }
        })
       
       
    },

    loadCurrentSong:function(){
        
        heading.textContent =this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path

    },
    // **
    loadConfig:function(){
        this.isRandom=this.config.isRandom
        this.isRepeat=this.config.isRepeat
        this.currentIndex= this.config.index
        this.currentSong = this.config.song
    },

    nextSong:function(){
            this.currentIndex++;
            if(this.currentIndex > this.songs.length - 1){
                this.currentIndex = 0;
            }
            //sẽ cập nhật lai thông số gần nhất
            this.loadCurrentSong();
    },

    prevSong:function(){
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1;
        }
        //sẽ cập nhật lai thông số gần nhất
        this.loadCurrentSong();
    },

    randomSong: function(){
        //random PẢI TRỪ Bài hiện tại
        let newIndex
        do{
            // nếu length = 10 thì chỉ lấy 0-9
            newIndex =Math.floor(Math.random()*this.songs.length)
        }while(newIndex === this.currentIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    srollToActiveSong:function(){
        setTimeout(()=>{
          //tự sroll tới thanh bài hả được tô màu ,infor: sroll in view javascript
        $('.song.active').scrollIntoView({
            behavior:'smooth',
            //kéo nhẹ từ từ
            block:'nearest'

    })
            
        },300)
    },
    
    start:function(){
        // gán cấu hình từ config vào ứng dụng
        this.loadConfig()
        //định nghĩa các thuộc tính cho object (mảng)
        this.defineProperties()
        this.handleEvent()
        //tải bài hát đầu tiên vào Ul khi chạy ứng dụng
        this.loadCurrentSong()
        this.render()
        
       
      
        // hiển thị trạng thái ban đầu của btn reppeat và random
        randomBtn.classList.toggle('active',this.isRandom)
        repeatBtn.classList.toggle('active',this.isRepeat)

       
        
    },
}
app.start()

/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play/ pause/ seek
 * 4. CD rotate
 * 5. Next/Prev
 * 6.
 * 7.
 * 8.
 * 9.
 * THÊM CHỨC KHI LOAD LẠI BẬT BÀI HIỆN TẠI ĐANG NGHE 
 */

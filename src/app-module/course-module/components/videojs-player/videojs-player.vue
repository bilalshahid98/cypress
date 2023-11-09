<template src="./videojs-player.html"></template>

<script>
import courseService from "../../services/course-service";
import customStorageService from "../../../app-services/custom-storage-service";
import videoListing from "../../components/video-listing/video-listing";
import ClickOutside from "vue-click-outside";
import toastr from "toastr";
import { isMobile, isTablet } from "mobile-device-detect";
import { createAudioContext } from "../../services/video.service";
import VueSlider from "vue-slider-component";

var moment = require("moment");

var mediaPlayer;
var videoBaseUrl = "";

var seekBar;
var user = {};
var totalDuration = 0;
var currentVideoTime = 0;
var totalPassedTime = 0;
var startTime, endTime;
var obj = {};
var displayed = true;
export default {
  name: "app-videojs-player",
  data() {
    return {
      volume_options: {
        dotSize: 14,
        width: "auto",
        height: 4,
        contained: false,
        direction: "ltr",
        data: null,
        dataLabel: "label",
        dataValue: "value",
        min: 0,
        max: 1,
        interval: 0.1,
        disabled: false,
        clickable: true,
        duration: 0.5,
        adsorb: false,
        lazy: false,
        tooltip: "none",
        tooltipPlacement: "top",
        tooltipFormatter: void 0,
        useKeyboard: false,
        keydownHook: null,
        dragOnClick: false,
        enableCross: true,
        fixed: false,
        minRange: void 0,
        maxRange: void 0,
        order: true,
        marks: false,
        dotOptions: void 0,
        dotAttrs: void 0,
        process: true,
        dotStyle: void 0,
        railStyle: void 0,
        processStyle: void 0,
        tooltipStyle: void 0,
        stepStyle: void 0,
        stepActiveStyle: void 0,
        labelStyle: void 0,
        labelActiveStyle: void 0
      },
      seekBar,
      SeekBarValue: 0,
      volumeValue: 1,
      videoDuration: 0,
      volume_: 1,
      isPaused: false,
      isMute: false,
      isFullScreen: false,
      listShow: false,
      videoHeight: 0,
      qualityDrp: false,
      obj: {},
      videoPointers: [],
      isPageLoading: true,
      stamp: "",
      videoList: false,
      waterMark: false,
      userInfo: "",
      quizAttempted: "1",
      isFirstTime: false,
      remainingTime: 0,
      currentChapter: {},
      qualityLevels: [],
      isVideoLoading: false,
      playBackRates: [2, 1.75, 1.5, 1.25, "Normal", 0.75, 0.5, 0.25],
      isVideoUpdate: true,
      isPlayed: false,
      isClickedFirst: false,
      playRetry: true,
      videoLastTime: 0,
      isTimeValueChangeing: false,
      isResume: false,
      currentPlayBackRate: "Normal",
      currentQualityLevel: 0,
      selectedQualityLevel: "Auto",
      videoEnded: false,
      hideDropRight: false,
      rewatched: false,
      popQuizAttempt: "0",
      videoNameShow: false,
      isMobileOrTablet: isMobile || isTablet,
      userStamp: true,
      vimeoVideoQualities: [],
      isVss: false,
      context: {},
      doubleTap: 0,
      mixPanelStats: {
        'Course_ID': this.currentCourse.id,
        'Course_Name': this.currentCourse.name, 
        'Module_ID': this.selectedModule.id, 
        'Module_Name': this.currentCourse.name, 
        'Chapter_ID': this.selectedChapter ? this.selectedChapter.id : null,
        'Chapter_Name': this.selectedChapter ? this.selectedChapter.name : null,
        'Video_ID': this.selectedVideo.id,
        'Video_Name': this.selectedVideo.name,
      },
      firstPlay: false,
      firstPause: false,
    };
  },
  directives: {
    ClickOutside
  },
  props: [
    "selectedVideo",
    "currentCourse",
    "selectedModule",
    "selectedTrackModule",
    "selectedChapter",
    "coursePurchased",
    "videoLastStat",
    "updateOdooProgress",
    "userData",
    "webviewPlayer"
  ],
  components: {
    "app-video-listing": videoListing,
    "vue-slider": VueSlider
  },
  methods: {
    async initializePlayer() {
      try {
        console.log(this.selectedVideo.vss_id);
        console.log(this.selectedVideo.vssurls);

        if (
          this.selectedVideo.vss_id ||
          (this.selectedVideo.vssurls && this.selectedVideo.vssurls.length > 0)
        ) {
          console.log("in videoooo");
          this.isVss = true;
        }
        console.log(this.isVss);

        videoBaseUrl = process.env.VUE_APP_VIDEO_BASE_URL;
        const videoEle = document.getElementById("player");
        videoEle.crossOrigin = "anonymous";
        // mediaPlayer = await videojs("player");
        mediaPlayer = await videojs("player", {
          children: { loadingSpinner: false }
        });
        let result = createAudioContext(videoEle);
        result.source.connect(result.gain);
        result.gain.connect(result.context.destination);
        result.amplify(6);
        this.context = result;
        // let qualities;
        try {
          this.qualityLevels = mediaPlayer.qualityLevels();
        } catch (error) {
        console.log('Error')
        }
        if (this.isVss) {
          // qualities = qualities.data.videoData.links;
          this.selectedVideo.vssurls = this.selectedVideo.vssurls.sort(
            (a, b) => a.width - b.width
          );
          this.vimeoVideoQualities = [...this.selectedVideo.vssurls];
          this.selectedVideo.vssurls.forEach((ele, i) => {
            this.qualityLevels.addQualityLevel({
              id: ele.public_name + "---" + i,
              width: ele.width,
              height: ele.height,
              bitrate: 250,
              enabled: t => true
            });
          });
        }
        try {
          this.currentQualityLevel = this.qualityLevels?.levels_[0]?.width;
        } catch (error) {
          console.log(error)
        }
        // console.log("qualityLevels: ", this.qualityLevels)

        //qualityLevels.levels_[2].enabled = true;
        // this.qualityLevels.on("addqualitylevel", function(event) {
        //   if (event.qualityLevel.height >= 360) {
        //     event.qualityLevel.enabled = true;
        //   } else {
        //     event.qualityLevel.enabled = false;
        //   }
        // });

        await mediaPlayer.ready(function() {});
        if (this.isVss) {
          console.log("0909090");
          await mediaPlayer.src({
            src: this.selectedVideo.vssurls[0].link,
            // type: "application/dash+xml"
            type: "video/mp4"
          });
        } else {
          console.log(
            videoBaseUrl +
              "/get_video_content?video_url=" +
              this.selectedVideo.url_mpd
          );
          await mediaPlayer.src({
            src: this.selectedVideo.url,
            type: "video/mp4"
          });
        }

        await this.ontimeUpdate();
        // storing ref to this in a const as this got undefined below;
        const thisRef = this;
        var isFirst = true;

        videojs.Hls.xhr.beforeRequest = await function(options) {
          options.headers = options.headers || {};
          if (isFirst) {
            options.headers["X-Requested-With"] = "XMLHttpPlayerRequest";
          } else {
            options.headers["X-Requested-With"] =
              "XMLHttpPlayerRequest-" + options.headers.Range;
          }

          const baseURI = options.uri.split("/");
          if (!isFirst) {
            options.uri = thisRef.isVss
              ? this.selectedVideo.vssurls[0].link
              : videoBaseUrl +
                "/get_video_content?video_url=https://video.nearpeer.org/" +
                baseURI[baseURI.length - 1];
          }
          isFirst = false;
          return options;
        };
        mediaPlayer.on("play", async () => {
          this.isPaused = true;
        });
        mediaPlayer.on("pause", async () => {
          this.isPaused = false;
        });
        mediaPlayer.on("progress", async () => {
          const duration = mediaPlayer.duration();
          const bufferedPercent = mediaPlayer.bufferedPercent() * 100;

          const bufferTime = (duration / 100) * bufferedPercent;
          if (bufferTime > 8) {
            if (this.isClickedFirst) {
              if (this.playRetry) {
                this.playRetry = false;
                mediaPlayer.pause();
                mediaPlayer.play();
                setTimeout(() => {
                  this.playRetry = true;
                  if (mediaPlayer.currentTime() > this.videoLastTime) {
                    this.isClickedFirst = false;
                    this.isResume = false;
                  }
                }, 2000);
              }
            }
          }
        });

        mediaPlayer.on("exitFullWindow", () => {});
        this.closeIt();
        this.isPageLoading = false;
      } catch (error) {
        console.log(error);
        toastr.error(error);
      }
    },
    // updateSlider(value) {
    //   const range = document.querySelector(".range");
    //   const thumb = document.querySelector(".thumb");
    //   const track = document.querySelector(".track-inner");
    //   thumb.style.left = `${value}%`;
    //   thumb.style.transform = `translate(-${value}%, -50%)`;
    //   track.style.width = `${value}%`;
    //   var valToSend = value / 100;
    //   this.changeVolume(valToSend);
    // },
    async doubleTapForward(taps) {
      let currentTime = await mediaPlayer.currentTime();
      let duration = await mediaPlayer.duration();
      setTimeout(() => {
        this.doubleTap = 0;
      }, 300);
      if (this.doubleTap > 1) {
        if (currentTime.toFixed(0) != duration.toFixed(0)) {
          document.getElementById("dblForward").style.opacity = 1;
          document.getElementById("revDiv").style.backgroundColor = "#0000005e";
          document.getElementById("cenDiv").style.backgroundColor = "#0000005e";
          document.getElementById("forDiv").style.backgroundColor = "#0000005e";

          setTimeout(() => {
            document.getElementById("dblForward").style.opacity = 0;
            document.getElementById("revDiv").style.backgroundColor =
              "rgb(0 0 0 / 0%)";
            document.getElementById("cenDiv").style.backgroundColor =
              "rgb(0 0 0 / 0%)";
            document.getElementById("forDiv").style.backgroundColor =
              "rgb(0 0 0 / 0%)";
          }, 800);
          this.skipFwdVideo();
        }
      }
    },
    doubleTapReverse(taps) {
      setTimeout(() => {
        this.doubleTap = 0;
      }, 300);
      if (this.doubleTap > 1) {
        document.getElementById("dblReverse").style.opacity = 1;
        document.getElementById("revDiv").style.backgroundColor = "#0000005e";
        document.getElementById("cenDiv").style.backgroundColor = "#0000005e";
        document.getElementById("forDiv").style.backgroundColor = "#0000005e";
        setTimeout(() => {
          document.getElementById("dblReverse").style.opacity = 0;
          document.getElementById("revDiv").style.backgroundColor =
            "rgb(0 0 0 / 0%)";
          document.getElementById("cenDiv").style.backgroundColor =
            "rgb(0 0 0 / 0%)";
          document.getElementById("forDiv").style.backgroundColor =
            "rgb(0 0 0 / 0%)";
        }, 800);
        this.skipRwdVideo();
      }
    },
    doubleTapCenter() {
      document.getElementById("dblCenter").style.opacity = 1;

      setTimeout(() => {
        document.getElementById("dblCenter").style.opacity = 0;
      }, 800);
      if (this.isPaused) {
        this.pauseVideo();
      } else {
        this.playVideo();
      }
    },
    closeIt() {
      console.log("quality-popup-close");
      this.qualityDrp = false;
      this.hideDropRight = false;
      this.back();
      document.getElementById("quality-tray").style.background =
        "var(--quality-black)";
    },
    controllBarLeave() {
      if (!this.isMobileOrTablet && this.isFullScreen) {
        displayed = false;
        setTimeout(() => {
          this.videoNameShow = false;
          document.getElementById("bottom-bar").style.display = "none";
          document.getElementById("bottom-bar").style.visibility = "hidden";
          document.getElementById("slider_volume").style.visibility = "hidden";
        }, 1500);
      }
    },

    controllBarOver() {
      if (!this.isMobileOrTablet && this.isFullScreen) {
        displayed = true;
        this.videoNameShow = true;
        document.getElementById("bottom-bar").style.display = "flex";
        document.getElementById("bottom-bar").style.visibility = "visible";
        document.getElementById("slider_volume").style.visibility = "visible";
      }
    },
    showControls() {
      if (!this.isFullScreen) {
        this.videoNameShow = true;
        document.getElementById("bottom-bar").style.display = "flex";
        document.getElementById("bottom-bar").style.visibility = "visible";
        document.getElementById("slider_volume").style.visibility = "visible";
      }
    },
    hideControls() {
      if (!this.isFullScreen) {
        setTimeout(() => {
          this.videoNameShow = false;
          document.getElementById("bottom-bar").style.display = "none";
          document.getElementById("bottom-bar").style.visibility = "hidden";
          document.getElementById("slider_volume").style.visibility = "hidden";
        }, 1500);
      }
    },
    showVolumeBar() {
      let vol = document.getElementById("slider_volume");
      vol.style.display = "block";
      vol.style.visibility = "visible";
    },
    openQuality() {
      this.qualityDrp = !this.qualityDrp;
      this.qualityDrp
        ? console.log("quality-popup-open")
        : console.log("quality-popup-close");
      this.hideDropRight = false;
      this.back();
      document.getElementById("quality-tray").style.background =
        "var(--quality-black)";
    },
    back(type) {
      document.getElementById("quality-tray").classList.remove("backAn");

      this.hideDropRight = false;
      try {
        $("#speed-menu").collapse("hide");
        $("#qualtiy-menu").collapse("hide");
      } catch (error) {
        console.log(error)
      }
      
      if (type === "playback" && !this.isMobileOrTablet) {
        document.getElementById("quality-tray").classList.add("backAn");
      }
      document.getElementById("quality-tray").style.background =
        "var(--quality-black)";
    },
    clickSpeedcontrol() {
      this.hideDropRight = true;
      document.getElementById("quality-tray").style.background = "transparent";
      try {
        $("#speed-menu").collapse("toggle");
        $("#qualtiy-menu").collapse("hide");
      } catch (error) {
        console.log(error)
      }
      
    },
    clickQualitycontrol() {
      this.hideDropRight = true;
      document.getElementById("quality-tray").style.background = "transparent";
      try {
        $("#qualtiy-menu").collapse("toggle");
        $("#speed-menu").collapse("hide");
      } catch (error) {
        console.log(error)
      }
      
    },
    async setVideoQuality(val) {
      this.qualityDrp = !this.qualityDrp;
      this.selectedQualityLevel = val.width;
      this.currentQualityLevel = val.width;
      this.back();
      this.setVideoStats();
      let value = this.SeekBarValue;
      // for (var i = 0; i < this.qualityLevels.length; i++) {
      //   let qualityLevel = this.qualityLevels[i];
      //   if (qualityLevel.width >= val) {
      //     qualityLevel.enabled = true;
      //   } else {
      //     qualityLevel.enabled = false;
      //   }
      // }

      this.qualityLevels.on("addqualitylevel", function(event) {
        if (event.qualityLevel.width == val.width) {
          event.qualityLevel.enabled = true;
        } else {
          event.qualityLevel.enabled = false;
        }
      });

      // mediaPlayer.src({
      //   src:
      //     videoBaseUrl +
      //     "/get_video_content?video_url=" +
      //     this.selectedVideo.url_mpd,
      //   type: "application/dash+xml",
      //   res: val.width,
      //   label: val.width
      // });
      if (this.isVss) {
        const url = this.vimeoVideoQualities.find(
          v => v.public_name === val.id.split("---")[0]
        ).link;
        mediaPlayer.src({
          src: url,
          type: "video/mp4",
          res: val.width,
          label: val.width
        });
      } else {
        mediaPlayer.src({
          src: this.selectedVideo.url,
          type: "video/mp4",
          res: val.width,
          label: val.width
        });
      }
      this.SeekBarValue = value;
      const duration = await mediaPlayer.duration();
      var time = duration * (value / 100);
      mediaPlayer.currentTime(time);
      mediaPlayer.play();
      obj.event_type = "change_quality";
      obj.quality_change_to = val.width;
      this.sendVideoStats();
    },
    async skipFwdVideo() {
      this.isFirstTime = false;
      this.isVideoLoading = true;
      this.isVideoUpdate = false;
      this.$store.commit("setTyping", true);
      let currentTime = await mediaPlayer.currentTime();
      if (currentTime + 10 < mediaPlayer.duration()) {
        // await mediaPlayer.pause();
        this.setVideoStats();
        this.endCount();
        let time = currentTime + 10;
        let updatedTimeFwd = (100 / mediaPlayer.duration()) * time;
        // console.log("TIME", time, updatedTimeFwd);
        this.SeekBarValue = updatedTimeFwd;
        await mediaPlayer.currentTime(time);
        // let seekBar = document.getElementById("range");
        // seekBar.value = this.SeekBarValue;
        this.playVideo();
        this.isVideoLoading = false;
        obj.event_type = "forward";
        obj.forward_to_time = mediaPlayer.currentTime();
        obj.forward_sec = 10;
        this.sendVideoStats();
        this.startCount();
        this.isVideoUpdate = true;
      } else {
        // await mediaPlayer.pause();
        this.setVideoStats();
        this.endCount();
        let updatedTimeFwd = 100;
        let time = mediaPlayer.duration();
        // console.log("TIME", time, updatedTimeFwd);
        this.SeekBarValue = updatedTimeFwd;
        await mediaPlayer.currentTime(time);
        // let seekBar = document.getElementById("range");
        // seekBar.value = this.SeekBarValue;
        this.playVideo();

        this.isVideoLoading = false;

        obj.event_type = "forward";
        obj.forward_to_time = mediaPlayer.duration();
        obj.forward_sec = 10;
        this.sendVideoStats();
        this.startCount();
        this.isVideoUpdate = true;
      }
    },
    async skipRwdVideo() {
      this.isFirstTime = false;
      this.isVideoLoading = true;
      this.isVideoUpdate = false;
      this.$store.commit("setTyping", true);
      let currentTime = await mediaPlayer.currentTime();
      if (currentTime - 10 > 0) {
        // await mediaPlayer.pause();
        this.endCount();
        this.setVideoStats();
        let time = currentTime - 10;
        let updatedTimeRwd = (100 / mediaPlayer.duration()) * time;
        this.SeekBarValue = updatedTimeRwd;
        await mediaPlayer.currentTime(time);
        // let seekBar = document.getElementById("range");
        // seekBar.value = this.SeekBarValue;
        await this.playVideo();

        this.isVideoLoading = false;
        obj.event_type = "play";
        obj.reverse_to_time = mediaPlayer.currentTime();
        obj.reverse_sec = 10;
        this.sendVideoStats();
        this.startCount();
        this.isVideoUpdate = true;
      } else {
        // console.log("REVVV");
        // await mediaPlayer.pause();
        this.endCount();
        this.setVideoStats();
        let time = 0;
        let updatedTimeRwd = 0;
        this.SeekBarValue = updatedTimeRwd;
        await mediaPlayer.currentTime(time);
        // let seekBar = document.getElementById("range");
        // seekBar.value = this.SeekBarValue;
        await this.playVideo();

        this.isVideoLoading = false;

        obj.event_type = "play";
        obj.reverse_to_time = 0;
        obj.reverse_sec = 10;
        this.sendVideoStats();
        this.startCount();
        this.isVideoUpdate = true;
      }
    },
    async changeVolume(value) {
      // console.log("VOLUME",value);
      if (value === 0) {
        // this.mute();
      } else {
        this.isMute = false;
      }
      this.setVideoStats();
      // var volumeBar = document.getElementById("volume");
      // volumeBar.value = value;
      mediaPlayer.volume(value);
      let volume = await mediaPlayer.volume();
      this.volume_ = volume;
      obj.event_type = "change_volume";
      obj.volume_changed_to = +volume;
      this.sendVideoStats();
    },
    mute() {
      mixpanel.track(this.webviewPlayer ? "VL_video_mute" : "VL-video-mute", this.mixPanelStats);
      this.isMute = true;
      // this.updateSlider(0);
      this.changeVolume(0);
      this.volume_ = 0;

      // mediaPlayer.volume(0);
    },
    unmute() {
      mixpanel.track(this.webviewPlayer ? "VL_video_unmute" : "VL-video-unmute", this.mixPanelStats);
      this.isMute = false;
      this.volume_ = 1;
      // this.updateSlider(100);
      this.changeVolume(1);

      mediaPlayer.volume(1);
    },
    async updateProgress(event) {
      // console.log("UPDATEEE",event);
      this.isTimeValueChangeing = true;
      this.isFirstTime = false;
      this.isVideoUpdate = false;
      this.isVideoLoading = true;
      this.$store.commit("setTyping", true);
      let value = +event.target.value;
      this.endCount();
      var time = this.videoDuration * (value / 100);
      time = time > 0 ? time : 2;
      await mediaPlayer.currentTime(time);
      // this.SeekBarValue = value;
      this.startCount();
      this.isTimeValueChangeing = false;
      this.isVideoLoading = false;
      // this.isPaused = true;
    },
    async updateSeekbar(check) {
      let variable = check;
      if (variable) {
        this.rewatched = true;
      } else {
        this.rewatched = false;
      }
      this.isTimeValueChangeing = true;
      this.isResume = true;
      setTimeout(() => {
        mediaPlayer.currentTime(3);
        this.isTimeValueChangeing = false;
        this.isResume = false;
      }, 1000);

      // let seekBar = document.getElementById("range");
      // const duration = await mediaPlayer.duration();
      // let time = duration * (seekBar.value / 100);
      // await mediaPlayer.currentTime(time);
    },
    async fullScreen() {
      mixpanel.track(this.webviewPlayer ? "VL_video_full_screen" : "VL-video-full-screen", this.mixPanelStats);
      let div = document.getElementById("player_");
      // let videoHeight = div.clientHeight;
      if (div.requestFullscreen) {
        div.requestFullscreen();
      } else if (div.mozRequestFullScreen) {
        div.mozRequestFullScreen(); // Firefox
      } else if (div.webkitRequestFullscreen) {
        div.webkitRequestFullscreen(); // Chrome and Safari
      }
      div.style.height = 100 + "%";
      document.getElementById("player").style.height = 100 + "%";
      // mediaPlayer.requestFullscreen();
      this.listShow = true;
      this.isFullScreen = true;
      this.setVideoStats();
      obj.event_type = "enter_fullscreen";
      this.sendVideoStats();
    },
    async exitFulScreen() {
      mixpanel.track(this.webviewPlayer ? "VL_video_exit_full_screen" : "VL-video-exit-full-screen", this.mixPanelStats);
      mediaPlayer.exitFullscreen();
      this.isFullScreen = false;
      this.disablePlaylist();
      this.setVideoStats();
      obj.event_type = "exit_fullscreen";
      this.sendVideoStats();
    },
    async playVideo() {
      if(!this.firstPlay){
        this.firstPlay = true;
        mixpanel.track(this.webviewPlayer ? "VL_video_play" : "VL-video-play", this.mixPanelStats);
      }
      try {
        this.isPaused = true;
        this.isFirstTime = false;
        mediaPlayer.play();
        this.startCount();
        this.setVideoStats();
        obj.event_type = "play";
        this.isVideoLoading = false;

        this.sendVideoStats();
        this.isClickedFirst = true;
      } catch (error) {
        console.log("PLayer Error:" + error);
      }
    },
    async playVideoOnReady() {
      // console.log("CONTEXT",this.context);
      this.context.context.resume();
      await this.playVideo();
    },
    async pauseVideo() {
      if(!this.firstPause){
        this.firstPause = true;
        mixpanel.track(this.webviewPlayer ? "VL_video_paused" : "VL-video-paused", this.mixPanelStats);
      }
      try {
        this.isPaused = false;
        await mediaPlayer.pause();
        this.endCount();
        this.setVideoStats();
        obj.event_type = "pause";
        this.isVideoLoading = false;

        this.sendVideoStats();
      } catch (error) {
        console.log("PLayer Error:" + error);
      }
    },
    setBubble(range, bubble, maxValue, minValue) {
      const val = range.value;
      const min = range.min ? range.min : minValue;
      const max = range.max ? range.max : maxValue;
      const newVal = Number(((val - min) * 100) / (max - min));
      // bubble.innerHTML = val * 1000;
      bubble.style.right = `calc(${100 - newVal}%)`;
      // bubble.style.left = `calc(${newVal}% + (${8 - newVal * 0.15}px))`;
    },
    async initializations() {
      user = customStorageService.getUser();

      if (!user) {
        if (this.userData) {
          user = this.userData;
        } else {
          user = {
            id: this.$route.query.user_id,
            email: "Mobile Web View"
          };
        }
      }

      if (user) {
        let date = new Date();
        this.userInfo =
          user.email +
          " , " +
          user.phone +
          " , " +
          moment(date).format("MM/DD/YYYY hh:mm");
        let monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December"
        ];
        this.stamp = monthNames[date.getMonth()] + "-" + date.getFullYear();
        this.waterMark = false;
      }
    },
    async ontimeUpdate() {
      let vm = this;
      await mediaPlayer.on("timeupdate", async function(e) {
        vm.isVideoLoading = false;
        vm.$store.commit("setTyping", true);
        vm.isFirstTime = false;
        const duration = await mediaPlayer.duration();
        vm.videoDuration = duration;
        const currentTime = await mediaPlayer.currentTime();
        totalDuration = duration;
        currentVideoTime = currentTime;
        console.log(totalDuration);
        console.log(currentVideoTime);
        let value = (100 / duration) * currentTime;
        if (!vm.isTimeValueChangeing && !vm.isResume) {
          vm.SeekBarValue = value;
        }
        if (vm.rewatched) {
          vm.checkForQuizzes(0);
          vm.rewatched = false;
        } else {
          vm.checkForQuizzes(value);
        }
        await vm.displayVideoTime(duration, currentTime);
        let isEnded = await mediaPlayer.ended();
        vm.videoEnded = isEnded;
        if (isEnded) {
          vm.$store.commit("setTyping", false);
          vm.$emit("showvideofeedback");
          await vm.setVideoStats();
          vm.endCount();
          obj.event_type = "video_completed";
          obj.video_completed = true;
          await vm.sendVideoStats();
          let videos = vm.$store.getters.getVideos;
          let objIndex = videos.findIndex(obj => obj.id == vm.selectedVideo.id);
          videos[objIndex].trackData.watched = true;
          vm.$store.commit("setVideoList", videos);
        }
      });
      await mediaPlayer.on("waiting", async function(e) {
        vm.isVideoLoading = true;
        vm.isVideoUpdate = true;
      });
    },
    startCount() {
      startTime = new Date();
    },
    endCount() {
      endTime = new Date();
      var timeDiff = endTime - startTime; //in ms
      timeDiff /= 1000;
      var seconds = Math.round(timeDiff);
      totalPassedTime = totalPassedTime + seconds;
    },
    async setVideoLastTime() {
      if (user && !this.webviewPlayer) {
        let index = this.selectedTrackModule?.videos?.findIndex(
          trackVideo => trackVideo.id == this.selectedVideo.id
        );
        this.selectedVideo.videoLastStat = (
          (this.selectedTrackModule || {}).videos[index] || {}
        ).videoLastStat
          ? this.selectedTrackModule?.videos[index].videoLastStat
          : 0;
        // this.selectedVideo.lastTime = this.userLastState.lastTime
        // ? this.userLastState.lastTime
        // : 0;
        let videoCurrentTime = 1;
        videoCurrentTime = ((this.selectedVideo || {}).videoLastStat || {})
          .videoTime;
        if (videoCurrentTime > 3 && videoCurrentTime) {
          this.isResume = true;
          this.videoLastTime = videoCurrentTime;
          await mediaPlayer.currentTime(videoCurrentTime);
          let vm = this;
          setTimeout(async () => {
            await vm.displayVideoTime(
              vm.selectedVideo.duration,
              videoCurrentTime
            );
          }, 1000);

          let value = (100 / this.selectedVideo.duration) * videoCurrentTime;
          this.SeekBarValue = value;
          this.isFirstTime = true;
        } else {
          this.isFirstTime = true;
          this.SeekBarValue = 0;
          setTimeout(async () => {
            await this.displayVideoTime(this.selectedVideo.duration, 0);
          }, 1000);
        }
      } else {
        this.isFirstTime = true;
        this.SeekBarValue = 0;
        setTimeout(async () => {
          await this.displayVideoTime(this.selectedVideo.duration, 0);
        }, 1000);
      }
    },
    async displayVideoTime(duration, currentTime) {
      if (duration > 0) {
        let formattedTime = courseService.secondsToHmsForVideo(currentTime);
        let totalDuration = courseService.secondsToHmsForVideo(duration);
        let timeDisplay = formattedTime + " / " + totalDuration;

        if (
          formattedTime &&
          formattedTime != null &&
          document.getElementById("current-time")
        ) {
          document.getElementById("current-time").innerHTML = timeDisplay;
        }
      } else {
        document.getElementById("current-time").innerHTML = "00 / 00";
      }
    },
    async setVideoStats() {
      if (user) {
        let currenVideotTimeStats = currentVideoTime;
        const duration = totalDuration;
        obj = {
          video_time: currenVideotTimeStats,
          event_type: "",
          video_active_watched_time: totalPassedTime ? totalPassedTime : 0,
          video_total_duration: duration ? duration : 0,
          course: {
            id: this.currentCourse.id,
            name: this.currentCourse.name
          },
          module: {
            id: this.selectedModule.id,
            name: this.selectedModule.name
          },
          chapter: {
            id: this.selectedChapter ? this.selectedChapter.id : null,
            name: this.selectedChapter ? this.selectedChapter.name : null
          },
          video: {
            id: this.selectedVideo.id,
            name: this.selectedVideo.name
          },
          user: {
            id: user.id,
            name: user.full_name,
            email: user.email
          },
        };
          
      }
    },
    async sendVideoStats() {
      if (obj.video) {
        obj.live_session_id = this.selectedVideo.live_session_id;
        return await courseService.saveVideoStat(obj).then(res => {
          return res;
        });
      }
    },
    async onClose(event) {
      // event.preventDefault();
      // event.returnValue = "";
      return true
    },
    changeVideo() {
      obj.event_type = "close_video";
      obj.screen_left_reason = "Video Change";
      this.sendVideoStats();
    },
    async showQuiz(point) {
      this.isVideoLoading = true;
      let value = point.percentage;
      this.endCount();
      var time = this.videoDuration * (value / 100);
      await mediaPlayer.currentTime(time);
      this.startCount();
      // this.SeekBarValue= value;
      this.exitFulScreen();
      this.pauseVideo();
      this.$parent.getQuiz(point, true);

      // this.ontimeUpdate();
    },
    checkForQuizzes(perc) {
      this.videoPointers.forEach(point => {
        if (point.percentage) {
          if (
            parseInt(point.percentage) === parseInt(perc) ||
            parseInt(point.percentage) < parseInt(perc)
          ) {
            if (point.data.startsWith("Quiz") && !point.is_passed) {
              this.quizAttempted = "1";
              this.exitFulScreen();
              this.pauseVideo();
              this.showControls();
              this.$parent.getQuiz(point);
            }
            //stop video here and check if quiz is skippable or not
          }
        }
      });
    },
    async loadVideoPointers(selectedVideoId) {
      let data = await courseService.getVideoPoints(selectedVideoId);
      if (data.points.length) {
        this.videoPointers = data.points;
      }
    },
    async handleKeyboard(event) {
      switch (event.keyCode) {
        case 37:
          this.showControls();
          await this.skipRwdVideo();
          this.hideControls();
          break;
        case 39:
          this.showControls();
          await this.skipFwdVideo();
          this.hideControls();
          break;
        case 38:
          await this.showControls();
          await this.showVolumeBar();
          event.preventDefault();
          // let volumeBar = document.getElementById("slider_volume");
          if (this.volume_ >= 0 && this.volume_ < 1) {
            let increasedVol = this.volume_ + 0.1;
            await this.changeVolume(increasedVol);
            this.isMute = false;
          }
          await this.hideControls();

          break;
        case 40:
          await this.showControls();
          await this.showVolumeBar();
          event.preventDefault();
          let volumebar = document.getElementById("slider_volume");

          if (this.volume_ > 0) {
            let decreasedVol = this.volume_ - 0.1;
            await this.changeVolume(decreasedVol);
            this.isMute = false;
          }
          await this.hideControls();
          break;
        case 32:
          let bodyLength = event.target.querySelectorAll("#fb-root").length;
          if (bodyLength > 0) {
            event.preventDefault();
            if (!this.isPaused) {
              this.showControls();
              await this.playVideo();
            } else {
              this.showControls();
              await this.pauseVideo();
            }
          }
          break;

        case 27:
          this.isFullScreen = false;
          this.exitFulScreen();

          break;

        default:
          break;
      }
    },
    async handleVideoClick() {
      // if (!this.isPaused) {
      //   this.showControls();
      //   await this.playVideo();
      // } else {
      //   this.showControls();
      //   await this.pauseVideo();
      // }
      console.log("in m-controles");
      if ((this.isMobileOrTablet || this.reactApp) && this.isFullScreen) {
        if (!displayed) {
          displayed = true;
          this.videoNameShow = true;
          document.getElementById("bottom-bar").style.display = "flex";
          document.getElementById("bottom-bar").style.visibility = "visible";
          document.getElementById("slider_volume").style.visibility = "visible";
        } else {
          displayed = false;
          this.videoNameShow = false;
          document.getElementById("bottom-bar").style.visibility = "hidden";
          document.getElementById("slider_volume").style.visibility = "hidden";
        }
      }
    },
    async setPlayBackRate(playBackRate) {
      this.currentPlayBackRate = playBackRate;
      await mediaPlayer.playbackRate(
        playBackRate === "Normal" ? 1 : playBackRate
      );
      this.back();
    },
    getDataFromVListing(value) {
      this.selectedVideo = value;
    },
    getChapterFromListing(value) {
      this.selectedChapter = value;
      this.currentChapter = this.selectedChapter;
    },
    async handleDblClick() {
      if (!this.reactApp) {
        if (this.isFullScreen) {
          await this.exitFulScreen();
        } else {
          this.isFullScreen = true;
          await this.fullScreen();
        }
      }
    },
    disablePlaylist() {
      this.showControls();
      this.videoList = false;
    },
    enablePlaylist() {
      this.hideControls();
      this.videoList = true;
    }
  },
  created() {
    document.addEventListener(
      "fullscreenchange",
      event => {
        // console.log(mediaPlayer.isFullscreen());
        // console.log(event)
        if (this.isFullScreen) {
          this.disablePlaylist();
        }
      },
      false
    );
    document.addEventListener(
      "mozfullscreenchange",
      () => {
        if (this.isFullScreen) {
          this.disablePlaylist();
        }
      },
      false
    );
    document.addEventListener(
      "webkitfullscreenchange",
      () => {
        if (this.isFullScreen) {
          this.disablePlaylist();
        }
      },
      false
    );
  },
  async mounted() {
    try {
      if (this.webviewPlayer) {
        this.reactApp = true;
      }
      window.addEventListener("beforeunload", this.onClose);
      await this.initializations();
      await this.initializePlayer();
      await this.setVideoLastTime();
      if (!this.webviewPlayer) {
        await this.loadVideoPointers(this.selectedVideo.id);
      }
      this.currentChapter = this.selectedChapter;
      window.addEventListener("keydown", this.handleKeyboard);
      // const range = document.querySelector(".range");
      // range.oninput = e => this.updateSlider(e.target.value);
      // this.updateSlider(100);
    } catch (error) {
      console.log(error);
    }
  },
  beforeUnmount() {
    this.setVideoStats();
    obj.event_type = "close_video";
    obj.screen_left_reason = "Close Tab";
    this.sendVideoStats();
  },
  watch: {
    selectedVideo: async function(newVal, oldVal) {
      this.selectedVideo = newVal;
      this.videoEnded = false;
      this.videoPointers = [];
      this.disablePlaylist();
      this.isVss = false;
      if (
        this.selectedVideo.vss_id ||
        (this.selectedVideo.vssurls && this.selectedVideo.vssurls.length > 0)
      ) {
        this.isVss = true;
      }
      if (this.isVss) {
        // qualities = qualities.data.videoData.links;
        this.selectedVideo.vssurls = this.selectedVideo.vssurls.sort(
          (a, b) => a.width - b.width
        );
        this.vimeoVideoQualities = [...this.selectedVideo.vssurls];
        this.selectedVideo.vssurls.forEach((ele, i) => {
          this.qualityLevels.addQualityLevel({
            id: ele.public_name + "---" + i,
            width: ele.width,
            height: ele.height,
            bitrate: 250,
            enabled: t => true
          });
        });
      }
      this.$emit("toVideoMain", newVal);
      if (mediaPlayer) {
        if (this.isVss) {
          await mediaPlayer.src({
            src: this.selectedVideo.vssurls[0].link,
            // type: "application/dash+xml"
            type: "video/mp4"
          });
        } else {
          await mediaPlayer.src({
            src: this.selectedVideo.url,
            type: "video/mp4"
          });
        }
        this.loadVideoPointers(newVal.id);
        this.endCount();
        setTimeout(() => {
          this.isFirstTime = true;
        }, 2000);
        totalPassedTime = 0;
        this.startCount();
        this.setVideoStats();
        this.currentPlayBackRate = "Normal";
        await this.setVideoLastTime();
      }
    }
  },
  async beforeDestroy() {
    this.endCount();
    this.setVideoStats();
    obj.event_type = "close_video";
    obj.screen_left_reason = "Close Tab";
    await this.sendVideoStats();
    await mediaPlayer.dispose();
  }
};
</script>

<style src="./videojs-player.css" scoped></style>

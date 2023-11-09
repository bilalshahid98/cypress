<template src="./vimeo-player.html"></template>

<script>
import courseService from "../../services/course-service";
import customStorageService from "../../../app-services/custom-storage-service";
import videoListing from "../../components/video-listing/video-listing";
import Player from "@vimeo/player";
import ClickOutside from "vue-click-outside";
import { isMobile, isTablet } from "mobile-device-detect";
import VueSlider from "vue-slider-component";

var moment = require("moment");

var iframe;
var video;
var player;
var options = {};
var seekBar;
var videoDuration;
var user = {};
var totalPassedTime = 0;
var startTime, endTime;
var obj = {};
var displayed = true;
var hideControlesTimer;

var videoTime;

export default {
  name: "app-vimeo-player",
  props: [
    "selectedVideo",
    "currentCourse",
    "selectedModule",
    "selectedTrackModule",
    "selectedChapter",
    "coursePurchased",
    "videoLastStat",
    "updateOdooProgress",
    "webviewPlayer",
    "userData"
  ],
  components: {
    "app-video-listing": videoListing,
    "vue-slider": VueSlider
  },
  directives: {
    ClickOutside
  },
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
      video,
      seekBar,
      SeekBarValue: 0,
      videoDuration: 0,
      currentSec: 0,
      volume_: 1,
      isPaused: false,
      isMute: false,
      isFullScreen: false,
      videoHeight: 0,
      qualityDrp: false,
      obj: {},
      qualities: [],
      isPageLoading: true,
      stamp: "",
      waterMark: false,
      userInfo: "",
      userLastState: {},
      videoList: false,
      videoPointers: [],
      quizAttempted: "1",
      isFirstTime: false,
      remainingTime: 0,
      currentChapter: {},
      isVideoLoading: false,
      playBackRates: [2, 1.75, 1.5, 1.25, "Normal", 0.75, 0.5, 0.25],
      isVideoUpdate: true,
      videoEnded: false,
      bufferInterval: null,
      showQualityMenu: false,
      currentPlayBackRate: "Normal",
      currentQualityLevel: 0,
      selectedQualityLevel: "Auto",
      hideDropRight: false,
      videoNameShow: false,
      isMobileOrTablet: isMobile || isTablet,
      userStamp: true,
      reactApp: false,
      isTimeValueChangeing: false,
      doubleTap: 0,
      vimeoSeekBar: "",
      baseVol: 0,
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
  methods: {
    // async updateSlider(value) {
    //   console.log("in upodate slider");
    //   const range = document.querySelector(".range");
    //   const thumb = document.querySelector(".thumb");
    //   const track = document.querySelector(".track-inner");
    //   thumb.style.left = `${value}%`;
    //   thumb.style.transform = `translate(-${value}%, -50%)`;
    //   track.style.width = `${value}%`;
    //   var valToSend = value / 100;
    //   // this.changeVolume(valToSend);
    // },

    // range.oninput(e) {
    //   updateSlider(e.target.value)

    // }

    calculatePercentage(current, end) {
      let a = (current / end) * 100;
      return a.toFixed();
    },

    async doubleTapForward(taps) {
      let currentTime = await player.getCurrentTime();
      let duration = await player.getDuration();

      console.log("CHECK", currentTime.toFixed(0), duration.toFixed(0));
      setTimeout(() => {
        // this.mobileClickControles();
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
        // this.mobileClickControles();
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
    showControls() {
      if (!this.isMobileOrTablet && !this.isFullScreen) {
        displayed = true;
        this.videoNameShow = true;
        document.getElementById("bottom-bar").style.display = "flex";
        document.getElementById("bottom-bar").style.visibility = "visible";
        // document.getElementById("volume").style.visibility = "visible";
        document.getElementById("slider_volume").style.visibility = "visible";
      }
    },
    // controllBarOver() {
    //   if (this.isFullScreen) {
    //     if (displayed) {
    //       displayed = false;
    //       this.videoNameShow = true;
    //       document.getElementById("bottom-bar").style.visibility = "hidden";
    //       document.getElementById("volume").style.visibility = "hidden";
    //     } else if (!displayed) {
    //       this.showControls();
    //     }
    //   }
    // },

    hideControls() {
      if (!this.isMobileOrTablet && !this.isFullScreen) {
        displayed = false;
        this.videoNameShow = false;
        hideControlesTimer = setTimeout(() => {
          document.getElementById("bottom-bar").style.visibility = "hidden";
          // document.getElementById("volume").style.visibility = "hidden";
          document.getElementById("slider_volume").style.visibility = "hidden";
        }, 1500);
      }
    },
    controllBarLeave() {
      if (!this.isMobileOrTablet && this.isFullScreen) {
        displayed = false;
        hideControlesTimer = setTimeout(() => {
          this.videoNameShow = false;
          document.getElementById("bottom-bar").style.visibility = "hidden";
          // document.getElementById("volume").style.visibility = "hidden";
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
        // document.getElementById("volume").style.visibility = "visible";
        document.getElementById("slider_volume").style.visibility = "visible";
      }
    },

    clickQualitycontrol() {
      this.hideDropRight = true;
      document.getElementById("quality-tray").style.background = "transparent";
      $("#qualtiy-menu").collapse("toggle");
      $("#speed-menu").collapse("hide");
    },

    clickSpeedcontrol() {
      this.hideDropRight = true;
      document.getElementById("quality-tray").style.background = "transparent";
      $("#speed-menu").collapse("toggle");
      $("#qualtiy-menu").collapse("hide");
    },

    mobileClickControles() {
      console.log("in m-controles");
      if ((this.isMobileOrTablet || this.reactApp) && this.isFullScreen) {
        if (!displayed) {
          displayed = true;
          document.getElementById("bottom-bar").style.display = "flex";
          document.getElementById("bottom-bar").style.visibility = "visible";
          // document.getElementById("volume").style.visibility = "visible";
          document.getElementById("slider_volume").style.visibility = "visible";
        } else {
          displayed = false;
          document.getElementById("bottom-bar").style.visibility = "hidden";
          // document.getElementById("volume").style.visibility = "hidden";
          document.getElementById("slider_volume").style.visibility = "hidden";
        }
      }
    },

    showVolumeBar() {
      // let vol = document.getElementById("volume");
      let vol = document.getElementById("slider_volume");
      vol.style.display = "block";
      vol.style.visibility = "visible";
    },
    async setVideoQuality(val) {
      this.currentQualityLevel = val.label;
      this.selectedQualityLevel = val.label;
      this.clickQualitycontrol();
      this.back();
      this.setVideoStats();
      await player.setQuality(val.id);
      options.quality = val.id;
      obj.event_type = "change_quality";
      obj.quality_change_to = val.id;
      this.sendVideoStats();
    },
    async skipFwdVideo() {
      this.isFirstTime = false;
      this.isVideoLoading = true;
      this.$store.commit("setTyping", true);
      let currentTime = await player.getCurrentTime();
      let duration = await player.getDuration();
      if (currentTime + 10 < duration) {
        this.endCount();
        let updatedTimeFwd = (100 / duration) * (currentTime + 10);

        this.SeekBarValue = updatedTimeFwd;

        // this.video.pause();
        let time = await player.setCurrentTime(currentTime + 10);
        if (time) {
          // this.video.play();
          obj.event_type = "forward";
          obj.forward_to_time = time;
          obj.forward_sec = 10;
          this.sendVideoStats();
          this.startCount();
        }
      } else {
        this.endCount();
        let updatedTimeFwd = duration;

        this.SeekBarValue = updatedTimeFwd;

        // this.video.pause();
        let time = await player.setCurrentTime(duration);
        if (time) {
          // this.video.play();
          obj.event_type = "forward";
          obj.forward_to_time = time;
          obj.forward_sec = 10;
          this.sendVideoStats();
          this.startCount();
        }
      }
    },
    async skipRwdVideo() {
      this.isFirstTime = false;
      this.isVideoLoading = true;
      this.$store.commit("setTyping", true);
      let currentTime = await player.getCurrentTime();
      let duration = await player.getDuration();
      if (currentTime - 10 > 0) {
        this.endCount();
        let updatedTimeRwd = (100 / duration) * (currentTime - 10);

        this.SeekBarValue = updatedTimeRwd;
        // this.video.pause();
        let time = await player.setCurrentTime(currentTime - 10);
        if (time) {
          // this.video.play();
          obj.event_type = "play";
          obj.reverse_to_time = time;
          obj.reverse_sec = 10;
          this.sendVideoStats();
          this.startCount();
        }
      } else {
        this.endCount();
        let updatedTimeRwd = 0;

        this.SeekBarValue = updatedTimeRwd;
        // this.video.pause();
        let time = await player.setCurrentTime(updatedTimeRwd);
        if (time) {
          // this.video.play();
          obj.event_type = "play";
          obj.reverse_to_time = time;
          obj.reverse_sec = 10;
          this.sendVideoStats();
          this.startCount();
        }
      }
    },
    async changeVolume(value) {
      // console.log("VOLUME", value,slider);
      if (value === 0) {
        // this.mute();
      } else {
        this.isMute = false;
      }
      // if (this.baseVol === value) {
      //   return;
      // }
      // this.baseVol = value;
      this.volume_ = value;
      this.setVideoStats();
      // var volumeBar = document.getElementById("volume");
      // volumeBar.value = value;
      // let volume = await player.setVolume(volumeBar.value).then();
      let volume = await player.setVolume(value).then();
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

      this.video
        .setVolume(0)
        .then(function(volume) {})
        .catch(function(error) {
          switch (error.name) {
            case "RangeError":
              // The volume is less than 0 or greater than 1
              break;

            default:
              // Some other error occurred
              break;
          }
        });
    },
    unmute() {
      mixpanel.track(this.webviewPlayer ? "VL_video_unmute" : "VL-video-unmute", this.mixPanelStats);
      this.isMute = false;
      this.volume_ = 1;
      this.changeVolume(1);
      // this.updateSlider(100);
      player
        .setVolume(1)
        .then(function(volume) {})
        .catch(function(error) {
          switch (error.name) {
            case "RangeError":
              // The volume is less than 0 or greater than 1
              break;

            default:
              // Some other error occurred
              break;
          }
        });
    },
    async updateProgress(value) {
      this.pauseVideo();
      console.log("CLICKED", value);
      this.vimeoSeekBar = value + "%";
      this.isTimeValueChangeing = true;
      value = +value;

      this.isFirstTime = false;
      this.isVideoLoading = true;
      this.$store.commit("setTyping", true);
      videoDuration = await player.getDuration();
      this.endCount();
      var time = videoDuration * (value / 100);
      const isSetTime = await player.setCurrentTime(time);
      if (isSetTime) {
        this.startCount();
        this.isTimeValueChangeing = true;
      }
      this.playVideo();
    },
    async rewatch() {
      this.updateProgress(0);
    },
    async handleDblClick() {
      if (!this.reactApp) {
        let div = document.getElementById("player");
        // let videoHeight = div.clientHeight;
        if (div.requestFullscreen) {
          div.requestFullscreen();
        } else if (div.mozRequestFullScreen) {
          div.mozRequestFullScreen(); // Firefox
        } else if (div.webkitRequestFullscreen) {
          div.webkitRequestFullscreen(); // Chrome and Safari
        } else {
          player.requestFullscreen();
        }
        // div.style.height = 100 + "%";
        // document.getElementById("player").style.height = 100 + "%";

        // await player.requestFullscreen();
        this.isFullScreen = true;
        this.setVideoStats();
        obj.event_type = "enter_fullscreen";
        this.sendVideoStats();
        this.hideControls();
      }
    },
    async fullScreen() {
      mixpanel.track(this.webviewPlayer ? "VL_video_full_screen" : "VL-video-full-screen", this.mixPanelStats);
      let div = document.getElementById("player");
      // let videoHeight = div.clientHeight;
      if (div.requestFullscreen) {
        div.requestFullscreen();
      } else if (div.mozRequestFullScreen) {
        div.mozRequestFullScreen(); // Firefox
      } else if (div.webkitRequestFullscreen) {
        div.webkitRequestFullscreen(); // Chrome and Safari
      } else {
        player.requestFullscreen();
      }
      // div.style.height = 100 + "%";
      // document.getElementById("player").style.height = 100 + "%";

      // await player.requestFullscreen();
      this.isFullScreen = true;
      this.setVideoStats();
      obj.event_type = "enter_fullscreen";
      this.sendVideoStats();
      this.hideControls();
    },
    async exitFulScreen() {
      mixpanel.track(this.webviewPlayer ? "VL_video_exit_full_screen" : "VL-video-exit-full-screen", this.mixPanelStats);
      if (this.isFullScreen) {
        await player.exitFullscreen();
        this.isFullScreen = false;
        this.setVideoStats();
        obj.event_type = "exit_fullscreen";
        this.sendVideoStats();
      }
    },
    async playVideo() {
      if(!this.firstPlay){
        this.firstPlay = true;
        mixpanel.track(this.webviewPlayer ? "VL_video_play" : "VL-video-play", this.mixPanelStats);
      }
      this.isVideoLoading = true;
      this.removeDefaultControl();
      this.isPaused = true;
      this.isFirstTime = false;
      this.startCount();
      this.setVideoStats();
      obj.event_type = "play";
      await player.play();
      this.startCount();
      this.sendVideoStats();
    },
    async pauseVideo() {
      if(!this.firstPause){
        this.firstPause= true;
        mixpanel.track(this.webviewPlayer ? "VL_video_paused" : "VL-video-paused", this.mixPanelStats);
      }
      console.log("PAUSED");
      this.isPaused = false;
      this.endCount();
      this.setVideoStats();
      obj.event_type = "pause";
      await player.pause();
      this.sendVideoStats();
      this.removeDefaultControl();
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
    async setVideoStats() {
      if (user) {
        let currenVideotTime = this.currentSec;
        const duration = this.videoDuration;
        obj = {
          video_time: currenVideotTime,
          event_type: "",
          video_active_watched_time: totalPassedTime,
          video_total_duration: duration,
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
          }
        };
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
      $("#speed-menu").collapse("hide");
      $("#qualtiy-menu").collapse("hide");
      console.log(type, "TYPEEEE");
      if (type === "playback" && !this.isMobileOrTablet) {
        document.getElementById("quality-tray").classList.add("backAn");
      }
      document.getElementById("quality-tray").style.background =
        "var(--quality-black)";
    },
    exitHandler() {
      if (
        !document.fullscreenElement &&
        !document.webkitIsFullScreen &&
        !document.mozFullScreen &&
        !document.msFullscreenElement
      ) {
        this.isFullScreen = false;
        this.videoList = false;
        clearTimeout(hideControlesTimer);
        this.showControls();
      }
    },
    sendVideoStats() {
      if (obj.video && user) {
        obj.live_session_id = this.selectedVideo.live_session_id;
        courseService.saveVideoStat(obj).then(res => {});
      }
    },
    onClose(event) {
      this.endCount();
      this.setVideoStats();
      obj.event_type = "close_video";
      obj.screen_left_reason = "Close Tab";
      this.sendVideoStats();
      // event.preventDefault();
      // event.returnValue = "";
      return true;
    },
    changeVideo() {
      obj.event_type = "close_video";
      obj.screen_left_reason = "Video Change";
      this.sendVideoStats();
    },
    async loadVideoPointers(selectedVideoId) {
      let points = await courseService.getVideoPoints(selectedVideoId);
      this.videoPointers = points.points;
    },
    removeDefaultControl() {
      setTimeout(() => {
        var vp_controls = document.getElementsByClassName("vp-controls");
        if (vp_controls) {
          vp_controls.forEach(c => {
            c.style.display = "none";
          });
        }
      }, 1000);
    },
    async initializePlayer() {
      user = customStorageService.getUser();
      // this.userLastState = await courseService.getUserLastStat(
      //   this.currentCourse.id,
      //   user.id
      // );
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
      this.isPageLoading = false;
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
        if (!this.webviewPlayer) {
          this.loadVideoPointers(this.selectedVideo.id);
        }
      }

      options = {
        id: this.selectedVideo.vss_id,
        loop: false,
        allowfullscreen: true,
        autoplay: false,
        responsive: true,
        controls: false
      };

      player = new Player("player", options);

      iframe = document.getElementById("player");
      this.video = new Player(iframe);
      this.setVideoLastTime();
      this.removeDefaultControl();
      this.video.on("loaded", async data => {
        const playerRef = document.getElementById("player");
        const child = playerRef.children;
        child[child.length - 1].style.position = "unset";
        this.qualities = await player.getQualities();
        if(this.qualities[1]?.label === "1080p") {
          this.qualities.splice(1, 1);
        }
        this.currentQualityLevel = this.qualities[0]?.id;
        this.bufferInterval = setInterval(async () => {
          const buffered = await this.video.getBuffered();
          if (buffered.length > 0) {
            buffered.forEach(buffer => {
              if (this.currentSec > buffer[0] && this.currentSec < buffer[1]) {
                document.getElementById("bufferbar").style.width =
                  (buffer[1] / this.videoDuration) * 100 + "%";
              }
            });
          }
        }, 1000);
      });
      this.video.on("timeupdate", async data => {
        this.videoDuration = data.duration;
        this.currentSec = data.seconds;
        this.$store.commit("setTyping", true);
        this.isVideoLoading = false;

        this.isFirstTime = false;

        let formattedTime = courseService.secondsToHmsForVideo(data.seconds);
        let totalDuration = courseService.secondsToHmsForVideo(
          this.videoDuration
        );
        let timeDisplay = formattedTime + " / " + totalDuration;
        document.getElementById("current-time")
          ? (document.getElementById("current-time").innerHTML = timeDisplay)
          : "";
        // this.SeekBarValue = data.percent * 100;
        document.getElementById("range").value = data.percent * 100;
        document.getElementById("sickbar").style.width =
          data.percent * 100 + "%";

        var video = new Player(iframe);
        video.getEnded().then(isEnded => {
          this.videoEnded = isEnded;
          if (isEnded) {
            document.getElementById("range").value = data.percent * 100;
            setTimeout(() => {
              document.getElementById("range").value = data.percent * 100;
            }, 150);
            console.log("in end 3");
            this.$emit("showvideofeedback");
            this.setVideoStats();
            this.endCount();
            obj.event_type = "video_completed";
            obj.video_completed = true;
            this.sendVideoStats();
            this.$store.commit("setTyping", false);

            let videos = this.$store.getters.getVideos;
            let objIndex = videos.findIndex(
              obj => obj.id == this.selectedVideo.id
            );
            videos[objIndex].trackData.watched = true;
            this.$store.commit("setVideoList", videos);
          }
        });
        this.checkForQuizzes(data.percent * 100);
      });

      this.video.on("play", data => {
        this.isPaused = true;
      });
      this.video.on("pause", data => {
        this.isPaused = false;
      });
      this.closeIt();
      // await this.updateSlider(100);
    },
    async showQuiz(point) {
      this.isVideoLoading = true;
      let value = point.percentage;
      this.endCount();
      var time = this.videoDuration * (value / 100);
      await player.setCurrentTime(time);
      this.startCount();
      this.exitFulScreen();
      this.pauseVideo();
      this.$parent.getQuiz(point, true);

      // this.ontimeUpdate();
    },
    checkForQuizzes(perc) {
      if (this.videoPointers && this.videoPointers.length > 0) {
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
      }
    },
    async setPlayBackRate(playBackRate) {
      this.clickSpeedcontrol();
      this.back();
      this.currentPlayBackRate = playBackRate;
      await player.setPlaybackRate(
        playBackRate === "Normal" ? 1 : playBackRate
      );
    },

    async setVideoLastTime() {
      this.SeekBarValue = 0;
      this.isFirstTime = true;
      if ((this.selectedVideo || {}).trackData) {
        this.seekBar = document.getElementById("range");
        if (
          (((this.selectedVideo || {}).trackData || {}).videoLastStat || {})
            .videoTime > 0
        ) {
          const currentVideoTime = await player.setCurrentTime(
            this.selectedVideo.trackData.videoLastStat.videoTime
          );
          const duration = await player.getDuration();
          let value = (100 / duration) * currentVideoTime;
          this.seekBar.value = value;
          this.SeekBarValue = value;

          this.isFirstTime = true;
          document.getElementById("sickbar").style.width = value + "%";
        }
        setTimeout(() => {
          this.showControls();
        }, 1000);
      } else {
        if (!this.webviewPlayer) {
          setTimeout(() => {
            this.setVideoLastTime();
          }, 1000);
        } else {
          setTimeout(() => {
            this.showControls();
          }, 1000);
          if (this.videoLastStat) {
            this.seekBar = document.getElementById("range");
            const currentVideoTime = await player.setCurrentTime(
              this.videoLastStat.videoTime
            );
            const duration = await player.getDuration();
            let value = (100 / duration) * currentVideoTime;
            this.seekBar.value = value;
            this.SeekBarValue = value;

            this.isFirstTime = true;
            document.getElementById("sickbar").style.width = value + "%";
          }
        }
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
          // let volumeBar = document.getElementById("volume");
          if (thos.volume_ < 1) {
            let increasedVol = this.volume_ + 0.1;
            await this.changeVolume(increasedVol);
          }
          await this.hideControls();

          break;
        case 40:
          await this.showControls();
          await this.showVolumeBar();
          // let volumebar = document.getElementById("volume");

          if (this.volume_ > 0) {
            let decreasedVol = this.volume_ - 0.1;
            await this.changeVolume(decreasedVol);
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

        default:
          break;
      }
    },
    async handleVideoClick() {
      if (!this.isPaused) {
        this.showControls();
        await this.playVideo();
      } else {
        this.showControls();
        await this.pauseVideo();
      }
    },
    getDataFromVListing(value) {
      this.selectedVideo = value;
    },
    getChapterFromListing(value) {
      this.selectedChapter = value;
    },
    mobileWebviewEventHandler(message) {
      if (message.data.message.includes("close-video")) {
        this.pauseVideo();
        this.setVideoStats();
        obj.event_type = "close_video";
        obj.screen_left_reason = "Close Tab";
        this.sendVideoStats();
      }
    }
  },
  created() {
    document.addEventListener("keydown", this.handleKeyboard);
    document.addEventListener("fullscreenchange", this.exitHandler);
    document.addEventListener("mozfullscreenchange", this.exitHandler);
    document.addEventListener("webkitfullscreenchange", this.exitHandler);

    // range.oninput = (e) => console.log(e,"mmmm");this.updateSlider(e.target.value);
  },
  async mounted() {
    if (!this.isMobileOrTablet && !this.isFullScreen) {
      document.getElementById("bottom-bar").style.visibility = "hidden";
      document.getElementById("slider_volume").style.visibility = "hidden";
    }
    window.addEventListener("beforeunload", this.onClose);
    await this.initializePlayer();
    this.$store.commit("setTyping", false);
    let userAgent = navigator.userAgent;

    if (userAgent.includes("React-Native-NP") || this.webviewPlayer) {
      this.reactApp = true;
    }
    this.vimeoSeekBar = document.getElementById("sickbar").style.width;
    // var range = document.querySelector(".range");
    // range.oninput = (e) => console.log(e, "mmmm");
    //  await this.updateSlider(e.target.value);

    // this.updateSlider(100);
    document.addEventListener("message", this.mobileWebviewEventHandler); ///DONOT REMOVE THIS
  },
  beforeUnmount() {
    this.setVideoStats();
    obj.event_type = "close_video";
    obj.screen_left_reason = "Close Tab";
    this.sendVideoStats();
  },
  watch: {
    selectedVideo: async function(newVal, oldVal) {
      if (!this.isMobileOrTablet && !this.isFullScreen) {
        document.getElementById("bottom-bar").style.visibility = "hidden";
        document.getElementById("slider_volume").style.visibility = "hidden";
      }
      this.$emit("toVideoMain", newVal);
      this.videoEnded = false;
      this.videoPointers = [];
      await player.loadVideo(newVal.vss_id);
      await this.setVideoLastTime();
      this.qualities = await player.getQualities();
      if(this.qualities[1]?.label === "1080p") {
        this.qualities.splice(1, 1);
      }
      this.loadVideoPointers(newVal.id);
      this.endCount();
      setTimeout(() => {
        this.isFirstTime = true;
      }, 2000);
      totalPassedTime = 0;
      this.SeekBarValue = 0;
      document.getElementById("bufferbar").style.width = 0;
      this.currentPlayBackRate = "Normal";
      await this.playVideo();
      this.$store.commit("setTyping", true);
    }
  },
  async beforeDestroy() {
    this.endCount();
    this.setVideoStats();
    obj.event_type = "close_video";
    obj.screen_left_reason = "Close Tab";
    this.sendVideoStats();
    await player.destroy();
  }
};
</script>

<style src="./vimeo-player.css" scoped></style>

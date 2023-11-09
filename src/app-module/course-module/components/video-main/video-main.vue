<template src="./video-main.html"></template>

<script>
import { eventBus } from "../../../../main";
import daqQuiz from "./../daq-quiz/daq-quiz.vue";
import videojsPlayer from "./../videojs-player/videojs-player";
import vimeoPlayer from "./../vimeo-player/vimeo-player";
import PdfViewer from "./../pdf-viewer/pdf-viewer";
import comments from "./../comments/comments";
import mobileComments from "./../mobile-comments/mobile-comments.vue";
import videoListing from "./../video-listing/video-listing";
import courseService from "../../services/course-service";
import customStorageService from "../../../app-services/custom-storage-service";
import popUpQuiz from "../pop-up-quiz/pop-up-quiz";
import VueInstagram from "vue-instagram";
import quizService from "../../../quiz-module/services/quiz-service";
import toastr from "toastr";
import ClickOutside from "vue-click-outside";
import {
  isMobile,
  isTablet,
  isFirefox,
  browserName
} from "mobile-device-detect";
import AccessDeniedPopup from "../../components/access-denied-popup/access-denied-popup";
import appService from "../../../app-services/app-service";
import breadCrumns from "../../../shared-module/components/bread-crumbs/bread-crumbs";
import VueApexCharts from "vue-apexcharts";

let daqCompleted = false;
let daqStarted = false;
var popUp = false;
var share = false;
var moreOptions = false;
var sideMenuOptions = false;

/* eslint-disable no-useless-escape */
var Base64 = {
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  encode: function(input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = Base64._utf8_encode(input);

    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output =
        output +
        this._keyStr.charAt(enc1) +
        this._keyStr.charAt(enc2) +
        this._keyStr.charAt(enc3) +
        this._keyStr.charAt(enc4);
    }

    return output;
  },

  decode: function(input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {
      enc1 = this._keyStr.indexOf(input.charAt(i++));
      enc2 = this._keyStr.indexOf(input.charAt(i++));
      enc3 = this._keyStr.indexOf(input.charAt(i++));
      enc4 = this._keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);

      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }
    }

    output = Base64._utf8_decode(output);

    return output;
  },

  _utf8_encode: function(string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }

    return utftext;
  },

  _utf8_decode: function(utftext) {
    var string = "";
    var i = 0;
    var c1;
    var c2;
    var c3;
    var c = (c1 = c2 = 0);

    while (i < utftext.length) {
      c = utftext.charCodeAt(i);

      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if (c > 191 && c < 224) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(
          ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
        );
        i += 3;
      }
    }

    return string;
  }
};

export default {
  name: "app-video-main",
  directives: {
    ClickOutside
  },
  methods: {
    closePopupQuiz(event) {
      this.popQuizLoader = false;
      this.$store.commit("setTyping", true);
      this.popUp = false;
      if (event.isPassed) {
        this.isPassedCurrent = event.isPassed;
        //call that method here with stating point 0
      }
      if (event.rewatch) {
        if (this.$refs.videojs) this.$refs.videojs.updateSeekbar(true);
        if (this.$refs.vimeojs) this.$refs.vimeojs.rewatch();
      }
      if (this.$refs.vimeojs) {
        if ((event.isPassed || event.isSkipable) && event.session) {
          const index = this.$refs.vimeojs.videoPointers.findIndex(
            p => p.link_text === event.session._id
          );
          if (index >= 0)
            this.$refs.vimeojs.videoPointers[index].is_passed = true;
        }
        this.$refs.vimeojs.quizAttempted = "2";
        this.$refs.vimeojs.playVideo();
      }
      if (this.$refs.videojs) {
        if ((event.isPassed || event.isSkipable) && event.session) {
          const index = this.$refs.videojs.videoPointers.findIndex(
            p => p.link_text === event.session._id
          );
          if (index >= 0)
            this.$refs.videojs.videoPointers[index].is_passed = true;
        }
        this.$refs.videojs.quizAttempted = "2";
        this.$refs.videojs.playVideo();
      }
    },
    handleCommentsPreview(check) {
      if (!check) {
        this.hideOtherInfo = true;
      } else {
        this.hideOtherInfo = false;
      }

      // var height = document.getElementById("video-center").offsetHeight;
      // const vh = Math.max(height || 0, window.innerHeight || 0);
      // var fixedComment = vh - height;
      // this.heightFinal = fixedComment;
      this.heightFinal = window.innerHeight;
    },
    vh(v) {
      var h = Math.max(
        document.getElementById("mobile-view-video-main").clientHeight,
        window.innerHeight || 0
      );
      return (v * h) / 100;
    },
    disabledDownload() {
      if (this.toastrShown === 0) {
        toastr.error(
          this.downloadErrorMessage
            ? this.downloadErrorMessage
            : "This video cannot be downloaded."
        );
        this.toastrShown = 1;
      }
      //  else {
      //   setTimeout(() => {
      //     // toastr.error("This video cannot be downloaded.");
      //     this.toastrShown = 0;
      //   }, 10000);
      // }
    },

    getDataFromChildren(value) {
      this.daq = false;
      if (this.reactApp) {
        console.log("videoChanged"); ///DONOT REMOVE THIS CONSOLE
        this.toastrShown = 0;
      }
      this.selectedVideo = value;
    },
    selectDaq() {
      this.daq = true;
      this.crumbs.pop();
    },
    getCurrentMod(value) {
      this.selectedModule = value;
    },
    mouseOver() {
      let element = document.getElementById("bread-crumb");
      element.style.opacity = 1;
      var inWidth = window.innerWidth;
      if (inWidth > 600) {
        setTimeout(() => {
          element.style.opacity = 0;
        }, 100);
      }
    },
    getChapterFromListing(value) {
      this.selectedChapter = value;
    },
    hideShareBox() {
      this.share = false;
    },
    showShareBox() {
      this.share = !this.share;
    },
    showOptionsBox() {
      this.moreOptions = !this.moreOptions;
    },
    hideOptionsBox() {
      this.moreOptions = false;
    },
    sideMenu() {
      var side = document.getElementById("nav-menu");
      if (this.sideMenuOptions == false) {
        this.sideMenuOptions = true;
        side.classList.add("side-menu");
        side.style.display = "block";
      } else if (this.sideMenuOptions == true) {
        this.sideMenuOptions = false;
        side.style.display = "none";
        side.classList.remove("side-menu");
      }
    },
    async getSelectedCourse() {
      this.selectedCourseIndex = customStorageService.getCourseIndexUrl();
      if (this.$route.query && this.$route.query.courseIndexUrl) {
        this.selectedCourseIndex = this.$route.query.courseIndexUrl;
      }

      const data = await courseService.getAllModulesData(
        this.selectedCourseIndex,
        customStorageService.getUser().id,
        this.$route.params.moduleNo
      );
      

      if (this.crumbs.length === 0) {
        const course = data.data.course.courseData;
        const flag = customStorageService.getBreadcrumbFlag();

        if (flag === "true") {
          this.crumbs.push({
            name: "Nearpeer.org",
            url: process.env.VUE_APP_FRONTEND_BASE_URL + "/" + course.index_url,
            imageurl: "---"
          });
          customStorageService.setBreadcrumbFlag("false");
        } else {
          this.crumbs.push({
            name: "Nearpeer.org",
            url: "/course/course-landing",
            imageurl: "---"
          });
        }
        this.crumbs.push({
          name: course.name,
          url:
            "/course/course-detail" + "/" + course.index_url + "/" + course.id
        });

        if(!this.daq) {
          this.crumbs.push({
            name: this.selectedVideo.name,
            url: this.$route.fullPath
          });
        }
      }
      return data;
    },
    daqQuizLoaded(quiz) {
      this.crumbs.push({
        name: quiz.name,
        url: this.$route.fullPath
      });
    },
    async reactVideo(currentVideo) {
      let usersArr = [];
      this.disableReact = true;
      let reactionObj = {};
      usersArr = currentVideo.reaction ? currentVideo.reaction.users : [];
      let userExists = usersArr.filter(u => u.id == this.user.id);
      if (userExists.length == 0) {
        if (currentVideo.reaction && currentVideo.reaction != null) {
          usersArr.push(this.user);
          let currentVideoLikeCount = currentVideo.reaction.count + 1;
          reactionObj = {
            type: "like",
            users: usersArr,
            count: currentVideoLikeCount
          };
        } else {
          usersArr.push(this.user);
          reactionObj = {
            type: "like",
            users: usersArr,
            count: 1
          };
        }
        let obj = {
          video_id: currentVideo.id,
          reaction: reactionObj
        };
        if (this.$route.params.notes) {
          obj.notes_id = this.$route.params.notes;
        }
        this.selectedVideo.reaction = reactionObj;
        this.checkIfUserExistsInReaction();
        let reacted = await courseService.reactVideo(obj);
        this.selectedVideo.reaction = reacted.updatedVideo[0]
          ? reacted.updatedVideo[0].reaction
          : {};
        this.disableReact = false;
      }
    },
    async revertReactVideo(currentVideo) {
      let usersArr = [];
      this.disableReact = true;

      let reactionObj = {};
      usersArr = currentVideo.reaction.users;
      let userExists = usersArr.filter(u => u.id == this.user.id);
      if (userExists.length != 0 && userExists.length == 1) {
        usersArr = usersArr.filter(u => u.id != this.user.id);
        let currentVideoLikeCount = currentVideo.reaction.count - 1;
        reactionObj = {
          type: "like",
          users: usersArr,
          count: currentVideoLikeCount
        };
        let obj = {
          video_id: currentVideo.id,
          reaction: reactionObj,
          user_id: this.user.id
        };
        if (this.$route.params.notes) {
          obj.notes_id = this.$route.params.notes;
        }
        this.selectedVideo.reaction = reactionObj;
        this.checkIfUserExistsInReaction();
        let reacted = await courseService.reactVideo(obj);
        this.selectedVideo.reaction = reacted.updatedVideo[0]
          ? reacted.updatedVideo[0].reaction
          : {};
        this.disableReact = false;
      }
    },
    async getCurrentCourse() {
      this.user = customStorageService.getUser();
      this.currentUrl =
        process.env.VUE_APP_REDIRCT_URL + window.location.pathname;
      // console.log(this.$route.fullPath ,"CHECK");
      this.currentUrlLMS = process.env.VUE_APP_LMS_HOME + this.$route.fullPath;
      this.currentUser = this.user;
      let mods = await this.getSelectedCourse();
      if (mods?.data?.message === "UNAUTHORIZED_SESSION") {
        return this.$store.commit("setDevToolOpened", true);
      }
      this.niche = mods?.data?.course?.courseData?.faculty;
      this.currentCourse = mods?.data?.course?.courseData;
      if (this.reactApp) {
        console.log(
          "modulePageUrl" +
            "/course/course-detail/" +
            this.selectedCourseIndex +
            "/" +
            (this.currentCourse || {}).id
        );
      }
      this.allModules = mods?.data?.course?.courseData?.modules;
      this.coursePurchased = mods?.data?.course?.coursePurchased;
      this.selectedModule = ((this.currentCourse || {}).modules || []).find(
        mod => mod.index_url == this.$route.params.moduleIndexUrl
      );

      if (this.niche === "MDCAT") {
        if (this.currentCourse.name === "MDCAT PHYSICS") {
          this.customDescription =
            "Such as gravity pulls everything towards itself, Sir Mansoor Farooqi will teach you the tips and tricks that will help you score maximum marks for yourself and hence, enable you to be the next topper.The visual representations and simulations used in the course will enhance your learning, creativity, and innovation. Eventually, enabling you to think outside of the box.The smart tricks will give you the advantage to tackle the most difficult portion of physics, the numerical, without the use of calculators.";
        } else if (this.currentCourse.name === "MDCAT BIOLOGY") {
          this.customDescription =
            " You cannot understand life, without understanding Biology. Learn how life started with a single cell organism in a conceptually effortless way from Sir Shahid Subhani.Sir Shahid, being an expert in the field with 14 years of experiences will teach you the important tips and tricks to help you tackle challenging MCQs of MDCAT, efficiently andtimely.";
        } else if (this.currentCourse.name === "MDCAT CHEMISTRY") {
          this.customDescription =
            "Learn complex chemical reactions in a simple conceptual way from Sir Habib Rafique having 23 years of experience and get in the league of MDCAT toppers.Sir Habib Rafiquq will aid you in grasping challenging concepts of organic and inorganic and strengthen your understanding through examples from real life.Most importantly, your habit of cramming would be colored with concepts and sublime pneumonic that will provide you with an effective way to solve MCQs.";
        } else if (this.currentCourse.name === "MDCAT ENGLISH") {
          this.customDescription =
            "From subject-verb agreement to parallelism to learning-rich vocabulary, it is now made easy and will ensure you 190+ marks and eventually help you ace MDCAT.Tanveer Ahmed, your English instructor, with 8 years of teaching experience will make learning vocabulary and English grammar trouble-free while building upon your skills through practicing quizzes and past papers. So, to ensure that you not only ace your MDCAT but also develop strong English language skills.";
        } else if (this.currentCourse.name === "MDCAT ENGLISH") {
          this.customDescription =
            "Ace your NUMS and FMDC medical entry test with the best faculty and ensure your seat in the top army medical college. ";
        } else {
          this.customDescription = this.selectedVideo.description;
        }
      } else if (this.niche === "Fsc") {
        this.customDescription =
          "Wow! Amazing Lecture Series.Prepare your FSc online with the best faculty in town and be the next topper of the board exams. ";
      } else if (this.niche === "CSS Online Preparation") {
        this.customDescription =
          "Best curated lecture series! Literally in awe.Nearpeer is the best platform to crack the CSS exam. If you want to qualify for these exams with the highest marks, choose this institute. Nearpeer is the right choice for those who are new to the CSS world and wish to become a CSP Officer.";
      } else if (this.niche === "OA LEVELS") {
        this.customDescription =
          "Perfectly curated lecture series! Literally in awe. Study from industry leaders and get guaranteed A* in your CAIEs. ";
      } else if (this.niche === "LUMS") {
        this.customDescription =
          " Book your seat in the Top Universities of Pakistan by taking SAT from the experienced instructors";
      } else if (this.niche === "CA Final") {
        this.customDescription =
          "Meticulously designed lectures!Be it AFC or CFAP, effortlessly learn easy to challenging concepts and pave your way to Chartered Accountancy.";
      } else {
        this.customDescription = this.selectedVideo.description;
      }

      if ((this.selectedModule || {}).content) {
        if (this.selectedModule.content.content == "chapters") {
          this.chapters = this.selectedModule.content.chapters;

          if (this.$route.params.notes) {
            this.selectedChapter = this.selectedModule.content.chapters.find(
              chapter => {
                return ((chapter || {}).videos || []).find(
                  vid => vid.id == +this.$route.params.notes
                );
              }
            );
          } else {
            this.selectedChapter = this.selectedModule.content.chapters.find(
              chapter => {
                return ((chapter || {}).videos || []).find(
                  vid => vid.id == +this.$route.params.videoId
                );
              }
            );
          }
          if (!this.selectedChapter) {
            this.selectedChapter = {};
          }

          this.videos = (this.selectedChapter || {}).videos;
          this.selectedVideo = ((this.selectedChapter || {}).videos || []).find(
            v => v.id == +this.$route.params.videoId
          );
          if ((this.selectedVideo || {}).allow_download_offline) {
            this.downloadDisabled = false;
            // console.log(
            //   this.selectedVideo,
            //   "VIDEO OBJECT IF",
            //   this.downloadDisabled,
            //   this.downloadingStatus.downloadIcon
            // );
          } else {
            // console.log(this.selectedVideo, "VIDEO OBJECT ELSE");
            this.downloadDisabled = true;
            if (!this.downloadErrorMessage) {
              this.downloadErrorMessage = (
                this.selectedVideo || {}
              ).downloadMessage;
            }
          }
        } else {
          this.selectedChapter = null;
          this.videos = this.selectedModule.content.videos;
          this.selectedVideo = (this.videos || []).find(
            v => v.id == this.$route.params.videoId
          );
          if ((this.selectedVideo || {}).allow_download_offline) {
            this.downloadDisabled = false;
            // console.log(this.selectedVideo, "VIDEO OBJECT IF");
          } else {
            // console.log(this.selectedVideo, "VIDEO OBJECT ELSE");
            this.downloadDisabled = true;
            if (!this.downloadErrorMessage) {
              this.downloadErrorMessage = (
                this.selectedVideo || {}
              ).downloadMessage;
            }
          }
        }
      }
      await this.getCourseProgress();
      this.isPageLoading = false;
    },
    zipAttachments() {
      let video_name = this.selectedVideo.name;
      video_name = video_name.split(" ").join("+");
      const urlLink = Base64.decode(this.selectedVideo.attachments[0].url);
      window.open(urlLink);
    },
    reportVideo() {
      console.log("popup-open");
      this.toReportVideo = true;
      this.$store.commit("setTyping", false);
    },
    reports(val, event) {
      if (event.target.checked === true) {
        this.reportVideoDescArr.push(val);
      } else {
        let ind = this.reportVideoDescArr.indexOf(val);
        let newArr = this.reportVideoDescArr.splice(ind, 1);
      }
    },
    async postReportVideo() {
      if (
        this.reportVideoDesc.length == 0 &&
        this.reportVideoDescArr.length == 0
      ) {
        return toastr.info("Please Specify The Problem.");
      }
      // if (this.reportVideoDesc.length > 0) {
      //   this.reportVideoDescArr.push(this.reportVideoDesc);
      // }
      let reportDesc = {
        report_des_arr: this.reportVideoDescArr
      };
      let obj = {
        video_id: this.selectedVideo.id,
        notes_id: this.$route.query.notes,
        user: this.user.id,
        report_desc: reportDesc,
        report_type: "notes",
        other_Issue: this.reportVideoDesc
      };
      this.moreOptions = !this.moreOptions;
      this.toReportVideo = false;
      console.log("popup-close");
      let reportSent = await courseService.createReport(obj);
      this.$store.commit("setTyping", true);
      if (reportSent.success) {
        toastr.info("Successfully reported");
        this.reportVideoDescArr = [];
        this.reportField = false;
        this.reportVideoDesc = "";
      } else {
        toastr.error("Something went wrong!");
      }
      this.reportVideoDescArr = [];
      this.reportVideoDesc;
    },
    cancelReport() {
      this.toReportVideo = false;
      this.reportField = false;
      this.reportVideoDescArr = [];
      this.reportVideoDesc = "";
    },
    navMenuShadowHandler() {
      var side = document.getElementById("nav-menu");
      this.navMenuShadow = false;
      side.style.display = "none";
    },
    initialView() {
      var inWidth = window.innerWidth;
      customStorageService.setPageName("video");
      if (inWidth > 1140) {
        // customStorageService.setPageName("video");
        var hamburger = document.getElementById("hamburger");
        hamburger?.addEventListener("click", () => {
          this.navMenuShadow = !this.navMenuShadow;
        });
      }
      var side = document.getElementById("nav-menu");
      var body_ = document.getElementById("main-body");
      var videoParent = document.getElementById("video-parent");
      body_?.classList.remove("right-side-responsive");
      ((side || {}).style || {}).display = "none";
      let videoCenter;
      if (inWidth > 1400 && inWidth < 1900) {
        videoCenter = document.getElementById("video-center");
        (videoCenter || {}).style.width = inWidth - 550 + "px";
        (videoCenter || {}).style.height = (inWidth - 550) / 1.81 + "px";
      } else if (inWidth > 1900) {
        videoCenter = document.getElementById("video-center");
        (videoCenter || {}).style.width = "1300px";
        (videoCenter || {}).style.height = 1300 / 1.81 + "px";
      } else if (inWidth > 1200 && inWidth < 1400) {
        videoCenter = document.getElementById("video-center");
        ((videoCenter || {}).style || {}).width = inWidth - 550 + "px";
        ((videoCenter || {}).style || {}).height =
          (inWidth - 550) / 1.61 + "px";
      } else if (inWidth < 600) {
        this.mobileView = true;
        if (document.getElementById("verification")) {
          document.getElementById("verification").style.display = "none";
        }
        console.log('this.daq');
        console.log(this.daq);
        if(this.daq) {
          videoCenter = document.getElementById("video-center");
          console.log('videoCenter');
          console.log(videoCenter);
          ((videoCenter || {}).style || {}).height = "100% !important";
        }
      }
      ((videoParent || {}).style || {}).width = (
        (videoCenter || {}).style || {}
      ).width;
      window.addEventListener("resize", function() {
        var inWidth_ = window.innerWidth;
        if (inWidth_ > 1400 && inWidth_ < 1900) {
          var videoCenter = document.getElementById("video-center");
          (videoCenter || {}).style.width = inWidth_ - 550 + "px";
          (videoCenter || {}).style.height = (inWidth_ - 550) / 1.81 + "px";
        } else if (inWidth_ > 1200 && inWidth_ < 1400) {
          videoCenter = document.getElementById("video-center");
          ((videoCenter || {}).style || {}).width = inWidth_ - 550 + "px";
          ((videoCenter || {}).style || {}).height =
            (inWidth_ - 550) / 1.61 + "px";
        } else if (inWidth_ > 1900) {
          videoCenter = document.getElementById("video-center");
          (videoCenter || {}).style.width = "1300px";
          (videoCenter || {}).style.height = 1300 / 1.81 + "px";
        } else if (inWidth_ < 600) {
          this.mobileView = true;
          if (document.getElementById("verification")) {
            document.getElementById("verification").style.display = "none";
          }
        } else if (inWidth_ > 600) {
          this.mobileView = false;
          if (document.getElementById("verification")) {
            document.getElementById("verification").style.display = "flex";
          }
        }
        ((videoParent || {}).style || {}).width = (
          (videoCenter || {}).style || {}
        ).width;
      });
    },
    reatteptQuiz() {
      this.popUp = false;
      this.popUp = true;
    },
    async getQuiz(point, fromClick) {
      try {
        this.popQuizLoader = true;
        if (!this.isQuizChecking || fromClick) {
          this.isQuizChecking = true;
          this.sessionId = point.link_text;
          let response = await quizService.getQuiz(this.sessionId);
          if (response && response.data.data.session) {
            if (point.is_attempt && point.is_passed) {
              this.isPopQuizSkippable = true;
              response.data.data.session.is_skippable = true;
              response.data.data.session.quiz.is_skippable = true;
            }
            if (this.$refs.videojs) {
              this.session = response.data.data.session;
              if (this.$refs.videojs.quizAttempted == "1") {
                this.popQuizLoader = false;
                this.popUp = true;
                this.$refs.videojs.pauseVideo();
                this.$refs.videojs.isFullScreen = false;
                this.isQuizChecking = false;
              } else if (
                !this.session.quiz.is_skippable &&
                !point.is_passed &&
                !this.isPassedCurrent
              ) {
                this.popQuizLoader = false;
                this.popUp = true;
                this.$refs.videojs.pauseVideo();
                this.$refs.videojs.isFullScreen = false;
                this.isQuizChecking = false;
              } else if (fromClick) {
                this.popQuizLoader = false;
                this.popUp = true;
                this.$refs.videojs.pauseVideo();
                this.$refs.videojs.isFullScreen = false;
                this.isQuizChecking = false;
              }

              if (point.is_attempt && this.session.quiz.is_skippable) {
                this.isPopQuizSkippable = true;
                this.popQuizLoader = false;
              } else if (!this.session.quiz.is_skippable && point.is_passed) {
                this.isPopQuizSkippable = true;
                this.popQuizLoader = false;
              }
            } else {
              this.session = response.data.data.session;
              if (this.$refs.vimeojs.quizAttempted == "1") {
                this.popQuizLoader = false;
                this.popUp = true;
                this.$refs.vimeojs.pauseVideo();
                this.$refs.vimeojs.isFullScreen = false;
                this.isQuizChecking = false;
              } else if (
                !this.session.quiz.is_skippable &&
                !point.is_passed &&
                !this.isPassedCurrent
              ) {
                this.popQuizLoader = false;
                this.popUp = true;
                this.$refs.vimeojs.pauseVideo();
                this.$refs.vimeojs.isFullScreen = false;
                this.isQuizChecking = false;
              } else if (fromClick) {
                this.popQuizLoader = false;
                this.popUp = true;
                this.$refs.vimeojs.pauseVideo();
                this.$refs.vimeojs.isFullScreen = false;
                this.isQuizChecking = false;
              }

              if (point.is_attempt && this.session.quiz.is_skippable) {
                this.popQuizLoader = false;
                this.isPopQuizSkippable = true;
              } else if (!this.session.quiz.is_skippable && point.is_passed) {
                this.isPopQuizSkippable = true;
                this.popQuizLoader = false;
              }
            }
          } else {
            this.popQuizLoader = false;
          }
        } else {
          this.popQuizLoader = false;
        }
      } catch (error) {
        this.popQuizLoader = false;
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          toastr.error(error.response.data.message);
        } else {
          toastr.error(error.message);
        }
      }
    },
    async getCourseProgress(toUpdateOdoo) {
      // if (!this.selectedModule) {
      //   return this.$router.push("/landing");
      // }
      let currentCourseProgress = await courseService.getCourseProgress(
        this.selectedModule.course_id,
        this.user.id
      );
      this.selectedTrackModule = (
        (((currentCourseProgress || {}).data || {}).data || {}).modules || []
      ).find(mod => mod.module_id == this.selectedModule.id);
      this.currentCourse.modules.forEach(modInfo => {
        (
          (((currentCourseProgress || {}).data || {}).data || {}).modules || []
        ).forEach(mods => {
          if (modInfo.id == mods.module_id) {
            modInfo.isComingSoon = mods.isComingSoon;
            modInfo.progress = mods.progress;
          }
        });
      });

      if (this.selectedVideo) {
        let index = this.selectedTrackModule?.videos?.findIndex(
          trackVideo => trackVideo.id == this.selectedVideo.id
        );

        const freeModules = this.currentCourse.modules.filter(
          module => module.module_type.free
        ).length;
        let progress = 0;
        this.currentCourse.modules.forEach(module => {
          if (module.module_type.free && module.progress) {
            progress += module.progress;
          }
        });
        progress = progress / freeModules;
        this.freeContentProgress = progress;
        if (
          ((this.selectedTrackModule || {}).videos[index] || {}).videoLastStat
        ) {
          this.videoTimeUpdate = (
            (this.selectedTrackModule || {}).videos[index] || {}
          ).videoLastStat.videoTime;
        }
      }

      // this.freeContentProgress = 0;
      if (toUpdateOdoo) {
        this.updateOdooProgress(false, false, true);
        // courseService.updateLeadForCourseProgress(
        //   this.freeContentProgress || 1,
        //   this.currentCourse.name,
        //   this.currentCourse.id,
        //   this.currentCourse.faculty
        // );
      }
    },
    checkIfUserExistsInReaction() {
      this.userExistsInReaction = false;
      (((this.selectedVideo || {}).reaction || {}).users || []).forEach(
        element => {
          if (this.currentUser.id == element.id) {
            this.userExistsInReaction = true;
          }
        }
      );
    },
    showvideofeedback() {
      this.calculateTracking();
      this.videoFinished = true;
      document.body.style.overflow = "hidden";
      this.$store.commit("setTyping", false);
    },
    userExperience(experience) {
      if (experience == "poor") {
        this.poor = true;
        this.average = false;
        this.good = false;
      } else if (experience == "average") {
        this.average = true;
        this.poor = false;
        this.good = false;
      } else if (experience == "good") {
        this.good = true;
        this.poor = false;
        this.average = false;
      }
      this.data.experience = experience;
    },
    skipFeedback() {
      this.videoFinished = false;
      document.body.style.overflow = "auto";
      this.resetFeadback();
      this.$store.commit("setTyping", true);
    },
    resetFeadback() {
      this.refreshState();
      this.data = {};
    },
    async addFeedback() {
      this.disableBtn = true;
      this.data.id = customStorageService.getUid();
      this.data.recommendation = this.selected;
      this.data.videoid = this.selectedVideo.id;
      this.$store.commit("setTyping", true);
      if (!this.data.experience) {
        toastr.error("Please Select Feedback");
        this.disableBtn = false;
        return;
      }
      let request = await appService.addFeedback({
        user_id: this.data.id,
        feedback: { feedback: this.data },
        type: "video_feedback"
      });
      if (request.success) {
        this.videoFinished = false;
        document.body.style.overflow = "auto";
        this.data.experience = "";
        this.data.suggestion = "";
        this.data = {};
        this.refreshState();

        toastr.success("Feedback successfully added!");
        this.disableBtn = false;
      } else {
        this.videoFinished = false;
        document.body.style.overflow = "auto";
        this.data.experience = "";
        this.data.feature = "";
        this.data.suggestion = "";
        toastr.error("Something went wrong");
        this.refreshState();
      }
    },
    refreshState() {
      this.poor = false;
      this.average = false;
      this.good = false;
    },
    async downloadVideo() {
      window.postMessage("downloadClicked");
      window.parent.postMessage("downloadClickedPost");
      console.log("videoID" + this.selectedVideo.id); ///DONOT REMOVE THIS CONSOLE
      console.log(JSON.stringify(this.currentlyDownloading));
      this.currentlyDownloading.push(this.selectedVideo.id);
      // customStorageService.setVideoDownloading(this.currentlyDownloading);
      console.log("downloadClicked"); ///DONOT REMOVE THIS CONSOLE
      // window.location.href =
      //   process.env.VUE_APP_LMS_HOME + "/downloadApp" + "/";
      // this.selectedVideo.id + "/" + this.user.id;
    },
    setModuleVideos(module) {
      this.allModules = this.allModules.map(modInfo => {
        if (modInfo.id === module.id) {
          modInfo = module;
        }
        return modInfo;
      });
      this.$forceUpdate();
    },
    reactAppStates() {
      var checkDownloading = this.currentlyDownloading.findIndex(
        vid => vid == this.selectedVideo.id
      );
      var checkDownloaded = this.currentlyDownloaded.findIndex(
        cid => cid == this.selectedVideo.id
      );
      console.log(checkDownloading);
      console.log(checkDownloaded);
      if (checkDownloading != -1) {
        // this.downloadingIcon = true;
        // this.downloadIcon = false;
        // this.downloadedIcon = false;

        Object.keys(this.downloadingStatus).forEach(element => {
          console.log(element, "ELEMENT");
          if (element == "downloadingIcon") {
            this.downloadingStatus[element] = true;
          } else {
            this.downloadingStatus[element] = false;
          }
        });

        return null;
      }
      if (checkDownloaded != -1) {
        // this.downloadedIcon = true;
        // this.downloadingIcon = false;
        // this.downloadIcon = false;
        Object.keys(this.downloadingStatus).forEach(element => {
          if (element == "downloadedIcon") {
            this.downloadingStatus[element] = true;
          } else {
            this.downloadingStatus[element] = false;
          }
        });
        return null;
      }
      // this.downloadedIcon = false;
      // this.downloadingIcon = false;
      // this.downloadIcon = true;
      Object.keys(this.downloadingStatus).forEach(element => {
        if (element == "downloadIcon") {
          this.downloadingStatus[element] = true;
        } else {
          this.downloadingStatus[element] = false;
        }
      });
    },
    removeDownloadedFromDownloading() {
      console.log(this.currentlyDownloading);

      var exists = this.currentlyDownloading.findIndex(
        vid => vid == this.selectedVideo.id
      );
      if (exists != -1) {
        var inDownloads = this.currentlyDownloaded.findIndex(
          did => did == this.selectedVideo.id
        );
        if (inDownloads != -1) {
          this.currentlyDownloading.splice(exists, 1);
          // customStorageService.setVideoDownloading(this.currentlyDownloading);
        }
      }
    },
    async handleEvent(message) {
      ///DONOT CHANGE STATES IN THIS FUNCTION
      if (this.reactApp) {
        console.log("DATA");
        console.log(message.data.message);
        if (message.data.message == "downloadStarted") {
          this.reactAppStates();
        } else if (message.data.message == "downloadCompleted") {
          this.removeDownloadedFromDownloading();
          this.reactAppStates();
        } else if (message.data.message.includes("downloadFailed")) {
          var failedId = await message.data.message.split("downloadFailed");
          console.log(failedId);
          console.log(failedId[0]);

          console.log(failedId[1]);
          var idToRemove = this.currentlyDownloading.findIndex(
            vid => vid == failedId[1]
          );
          console.log(idToRemove);

          this.currentlyDownloading.splice(idToRemove, 1);
          // customStorageService.setVideoDownloading(this.currentlyDownloading);
          console.log(this.currentlyDownloading);
          this.removeDownloadedFromDownloading();
          this.reactAppStates();
        } else if (message.data.message.includes("downloadingVideosStatus")) {
          var videoTempObj = await message.data.message.split(
            "downloadingVideosStatus"
          );
          console.log(videoTempObj);
          console.log("test" + JSON.stringify(videoTempObj[1]));
          this.currentlyDownloading = JSON.parse(videoTempObj[1]);
          console.log(JSON.stringify());
        } else if (Array.isArray(message.data.message)) {
          console.log("Objects From RN");
          console.log(JSON.stringify(message.data.message));
          var downloadedVideos = [...message.data.message];
          this.currentlyDownloaded = [...message.data.message];
          console.log(JSON.stringify(downloadedVideos));
          console.log(this.selectedVideo.id);
          this.removeDownloadedFromDownloading();
          this.reactAppStates();
        } else if (message.data.message.downloading) {
          var downloadingArray = message.data.message.downloading;
          console.log(JSON.stringify(downloadingArray) + "DOWNLOAD TEST");
        }
      }
    },
    calculateTracking() {
      courseService.calculateStats(this.currentCourse.id);
    },
    async checkVideoAccesss() {
      const downloadAccessRes = await courseService.checkDownloadAccess();
      if (
        downloadAccessRes &&
        downloadAccessRes.data &&
        !downloadAccessRes.data.allowDownload
      ) {
        // console.log("in here", downloadAccessRes);
        this.downloadDisabled = true;
        this.downloadErrorMessage = downloadAccessRes.data.downloadErrorMessage;
      }
    },
    updateOdooProgress(videObj, state, update) {
      if (state) {
        this.videoTimeUpdate = videObj?.video_time || this.videoTimeUpdate;
      }
      if (update && !this.coursePurchased) {
        courseService.updateLeadForCourseProgress(
          this.freeContentProgress || 1,
          this.currentCourse.name,
          this.currentCourse.id,
          this.currentCourse.faculty,
          {
            videoName: this.selectedVideo.name,
            videoWatched: this.videoTimeUpdate
          }
        );
        // sav
      }
    },
    saveRecommendation(score) {
      // $('.recommend-button-' + status).addClass('bounce-button');
      appService.saveRecommendation({ score, courseId: this.currentCourse.id });
      // setTimeout(() => {
      this.isRecomendationBanner = false;
      // $('.recommend-button-' + status).removeClass('bounce-button');
      // }, 1300)
      toastr.info("Thank you for your feedback!");
    },
    redirectPage(type) {
      this.redirect = false;
      if (type === "cancel") {
        this.$router.push("/course/course-landing");
      } else {
        window.location.href = `${process.env.VUE_APP_REDIRCT_URL}/${this.selectedCourseIndex}?uid=${this.user.id}&token=${this.user.token}`;
      }
    },
    async initialize() {
      if (!this.$store.state.showSecurityError) {
        await this.getCurrentCourse();
      }
      return true;
    },
    selectNotes(notes) {
      this.selectedNotes = notes;
    },
    checkCustomFormToShow() {
      this.$store.state.customForms.forEach(form => {
        if (form && form.config && form.config.length > 0) {
          form.config.forEach(config => {
            if (
              config.tag_id === this.currentCourse.tag_id ||
              config.course_id === this.currentCourse.id
            ) {
              this.$store.commit("setShowCustomForms", form);
            }
          });
        }
      });
    },
    gotoNext() {
      this.daqLeaveConfirmationPopupSubmit = true;
      this.daqLeaveConfirmationPopup = false;
      this.$router.push(this.toRoute.fullPath);
    },
    toggleVideoListing(status) {
      if(this.isMobileOrTablet) {
        this.showVideoListing = status;
      }
    },
    sendDaqEvent(data) {
      if(data.type === 'assignment-completed') {
        daqCompleted = true;
      } else if(data.type === 'assignment-started') {
        daqStarted = true;
      }
      
    }
  },
  data() {
    return {
      currentCourse: {},
      allModules: [],
      videos: [],
      chapters: [],
      selectedVideo: {},
      selectedModule: {},
      selectedTrackModule: {},
      selectedChapter: {},
      currentUser: {},
      coursePurchased: {},
      toReportVideo: false,
      reportVideoDescArr: [],
      reportVideoDesc: "",
      redirect: false,
      popUp,
      share,
      moreOptions,
      sideMenuOptions,
      selectedCourseIndex: "",
      reportField: false,
      currentUrl: "",
      currentUrlLMS: "",
      isPageLoading: true,
      navMenuShadow: false,
      sessionId: "6000059cba42cb166c0bce19",
      quiz: {},
      user: {},
      isPopQuizSkippable: false,
      isQuizChecking: false,
      isPassedCurrent: false,
      popQuizLoader: false,
      userExistsInReaction: false,
      disableReact: false,
      accessPopup: false,
      poor: false,
      average: false,
      good: false,
      videoFinished: false,
      isDesktopApp: false,
      freeContentProgress: 0,
      customDescription: "",
      niche: "",
      isMobileOrTablet: isMobile || isTablet,
      reactApp: false,
      mobileView: false,
      heightFinal: "",
      hideOtherInfo: false,
      downloadErrorMessage: undefined,
      downloadDisabled: false,
      downloadingStatus: {
        downloadIcon: true,
        downloadedIcon: false,
        downloadingIcon: false
      },
      currentlyDownloaded: [],
      currentlyDownloading: [],
      data: {
        experience: "",
        suggestion: ""
      },
      videoTimeUpdate: 0,
      toastrShown: 0,
      disableBtn: false,
      showVideoListing: true,
      isRecomendationBanner: false,
      daqLeaveConfirmationPopup: false,
      daqLeaveConfirmationPopupSubmit: false,
      toRoute: '',
      totalHeight: 0,
      crumbs: [],
      selectedNotes: {},
      videoReports: [
        "Sound Issues",
        "Video Issues",
        "Topic in lecture heading is not covered",
        "Content Improvement",
        "Offensive Content"
      ],
      notesReports: [
        "Notes are irrelevant",
        "Text is not clear",
        "Notes have factual errors"
      ],
      daq: false,
      daqTC:false,
      currentStep: 1,
      daqChartValue: [40],
      daqChartOptions: {
        chart: {
          height: 40,
          type: 'radialBar',
        },
        plotOptions: {
          radialBar: {
            hollow: {
              size: '60%',
            },
            track: {
              show: true,
              background: "#ffffff",
              margin: 0 // margin is in pixels
            },
            dataLabels: {
              showOn: "always",
              name: {
                offsetY: 0,
                show: false,
                color: "#333",
                fontSize: "12px",
                fontWeight: 400
              },
              value: {
                color: "#000",
                fontSize: "14px",
                fontWeight: 700,
                show: true,
                offsetY: 4
              }
            },
          },
        },
        fill:{
              colors: '#007A7B',
              opacity: 0.9,
              type: 'solid',
            },
        stroke: {
            lineCap: "round",
        },
      },
    };
  },
  beforeDestroy() {
    // customStorageService.setVideoDownloading(this.currentlyDownloading);
  },
  destroyed() {
    if (this.reactApp) {
      console.log("exitVideoPage");
    }
    customStorageService.setPageName("main");
    document.getElementById("nav-bar").style.zIndex = "11";
    document.getElementById("nav-menu").style.zIndex = "10";
    if (document.getElementById("verification")) {
      document.getElementById("verification").style.display = "flex";
    }
  },
  async created() {
    window.addEventListener("beforeunload", (e) => {
      e.preventDefault();
      if (this.$refs.videojs) this.$refs.videojs.changeVideo();
      if (this.$refs.vimeojs) this.$refs.vimeojs.changeVideo();
      // this.updateOdooProgress(false, false, true);
      this.calculateTracking;
      return true;
    });
    var listener = document.addEventListener("message", this.handleEvent); ///DONOT REMOVE THIS
    if (this.reactApp) {
      console.log("IN LISTENING EVENT", listener);
      console.log(listener); ///DONOT REMOVE THIS CONSOLE
      this.handleEvent(listener); ///DONOT REMOVE THIS
    }
  },
  beforeRouteUpdate(to, from, next) {
    if(this.daq && !this.daqLeaveConfirmationPopupSubmit && !daqCompleted && daqStarted) {
      this.daqLeaveConfirmationPopup = true;
      this.toRoute = to;
    } else {
      next();
    }
  },
  beforeRouteLeave(to, from, next) {
    if(this.daq && !this.daqLeaveConfirmationPopupSubmit && !daqCompleted && daqStarted) {
      this.daqLeaveConfirmationPopup = true;
      this.toRoute = to;
    } else {
      next();
    }
  },
  watch: {
    $route(to, from) {
      this.currentUrl = "https://velocity.nearpeer.org" + to.fullPath;
      this.$router.go(from);
    },
    "$store.state.showSecurityError": {
      deep: true,
      handler(newVal, oldVal) {
        if (!newVal) {
          location.reload();
        }
      }
    },
    selectedVideo: async function(newVal, oldVal) {
      let currentVideoChapter 
      if(this.selectedVideo && this.selectedVideo.chapter_id){
        let currentChapterId = this.selectedVideo.chapter_id;
        let currentChapters = this.selectedModule.content.chapters;
        if(currentChapters) {
          currentChapters.forEach(chapter => {
            if (chapter.id == currentChapterId) {
              currentVideoChapter = chapter;
            }
          });
        }
      }
      if(this.selectedVideo) {
        mixpanel.track('VL-Video-Page',{
          'Video_ID' : this.selectedVideo.id,
          'Video_Name' : this.selectedVideo.name,
          'Video_Time' : this.videoTimeUpdate,
          'Video_Duration' : this.selectedVideo.duration,
          'Course_Name' : this.currentCourse.name,
          'Module_Name' : this.selectedModule.name,
          'Module_ID' : this.selectedModule.id,
          'Chapter_Name' : currentVideoChapter ? currentVideoChapter.name : null,
          'Chapter_ID' : currentVideoChapter ? currentVideoChapter.id : null,
          'Niche_Name' : this.currentCourse.faculty,
        });
      }
      
      if (!newVal) {
        this.selectedVideo = {};
      }
      if (this.isMobileOrTablet) {
        const browser = browserName.toLowerCase();
        if (
          browser.includes("usbrowser") ||
          browser.includes("us browser") ||
          isFirefox
        ) {
          console.log("donee");
        }
      }
      if (this.$route.query.notes) {
        this.selectedNotes = (this.videos || []).find(
          v => v.id == this.$route.query.notes && v.type === "notes"
        );

        if (
          !this.selectedNotes &&
          this.selectedModule.content &&
          this.selectedModule.content.content === "chapters"
        ) {
          this.selectedNotes = (
            this.selectedModule.content.chapters || []
          ).find(v => v.id == this.$route.query.notes && v.type === "notes");
        }
        if (this.crumbs.length > 2) {
          this.crumbs.pop();
          this.crumbs.push({
            name: this.selectedNotes.name,
            url: this.$route.fullPath
          });
        }
      } else {
        if (this.crumbs.length > 2) {
          this.crumbs.pop();
          this.crumbs.push({
            name: this.selectedVideo.name,
            url: this.$route.fullPath
          });
        }
      }

      if (
        this.selectedModule &&
        this.selectedModule.module_type &&
        this.selectedModule.module_type.paid &&
        this.currentCourse &&
        !this.currentCourse.allow_without_ext
      ) {
        this.$store.commit("setIsPaidVideo", true);
      } else {
        this.$store.commit("setIsPaidVideo", false);
      }

      this.checkCustomFormToShow();

      if (this.$refs.videojs) this.$refs.videojs.changeVideo();
      if (this.$refs.vimeojs) this.$refs.vimeojs.changeVideo();
      if (this.reactApp) {
        ///DONOT REMOVE THIS
        this.reactAppStates();
        this.checkVideoAccesss();
      }
      this.checkIfUserExistsInReaction();
      this.calculateTracking();
      this.accessPopup = false;
      if (
        newVal &&
        !this.$route.query.daq &&
        !this.$route.query.notes &&
        !newVal.vss_id &&
        !newVal.url_mpd
      ) {
        if (
          this.selectedModule &&
          this.selectedModule.module_type &&
          this.selectedModule.module_type.paid &&
          !this.coursePurchased &&
          !this.selectedModule.module_type.purchased
        ) {
          this.redirect = true;
        } else {
          if (!this.isMobileOrTablet && !this.isDesktopApp && !this.reactApp) {
            this.accessPopup = true;
          } else if (this.isMobileOrTablet) {
            this.accessPopup = true;
          } else {
            toastr.error("Unauthorized to watch this video");
          }
        }
      } else {
        if (newVal) {
          appService.postVideoView(newVal.id);
        }
      }
      if (
        this.$route.query.notes &&
        this.selectedNotes &&
        !this.selectedNotes.url
      ) {
        if (!this.isMobileOrTablet && !this.isDesktopApp && !this.reactApp) {
          this.accessPopup = true;
        } else if (this.isMobileOrTablet) {
          this.accessPopup = true;
        } else {
          toastr.error("Unauthorized to watch this Notes");
        }
      }
    },
    selectedModule: async function(newModule, oldModule) {
      this.selectedModule = newModule;
      await this.getCourseProgress(true);
    }
  },
  components: {
    "app-pop-up-quiz": popUpQuiz,
    "app-videojs-player": videojsPlayer,
    "app-daq-quiz": daqQuiz,
    "app-vimeo-player": vimeoPlayer,
    "app-comments": comments,
    "app-mobile-comments": mobileComments,
    "app-video-listing": videoListing,
    "app-access-denied-popup": AccessDeniedPopup,
    VueInstagram,
    "bread-crumbs": breadCrumns,
    "app-pdf-viewer": PdfViewer,
    apexchart: VueApexCharts,
  },
  async mounted() {
    console.log("in mount");
    eventBus.$emit("show-phone-popup");
    let userAgent = navigator.userAgent;
    if (userAgent.includes("desktop")) {
      this.isDesktopApp = true;
    }

    if (userAgent.includes("React-Native-NP")) {
      this.reactApp = true;
    }

    if (this.reactApp) {
      console.log("videoChanged"); ///DONOT REMOVE THIS CONSOLE
      this.toastrShown = 0;
      // try {
      //   let downloadingArray = await customStorageService.getVideoDownloading(); ///DONOT REMOVE THIS CONSOLE
      //   console.log(JSON.stringify(downloadingArray));
      //   console.log("MOUNTED ARRAY", downloadingArray);
      //   if (downloadingArray != null || downloadingArray != "null") {
      //     this.currentlyDownloading = [...downloadingArray]; ///DONOT REMOVE THIS CONSOLE
      //     console.log(
      //       "downloadingarraymounted" +
      //         JSON.stringify(this.currentlyDownloading)
      //     );
      //     this.removeDownloadedFromDownloading();
      //     this.reactAppStates();
      //     console.log("DOWNLOADING");
      //   }
      // } catch (err) {
      //   console.log("in create", err);
      //   console.log(JSON.stringify(err));
      // }
    }
    document.getElementById("nav-bar").style.zIndex = "12";
    if(this.$route.query.daq === 'true') {
      this.daq = true;
    }

    await this.initialize();

    await this.initialView();

    this.checkIfUserExistsInReaction();

    if (this.mobileView) {
      let PaidStatus = await appService.checkUserPaidStatus();
      if (PaidStatus.isPaidUser) {
        // this.totalHeight = 120;
        // this.isRecomendationBanner = true;
      }
    }
  }
};
</script>

<style src="./video-main.css" scoped></style>

<template src="./video-player.html"></template>

<script>
import { eventBus } from "../../../../main";
import videojsPlayer from "./../videojs-player/videojs-player";
import vimeoPlayer from "./../vimeo-player/vimeo-player";
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

var popUp = false;
var share = false;
var moreOptions = false;
var sideMenuOptions = false;

export default {
  name: "app-video-player",
  directives: {
    ClickOutside
  },
  methods: {
    async getVideoDataForWebPlayer() {
      // {
      //   video_id: 7701,
      //   module_id: 874,
      //   course_id: 225,
      // }
      const res = await courseService.getVideoData({
        video_id: this.$route.params.videoId,
        module_id: this.$route.params.moduleId,
        course_id: this.$route.params.courseId,
        user_id: this.$route.query.user_id
      });
      if (res.data && res.data.success) {
        const data = res.data;
        this.selectedVideo = data.video;
        this.selectedModule = data.module;
        this.selectedModule = data.module;
        this.currentCourse = data.course;
        this.videoLastStat = data.videoLastStat;
        this.user = data.user;
        this.isPageLoading = false;
      } else {
        const data = res.data;
        toastr.error(
          data && data.message
            ? data.message
            : "Error while getting data for video"
        );
      }
    },
    updateOdooProgress() {},
    vh(v) {
      var h = Math.max(
        document.getElementById("mobile-view-video-main").clientHeight,
        window.innerHeight || 0
      );
      return (v * h) / 100;
    },
    disabledDownload() {
      if (this.toastrShown === 0) {
        this.toastrShown = 1;
      }
    },

    getDataFromChildren(value) {
      if (this.reactApp) {
        console.log("videoChanged"); ///DONOT REMOVE THIS CONSOLE
        this.toastrShown = 0;
      }
      this.selectedVideo = value;
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
    initialView() {
      var inWidth = window.innerWidth;
      customStorageService.setPageName("video");
      var videoParent = document.getElementById("video-parent");
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
      }
      ((videoParent || {}).style || {}).width = (
        (videoCenter || {}).style || {}
      ).width;
    },
    showvideofeedback() {},
    calculateTracking() {
      courseService.calculateStats(this.currentCourse.id);
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
      videoLastStat: {},
      currentUser: {},
      coursePurchased: {},
      toReportVideo: false,
      reportVideoDescArr: [],
      reportVideoDesc: "",
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
      isRecomendationBanner: false,
      totalHeight: 0,
      crumbs: []
    };
  },
  async created() {},
  watch: {},
  components: {
    "app-pop-up-quiz": popUpQuiz,
    "app-videojs-player": videojsPlayer,
    "app-vimeo-player": vimeoPlayer,
    "app-comments": comments,
    "app-mobile-comments": mobileComments,
    "app-video-listing": videoListing,
    "app-access-denied-popup": AccessDeniedPopup,
    VueInstagram,
    "bread-crumbs": breadCrumns
  },

  async mounted() {
    this.getVideoDataForWebPlayer();
    await this.initialView();
  }
};
</script>

<style src="./video-player.css" scoped></style>

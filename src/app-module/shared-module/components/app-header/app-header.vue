<template src="./app-header.html"></template>

<script>
import customStorageService from "../../../app-services/custom-storage-service";
import DesktopAppHeader from "../desktop-app-header/desktop-app-header.vue";
import ClickOutside from "vue-click-outside";
import { lmsBackend } from "../../../../environment/environment";
import toastr from "toastr";
import appService from "../../../app-services/app-service";
import notificationService from "../../../app-services/notification-service";
import { notificationSocketInit } from "../../../services/notifications-socket-service";
import LoginService from "../../../app-services/app-login-service";
import { eventBus } from "../../../../main";
import liveSessionService from "@/app-module/app-services/live-session-service";
import btnMdcatResult from "../btn-mdcat-result/btn-mdcat-result.vue"
var moment = require("moment-timezone");

export default {
  name: "app-header",
  props: {
    collapse: Boolean
  },
  components: {
    "desktop-app-header": DesktopAppHeader,
    "btn-mdcat-result": btnMdcatResult,
  },
  directives: {
    ClickOutside
  },
  methods: {
    getNameInitials(fullName) {
      // Split the full name into words
      const words = fullName.split(' ');

      // Extract the first character from each word and capitalize it
      const initials = words
          .map((word) => word.charAt(0).toUpperCase())
          .join('');

      return initials;
    },
    mainlogoClick() {
      if (this.$store.state.isNewReactNative) {
        console.log("close-webview");
      } else {
        this.$router.push("/course/course-landing");
      }
    },
    sideBarHandler() {
      mixpanel.track('sidebar-click');
      var videoPageIs = customStorageService.getPageName();
      var side = document.getElementById("nav-menu");
      var sideShadow = document.getElementById("nav-menu-shadow");
      var body_ = document.getElementById("main-body");
      if (side.style.display === "none") {
        if (videoPageIs != "video") {
          body_.classList.add("right-side-responsive");
        }
        if (videoPageIs == "video") {
          document.getElementById("video-fixed").style.zIndex = 1;
        }
        document.getElementById("nav-menu").style.zIndex = 12;
        document.getElementById("nav-menu-shadow").style.zIndex = 2;
        // document.getElementById("video-fixed").style.zIndex = 1;
        sideShadow.style.display = "block";
        side.style.display = "block";
        document.getElementById("verify-page").style.zIndex = 1;
      } else if (side.style.display === "block") {
        if (videoPageIs == "video") {
          document.getElementById("video-fixed").style.zIndex = "";
        }
        body_.classList.remove("right-side-responsive");
        const verifyPage = document.getElementById("verify-page");
        if (verifyPage) {
          verifyPage.style.zIndex = 10;
        }
        // document.getElementById("video-fixed").style.zIndex = "";
        sideShadow.style.display = "none";
        side.style.display = "none";
      } else if (side.style.display === "") {
        if (videoPageIs == "video") {
          document.getElementById("video-fixed").style.zIndex = "";
        }
        body_.classList.remove("right-side-responsive");
        const verifyPage = document.getElementById("verify-page");
        if (verifyPage) {
          verifyPage.style.zIndex = 0;
        }
        // document.getElementById("video-fixed").style.zIndex = "";
        sideShadow.style.display = "block";
        side.style.display = "block";
      }
    },
    logout() {
      const data = {
        session: JSON.parse(localStorage.getItem("user"))?.token
      };
      customStorageService.removeUser();
      customStorageService.removeUid();
      this.$store.commit("setUid", {
        uid: null
      });
      if (this.reactApp) {
        customStorageService.removeVideoDownloading();
        console.log("loggedOut");
        //donot remove the console
      }
      // window.onmessage("loggedOut");
      LoginService.logout(data);
      this.$router.push("/login");
    },
    openIt() {
      if (!this.profile) {
        this.profile = true;
      } else {
        this.profile = false;
      }
    },
    openNotification() {
      mixpanel.track('VL-open-notification');
      this.notiDropDown = !this.notiDropDown;
      notificationService.notificationRead({
        user_id: this.currentUser.id
      });
      this.unreadNotification = 0;
      if (this.notiDropDown) {
        gtag("set", "page_path", "/notifications-popup");
        gtag("event", "page_view");
      }
    },
    closeIt() {
      this.profile = false;
    },
    closeNotiDropDown() {
      this.notiDropDown = false;
    },
    async onImageSelected(event) {
      this.loader = true;
      this.selectedImage = event.target.files[0];
      let fd = new FormData();
      fd.append("file", this.selectedImage, this.selectedImage.name);
      let imageUploaded = await this.uploadImage(fd, this.currentUser.id);
      if (imageUploaded.success) {
        this.uploadedImgLink = imageUploaded.link;
        this.selectedImage = null;
        let obj = {
          id: this.currentUser.id,
          user_image: this.uploadedImgLink
        };
        let picChanged = await appService.changeUserImg(obj);
        if (picChanged.success) {
          this.currentUser.image = this.uploadedImgLink;
          customStorageService.setUser(this.currentUser);
          this.currentUser = customStorageService.getUser();
          toastr.success("Image Updated Successfully!");
          this.loader = false;
        }
      }
    },
    uploadImage(formData, userId) {
      return lmsBackend
        .post("uploader/uploadImageToS3?userId=" + userId, formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          },
          onUploadProgress: function(progressEvent) {
            this.isImgUploaded = false;
            this.uploadPercentage = parseInt(
              Math.round((progressEvent.loaded / progressEvent.total) * 100)
            );
          }.bind(this)
        })
        .then(res => {
          return res.data;
        })
        .catch(err => {
          toastr.error("Oops! It seems service is down.");
          return err;
        });
    },
    changeUserProfile() {
      // console.log("uploadedImgLink: ", this.uploadedImgLink);
    },
    getFormattedDate(date) {
      var year = date.getFullYear();

      var month = (1 + date.getMonth()).toString();
      month = month.length > 1 ? month : "0" + month;

      var day = date.getDate().toString();
      day = day.length > 1 ? day : "0" + day;

      return month + "/" + day + "/" + year;
    },
    async getScore() {
      const res = await appService.getUserScore();
      this.$store.commit("setMdcatScore", {
        score: res.score.score_200,
        user: res.score.user,
        position: res.position,
        usersPositions: res.usersPositions
      });
    },
    async getScoreLink() {
      const res = await appService.getUserScoreLink();
      this.$store.commit("setMdcatScoreLink", {
        link: res.shareableLink
      });
    },
    async getNotifications() {
      this.isLoading = true;
      const res = await notificationService.getUserNotifications({
        user_id: this.currentUser ? this.currentUser.id : 0,
        page: 1,
        unreadCount: true
      });
      if (res && res.success) {
        this.notifications = res.notifications;
        this.unreadNotification = res.unreadNotification;
      }
      this.isLoading = false;
    },
    clickNotification(notification) {
      if (!notification.is_clicked) {
        notificationService.notificationClick({
          user_id: this.currentUser.id,
          notification_id: notification.id
        });
      }
      notification.is_clicked = true;
      if (notification.notifications.redirect_url) {
        let link = notification.notifications.redirect_url;
        if (!link.startsWith("http://") && !link.startsWith("https://")) {
          link = "https://" + link;
        }
        if (notification.notifications.redirect_type === "new_tab") {
          window.open(link, "_blank");
        } else {
          window.location.href = link;
        }
      }
    },
    showTime(notification) {
      return moment
        .tz(notification.notifications.createdAt, "Asia/Karachi")
        .format("hh: mm A");
    },
    showDate(notification, index) {
      let prevText;
      if (index > 0) {
        const compareDate = this.notifications[index - 1];
        prevText = moment
          .tz(compareDate.notifications.createdAt, "Asia/Karachi")
          .calendar({
            sameDay: "[Today]",
            nextDay: "DD/MM/YYYY",
            nextWeek: "DD/MM/YYYY",
            lastDay: "[Yesterday]",
            lastWeek: "[Last] dddd",
            sameElse: "DD/MM/YYYY"
          });
      }
      const text = moment
        .tz(notification.notifications.createdAt, "Asia/Karachi")
        .calendar({
          sameDay: "[Today]",
          nextDay: "DD/MM/YYYY",
          nextWeek: "DD/MM/YYYY",
          lastDay: "[Yesterday]",
          lastWeek: "[Last] dddd",
          sameElse: "DD/MM/YYYY"
        });
      if (text == prevText) {
        return false;
      }
      return text;
    },
    closeWebview() {
      console.log("close-webview");
    },
    async getCustomForms() {
      const res = await appService.getCustomForms();
      if (res && res.success) {
        const forms = res.result;
        this.$store.commit("setCustomForms", forms);
      }
    },
    callHelpLine(){ 
      mixpanel.track('VL-Help-Call');
    },
    liveSessionDDOpen(){
      this.liveSessionDD = !this.liveSessionDD;
    },
    closeLiveSessionDD(){
      this.liveSessionDD = false;
    },
    joinLiveSession(ongoingSession){
      let url = process.env.VUE_APP_LMS_HOME;
      if(ongoingSession.url_type == 'NEARPEER') url += '/live-chat/'+ongoingSession.id;
      else url = ongoingSession.url
      window.open(url, '_blank');
    },
    loginRedirect() {

    },
    handleNewNotification(message) {
      this.getNotifications();
      this.$toastr.Add({
        title: message.title,
        msg: message.description,
        type: "info",
        onClicked: () => {
          if (message.redirect_url) {
            let link = message.redirect_url;
            if (!link.startsWith("http://") && !link.startsWith("https://")) {
              link = "https://" + link;
            }
            if (message.redirect_type === "new_tab") {
              window.open(link, "_blank");
            } else {
              window.location.href = link;
            }
          }
        }
      });
    }
  },
  async mounted() {
    var side = document.getElementById("nav-menu");
    var sideShadow = document.getElementById("nav-menu-shadow");
    var body_ = document.getElementById("main-body");
    this.getCustomForms();

    window.addEventListener("resize", function() {
      try {
        var feedback = document
          .getElementById("feedback-component")
          .getElementsByClassName("main-feed");
        if (feedback.length == 0) {
          if (window.innerWidth < 1140) {
            if (side.style.display == "block") {
              body_.classList.remove("right-side-responsive");
              side.style.display = "none";
              sideShadow.style.display = "none";
            }
          }
        }
      } catch (error) {
        
      }
      
    });
    if (this.collapse) {
      this.sideBarHandler();
    }
    if (this.currentUser) {
      if (this.currentUser.provider == "facebook") {
        this.facebook = true;
      } else if (this.currentUser.provider == "google") {
        this.google = true;
      } else if (this.currentUser.provider == "apple") {
        this.apple = true;
      } else {
        this.nearpeer = true;
      }
      this.currentUser.joiningDate = this.getFormattedDate(
        new Date(this.currentUser.created_at)
      );
      notificationSocketInit();
      this.getScore();
      this.getScoreLink();
    }

    var userAgent = navigator.userAgent;
    if (userAgent.includes("desktop")) {
      this.isDesktopApp = true;
      document.getElementById("nav-bar").style.height = "85px";
      document.getElementById("sidemenu-container").style.top = "85px";
      document.getElementById("main-body").style.top = "22px";
      document.getElementById("nav-bar").classList.remove("flex-view");
    }
    if (userAgent.includes("React-Native-NP")) {
      this.reactApp = true;
    }
    eventBus.$on("new-notification", this.handleNewNotification);
    this.getNotifications();
    const ongoing_session_data = await liveSessionService.getOngoingSessions();
    if(ongoing_session_data && ongoing_session_data.data && ongoing_session_data.data.data && ongoing_session_data.data.data.sessions) {
      this.ongoingSessions = ongoing_session_data.data.sessions;
    }
  },
  beforeDestroy() {
    // Remove event listener when the component is about to be destroyed
    eventBus.$off("new-notification", this.handleNewNotification);
  },
  data() {
    return {
      currentUser: customStorageService.getUser(),
      windowHeight: window.innerWidth,
      profile: false,
      notiDropDown: false,
      uploadedImgLink: "",
      selectedImage: {},
      uploadPercentage: 0,
      isImgUploaded: true,
      apple: false,
      google: false,
      facebook: false,
      nearpeer: false,
      loader: false,
      isDesktopApp: false,
      reactApp: false,
      notifications: [],
      isLoading: false,
      unreadNotification: 0,
      liveSessionDD: false,
      ongoingSessions: [],
    };
  }
};
</script>

<style src="./app-header.css" scoped></style>

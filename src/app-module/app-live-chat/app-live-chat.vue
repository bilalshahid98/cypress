<template src="./app-live-chat.html"></template>

<script>
import appHeader from "../shared-module/components/app-header/app-header";
import appFooter from "../shared-module/components/app-footer/app-footer.vue";
import appsidebar from "../shared-module/components/app-sidebar/app-sidebar.vue";
import AppVerification from "./../shared-module/components/app-verification/app-verification";
import AppChat from "./../shared-module/components/app-chat/chat.vue";
import LiveSessionService from "../../app-module/app-services/live-session-service";
import liveSessionService from "@/app-module/app-services/live-session-service";
import CustomStorageService from "@/app-module/app-services/custom-storage-service";
import toastr from "toastr";
var moment = require("moment-timezone");

var startTime = moment.tz("Asia/Karachi");
let user = CustomStorageService.getUser();
export default {
  name: "app-live-chat",
  data() {
    return {
      session_id: this.$route.params.session_id,
      isPageLoading: true,
      sessionChats: [],
      session: {}
    };
  },
  components: {
    "app-header": appHeader,
    "app-footer": appFooter,
    "app-sidebar": appsidebar,
    "app-verification": AppVerification,
    "app-chat": AppChat
  },
  beforeMount() {
    if(!CustomStorageService.getUser()){
      // toastr.error("Session Expired! Please login")
      window.location.href = '/live-chat/unregistered/'+this.$route.params.session_id;
      // this.$router.push('/live-chat/unregistered/'+this.session_id)
    }
    user = CustomStorageService.getUser();
  },
  beforeRouteUpdate(to, from, next) {
    this.leaveEvent();
    next();
  },
  beforeRouteLeave(to, from, next) {
    this.leaveEvent();
    next();
  },
  beforeDestroy() {
    window.removeEventListener("beforeunload", this.handleWindowClose);
  },
  methods: {
    sideMenu() {
      var side = document.getElementById("nav-menu");
      console.log('side');
      console.log(side);
      side.style.display = "none";
      side.classList.remove("side-menu");
    },
    leaveEvent() {
      let currentTime = moment.tz("Asia/Karachi");
      const diffInSeconds = currentTime.diff(startTime, 'seconds');
      if(user){
        liveSessionService.trackSessionTime({
          live_session_id: this.session_id,
          live_session: this.session,
          user_id: user.id,
          time: diffInSeconds,
          user,
        });
      }

    },
    handleWindowClose(event) {
      this.leaveEvent();
      // Custom message for the confirmation dialog (not supported in all browsers)
      const confirmationMessage = "Are you sure you want to leave? Your changes may not be saved.";
      event.returnValue = confirmationMessage; // Standard for most browsers
      return confirmationMessage; // For some older browsers
    }
  },
  async mounted() {
    this.sideMenu()
    window.addEventListener("beforeunload", this.handleWindowClose);
    if(CustomStorageService.getUser().id){
      CustomStorageService.setUid(CustomStorageService.getUser().id)
    }
    const session = await liveSessionService.getSessionById(this.session_id, false, ['course', 'custom_form']);
    if(session.status >= 400 && session.status <= 500){
      toastr.error(session.data.message)
      this.$router.push('/live-session')
    }
    else if(session.data.status == 'ENDED'){
      toastr.error("Session has already ended");
      this.$router.push('/live-session')
    }
    else if(session.data.status == 'SCHEDULED' || session.data.status == 'RESCHEDULED'){
      toastr.error("Session has not started yet");
      this.$router.push('/live-session')
    }
    else if(session.data.purchased !== undefined && !session.data.purchased){
      toastr.error("This is only for paid user");
      this.$router.push('/live-session/'+session.data.id)
    }
    this.session = session.data;

    const session_chat_data = await liveSessionService.getSessionChatsBySessionId(this.session_id, ['user', 'replies']);
    this.sessionChats = session_chat_data.data;

    // ending loader
    this.isPageLoading = false;
  }
};
</script>

<style src="./app-live-chat.css" scoped></style>

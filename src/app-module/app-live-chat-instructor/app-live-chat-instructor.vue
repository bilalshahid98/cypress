<template src="./app-live-chat-instructor.html"></template>

<script>
import appHeader from "../shared-module/components/app-header/app-header";
import appFooter from "../shared-module/components/app-footer/app-footer.vue";
import appsidebar from "../shared-module/components/app-sidebar/app-sidebar.vue";
import AppVerification from "./../shared-module/components/app-verification/app-verification";
import AppChat from "./../shared-module/components/app-chat/chat.vue";
import liveSessionService from "@/app-module/app-services/live-session-service";
import toastr from "toastr";
var moment = require("moment-timezone");

var startTime = moment.tz("Asia/Karachi");

export default {
  name: "app-live-chat-instructor",
  data() {
    return {
      session_id: this.$route.params.session_id,
      meta: this.$route.params.meta,
      isPageLoading: true,
      sessionChats: [],
      session: {},
      instructor: null
    };
  },
  components: {
    "app-footer": appFooter,
    "app-verification": AppVerification,
    "app-chat": AppChat
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
    leaveEvent() {
      let currentTime = moment.tz("Asia/Karachi");
      const diffInSeconds = currentTime.diff(startTime, 'seconds');
      if(this.instructor){
        liveSessionService.trackSessionTime({
          live_session_id: this.session_id,
          live_session: this.session,
          user_id: this.instructor.uid,
          time: diffInSeconds,
          user: this.instructor,
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
    window.addEventListener("beforeunload", this.handleWindowClose);
    this.instructor = JSON.parse(decodeURIComponent(this.meta));
    if(this.instructor.session_id.toString() == this.session_id)
    {
      console.log(this.instructor.session_id.toString(), this.session_id)
      const session = await liveSessionService.getSessionById(this.session_id, true, ['course', 'custom_form']);
      this.session = session.data;

      const session_chat_data = await liveSessionService.getSessionChatsBySessionId(this.session_id, ['user', 'replies']);
      this.sessionChats = session_chat_data.data;

      // ending loader
      this.isPageLoading = false;
    }
    else{
      toastr.error("Playing with security is a serious crime");
      this.$router.push("/landing");
    }
  }
};
</script>

<style src="./app-live-chat-instructor.css" scoped></style>

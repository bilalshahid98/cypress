<template src="./app-live-chat-unregistered.html"></template>

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
import appLogin from "../shared-module/components/app-login/app-login.vue";
import customStorageService from "@/app-module/app-services/custom-storage-service";

export default {
  name: "app-live-chat-unregistered",
  data() {
    return {
      session_id: this.$route.params.session_id,
      isPageLoading: true,
      sessionChats: [],
      session: {}
    };
  },
  methods: {
    async onLogin(){
      this.$refs.loginModal.closeLoginPage();
      if(this.session.course_id){
        const response = await liveSessionService.enrolInCourse({
          "user_id": customStorageService.getUser()?.id,
          "course_id": this.session.course_id,
          "time": new Date().toLocaleString()
        });
        console.log(response, "session enrollment response");
        this.$router.push(`/live-chat/${this.session.id}`)
      }
      else if(this.session.tag_id){
        const response = await liveSessionService.enrolInCourse({
          "user_id": customStorageService.getUser()?.id,
          "tag_id": this.session.tag_id,
          "time": new Date().toLocaleString()
        });
        console.log(response, "session enrollment response");
        this.$router.push(`/live-chat/${this.session.id}`)
      }
      else this.$router.push(`/live-chat/${this.session.id}`)
    },
    openLogin(){
      this.$refs.loginModal.openSignupPopup();
    }
  },
  components: {
    "app-login": appLogin,
    // "app-header": appHeader,
    "app-footer": appFooter,
    // "app-sidebar": appsidebar,
    "app-verification": AppVerification,
    "app-chat": AppChat
  },
  async mounted() {
    const session = await liveSessionService.getSessionById(this.session_id, false, ['course', 'custom_form']);
    if(session.status >= 400 && session.status <= 500){
      toastr.error(session.data.message)
      this.$router.push('/landing')
    }
    else if(session.data.status == 'ENDED'){
      toastr.error("Session has already ended");
      this.$router.push('/landing')
    }
    else if(session.data.status == 'SCHEDULED' || session.data.status == 'RESCHEDULED'){
      toastr.error("Session has not started yet");
      this.$router.push('/landing')
    }
    this.session = session.data;

    if(!this.session.allow_guest_users){
      toastr.error("You are not allowed to view this session")
      this.$router.push('/landing')
    }

    const session_chat_data = await liveSessionService.getSessionChatsBySessionId(this.session_id, ['user', 'replies']);
    this.sessionChats = session_chat_data.data;

    // ending loader
    this.isPageLoading = false;
  }
};
</script>

<style src="./app-live-chat-unregistered.css" scoped></style>

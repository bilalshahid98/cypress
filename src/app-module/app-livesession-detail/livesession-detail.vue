<template src="./livesession-detail.html"></template>

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
import customStorageService from "@/app-module/app-services/custom-storage-service";
import livesession from "@/app-module/app-livesession/livesession.vue";
import outlined_start from "../../assets/live-chat/star_outline.svg";
import filled_start from "../../assets/live-chat/star_filled.svg";
import {eventBus} from "@/main";

export default {
  name: "app-live-chat",
  computed: {
    livesession() {
      return livesession
    }
  },
  data() {
    return {
      session_id: this.$route.params.session_id,
      isPageLoading: true,
      sessionChats: [],
      session: {},
      shareSession: null,
      outlined_start,
      filled_start,
      uid: customStorageService.getUser().id
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
  },
  beforeDestroy() {
    // Remove event listener when the component is about to be destroyed
    eventBus.$off("new-notification-on-session-live", this.handleNewLiveSessionEvent);
  },
  async mounted() {
    if(CustomStorageService.getUser().id){
      CustomStorageService.setUid(CustomStorageService.getUser().id)
    }
    const session = await liveSessionService.getSessionById(this.session_id, false, ['course', 'interested_users', 'registration_form', 'custom_form', 'videos']);
    this.session = session.data;

    this.saveSessionEvent('VIEW');
      console.log('asd----',this.session)

    eventBus.$on("new-notification-on-session-live", this.handleNewLiveSessionEvent);
    // ending loader
    this.isPageLoading = false;
  },
  methods:{
    async handleNewLiveSessionEvent(data){
      console.log(data)
      if(data.id.toString() == this.session_id){
        console.log('Matched id');
        const session = await liveSessionService.getSessionById(this.session_id, false, ['course', 'interested_users', 'registration_form', 'custom_form', 'videos']);
        this.session = session.data;
      }
      else
        console.log('Not Matched id');
    },
    calendarLink(upComingSession) {
      const startTime = this.formatTime(new Date(upComingSession.time));
      const endTime = this.formatTime(new Date(new Date(upComingSession.time).getTime() + (60 * 60 * 1000))); // Adding 1 hour to start time

      window.open(`https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(upComingSession.name)}&dates=${encodeURIComponent(startTime + '/' + endTime)}`, '_blank');
    },
    addToCalender(session) {
      this.saveSessionEvent('ADD_TO_CALENDER');
      this.calendarLink(session)
    },
    async interested(session_id, filter) {
      const int_user = this.session.interested_users.find(user => user.user_id === this.uid);
      if(int_user) int_user.is_interested = (filter == "interested");
      else this.session.interested_users.push({
        user_id: this.uid,
        is_interested: (filter == "interested")
      })

      const response = await liveSessionService.markInterested(session_id, filter == "interested");
      if(response.success) {
        toastr.success(response.message);
      }
      else
        toastr.error(response.message);
    },
    formatTime(time) {
      const year = time.getFullYear();
      const month = (time.getMonth() + 1).toString().padStart(2, '0');
      const day = time.getDate().toString().padStart(2, '0');
      const hours = time.getHours().toString().padStart(2, '0');
      const minutes = time.getMinutes().toString().padStart(2, '0');
      const seconds = time.getSeconds().toString().padStart(2, '0');

      return `${year}${month}${day}T${hours}${minutes}${seconds}`;
    },
    openShareModal(session) {
      this.shareSession = session;
      this.linkToCopy = process.env.VUE_APP_FRONTEND_BASE_URL + 'live-session/' + session.id;
      // Assuming you have an event or method that triggers the modal opening
      $('#ls_share').modal('show'); // This line opens the modal
    },
    copyURL() {
      const el = document.createElement("textarea");
      el.value = this.linkToCopy;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      navigator.clipboard.writeText(this.linkToCopy)
      this.coppied = true;
      setTimeout(() => {
        this.coppied = false;
      }, 3000);
    },
    createBuyNowLink(session) {
      const link = (session.course || []).index_url;
      if(link) return process.env.VUE_APP_REDIRCT_URL + "/" + link + "?token=" + customStorageService.getUser().token + "&liveSessionId=" + session.id + "&uid=" + customStorageService.getUser().id;
      else return process.env.VUE_APP_REDIRCT_URL + "/courses" + "?token=" + customStorageService.getUser().token + "&liveSessionId=" + onGoingSession.id + "&uid=" + customStorageService.getUser().id;
    },
    openReportModal(session_id) {
      this.reportSessionId = session_id;
      // Assuming you have an event or method that triggers the modal opening
      $('#report_an_issue').modal('show'); // This line opens the modal
    },
    async submitReport(){
      if(this.reportSessionId){
        const response = await liveSessionService.submitReportFeedback(this.reportSessionId, $('#reportAnIssue').val());
        if(response.success) {
          toastr.success('Successfully submitted');
          $('#reportAnIssue').val('');
        }
        else
          toastr.error(response.message);
      }
      else {
        toastr.error('Something went wrong..!');
      }
    },
    async saveSessionEvent(event_type) {
      const response = await liveSessionService.saveSessionEvent({
        session_id: this.session_id,
        instructor_id: this.session.instructor_id,
        event_type
      });
      
    },
    rescheduleBannerClose(session_id){
      console.log(`#reschedule_banner_${session_id}`);
      $(`#reschedule_banner_${session_id}`).remove();
    }
  }
};
</script>

<style src="./livesession-detail.css" scoped></style>

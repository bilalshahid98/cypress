<template src="./livesession.html"></template>

<script>
import Vue from "vue";
import appHeader from "../shared-module/components/app-header/app-header";
import appFooter from "../shared-module/components/app-footer/app-footer.vue";
import appsidebar from "../shared-module/components/app-sidebar/app-sidebar.vue";
import pagination from "../shared-module/components/pagination/pagination";
import AppVerification from "./../shared-module/components/app-verification/app-verification";
import liveSessionService from "../app-services/live-session-service";
import ClickOutside from "vue-click-outside";
import toastr from "toastr";
import CustomStorageService from "../app-services/custom-storage-service";
import outlined_start from "../../assets/live-chat/star_outline.svg";
import filled_start from "../../assets/live-chat/star_filled.svg";
import customStorageService from "../app-services/custom-storage-service";
import {eventBus} from "@/main";
import ReadMore from 'vue-read-more';
 
Vue.use(ReadMore);

export default {
  name: "AppLivesession",
  data() {
    return {
      ongoingSessionsCount: 0,
      ongoingSessions: [],
      upComingSessionsCount: 0,
      upComingSessions: [],
      previousSessionsCount: 0,
      previousSessions: [],
      upComingMonthSessionsCount: 0,
      upComingMonthSessions: [],
      filter_working: false,
      tag_string: "",
      course_string: "",
      student_type: 'ENROLLED',
      sessionInterest: 'All Session',
      sortSession: 'Upcoming',
      listBox: false,
      sortBox: false,
      intrestBox: false,
      isPageLoading: true,
      currentUpComingPage: 1,
      currentOnGoingPage: 1,
      currentPreviousPage: 1,
      rescheduleBanner:false,
      reportSessionId: false,
      uid: CustomStorageService.getUser()?.id,
      outlined_start,
      filled_start,
      coppied: false,
      linkToCopy: null,
      shareSession: null,
      loadMore: true,
    };
  },
  computed: {},
  directives: {
    ClickOutside
  },
  components: {
    "app-header": appHeader,
    "app-footer": appFooter,
    "app-sidebar": appsidebar,
    "app-verification": AppVerification,
    "base-pagination": pagination,
  },
  beforeDestroy() {
    // Remove event listener when the component is about to be destroyed
    eventBus.$off("new-notification-on-session-live", this.handleNewLiveSessionEvent);
  },
  async mounted() {
    const include = ['interested_users', 'course'];
    const upcoming_session_data = await liveSessionService.getUpComingSessions(include, 1, 7);
    this.upComingSessions = upcoming_session_data.data.sessions;
    console.log("🚀 ~ file: livesession.vue:61 ~ mounted ~ this.upComingSessions:", this.upComingSessions)
    this.upComingSessionsCount = upcoming_session_data.data.sessions_count;

    const ongoing_session_data = await liveSessionService.getOngoingSessions(include, 1, 7);
    this.ongoingSessions = ongoing_session_data.data.sessions;
    this.ongoingSessionsCount = ongoing_session_data.data.sessions_count;

    const previous_session_data = await liveSessionService.getPreviousSessions(include, 1, 7);
    this.previousSessions = previous_session_data.data.sessions;
    this.previousSessionsCount = previous_session_data.data.sessions_count;

    const upcomming_month_session_data = await liveSessionService.getUpcommingMonthSessions(include, 1, 7);
    if(upcomming_month_session_data.data.sessions) {
      this.upComingMonthSessions = upcomming_month_session_data.data.sessions;
      this.upComingMonthSessionsCount = upcomming_month_session_data.data.sessions_count;
    }

    eventBus.$on("new-notification-on-session-live", this.handleNewLiveSessionEvent);

    // ending loader
    this.isPageLoading = false;
    $( document ).ready(function() {

    })
    setInterval(() => {
      $( ".uls-intro a" ).attr("href", "javascript:void(0)");
    }, 300);
    
  },
  methods: {
    async handleNewLiveSessionEvent(data){
      console.log(data)
      const include = ['interested_users', 'course'];
      const ongoing_session_data = await liveSessionService.getOngoingSessions(include, 1, 7);
      this.ongoingSessions = ongoing_session_data.data.sessions;
      this.ongoingSessionsCount = ongoing_session_data.data.sessions_count;
      console.log("new data fetched for ongoing session: " + ongoing_session_data.data.sessions)
    },
    async handleUpComingPageChange(){
      if(this.filter_working){
        await this.fetchFilteredUpComingSessions();
        return;
      }
      const include = ['interested_users', 'course'];
      const upcoming_session_data = await liveSessionService.getUpComingSessions(include, this.currentUpComingPage, 7);
      this.upComingSessions = upcoming_session_data.data.sessions;
    },
    async handleOnGoingPageChange(){
      const include = ['interested_users', 'course'];
      const ongoing_session_data = await liveSessionService.getOngoingSessions(include, this.currentOnGoingPage, 7);
      this.ongoingSessions = ongoing_session_data.data.sessions;
      console.log(this.ongoingSessions, "ongoing sessions")
    },
    async handlePreviousPageChange(){
      if(this.currentPreviousPage != -1){
        const include = ['interested_users', 'course'];
        this.currentPreviousPage++;
        const previous_session_data = await liveSessionService.getPreviousSessions(include, this.currentPreviousPage, 7);
        this.previousSessions = this.previousSessions.concat(previous_session_data.data.sessions);
        if (previous_session_data.data.sessions.length < 7) {
          this.loadMore = false;
          this.currentPreviousPage = -1;
        }
      }
    },
    copyURL(event) {
      event.preventDefault();
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
    openReportModal(session_id) {
      this.reportSessionId = session_id;
      // Assuming you have an event or method that triggers the modal opening
      $('#report_an_issue').modal('show'); // This line opens the modal
    },
    openShareModal(session) {
      this.shareSession = session;
      this.linkToCopy = process.env.VUE_APP_FRONTEND_BASE_URL + 'live-session/' + session.id;
      // Assuming you have an event or method that triggers the modal opening
      $('#ls_share').modal('show'); // This line opens the modal
    },
    closeShareModal() {
      // Assuming you have an event or method that triggers the modal opening
      $('#ls_share').modal('hide'); // This line close the modal
    },
    closeReportModal() {
      // Assuming you have an event or method that triggers the modal opening
      $('#report_an_issue').modal('hide'); // This line close the modal
    },
    openOgoningSessionModal(session_id) {
      $('#ls_course_detail_ongoing_' + session_id).modal('show');
    },
    openUpcomingSessionModal(session_id) {
      $('#ls_course_detail_upcoming_' + session_id).modal('show');
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
      this.closeReportModal();
    },
    async clearAll(){
      this.filter_working = false;
      // this.isPageLoading = true;
      this.tag_string = "";
      this.course_string = "";
      this.student_type = 'ENROLLED';
      this.currentUpComingPage = 1;

      const include = ['interested_users', 'course'];
      const upcoming_session_data = await liveSessionService.getUpComingSessions(include, this.currentUpComingPage, 7);
      this.upComingSessions = upcoming_session_data.data.sessions;
      this.upComingSessionsCount = upcoming_session_data.data.sessions_count;

      // ending loader
      // this.isPageLoading = false;
    },
    closeBox() {
      this.listBox = false;
    },
    closeSortBox() {
      this.sortBox = false;
    },
    closeIntrestBoxBox() {
      this.intrestBox = false;
    },
    getNameInitials(fullName) {
      // Split the full name into words
      const words = fullName.split(' ');

      // Extract the first character from each word and capitalize it
      const initials = words
          .map((word) => word.charAt(0).toUpperCase())
          .join('');

      return initials;
    },
    async saveSessionEvent(session, event_type) {
      const response = await liveSessionService.saveSessionEvent({
        session_id: session.id,
        instructor_id: session.instructor_id,
        event_type
      });

    },
    calendarLink(upComingSession) {
      const startTime = this.formatTime(new Date(upComingSession.time));
      const endTime = this.formatTime(new Date(new Date(upComingSession.time).getTime() + (60 * 60 * 1000))); // Adding 1 hour to start time

      window.open(`https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(upComingSession.name)}&dates=${encodeURIComponent(startTime + '/' + endTime)}`, '_blank');
    },
    addToCalender(session) {
      this.saveSessionEvent(session, 'ADD_TO_CALENDER');
      this.calendarLink(session)
    },
    createBuyNowLink(onGoingSession) {
      const link = (onGoingSession.course || []).index_url;
      if(link) return process.env.VUE_APP_REDIRCT_URL + "/" + link + "?token=" + customStorageService.getUser().token + "&liveSessionId=" + onGoingSession.id + "&uid=" + customStorageService.getUser().id;
      else return process.env.VUE_APP_REDIRCT_URL + "/courses" + "?token=" + customStorageService.getUser().token + "&liveSessionId=" + onGoingSession.id + "&uid=" + customStorageService.getUser().id;
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

    async fetchFilteredUpComingSessions(){
      const filter = {
        tag_string: this.tag_string,
        course_string: this.course_string,
        student_type: this.student_type,
        is_interested: this.sessionInterest,
        sort_session: this.sortSession
      }
      const include = ['interested_users', 'course'];
      const upcoming_session_data = await liveSessionService.getFilteredUpComingSessions(filter, include, this.currentUpComingPage, 7);
      if (Array.isArray(upcoming_session_data.data?.sessions)) {
        console.log(upcoming_session_data.data, 'upcoming_session_data')
        this.upComingSessions = upcoming_session_data.data.sessions;
        this.upComingSessionsCount = upcoming_session_data.data.sessions_count;
      }
      else this.upComingSessions = [upcoming_session_data.data.sessions];
    },

    async onChangeSearchString() {
      this.filter_working = true;
      this.currentUpComingPage = 1;
      if(this.tag_string == "" && this.course_string == "" && this.student_type == 'ENROLLED' && this.sessionInterest == 'All' && this.sortSession == 'Upcoming'){
        this.clearAll();
        return;
      }
      await this.fetchFilteredUpComingSessions();
    },
    async onChangeStudentType(type) {
      this.student_type = type;
      await this.onChangeSearchString();
    },
    async interested(session_id, filter) {
      this.upComingSessions.forEach(upComingSession => {
        if(upComingSession.id === session_id) {
          const int_user = upComingSession.interested_users.find(user => user.user_id === this.uid);
          if(int_user) int_user.is_interested = (filter == "interested");
          else upComingSession.interested_users.push({
            user_id: this.uid,
            is_interested: (filter == "interested")
          })
        }
      })

      const response = await liveSessionService.markInterested(session_id, filter == "interested");
      if(response.success) {
        toastr.success(response.message);
      }
      else
        toastr.error(response.message);
    },
    async onChangeIntrestType(type) {
      this.sessionInterest = type;
      await this.fetchFilteredUpComingSessions();
    },
    async onChangeSortType(type) {
      this.sortSession = type;
      await this.fetchFilteredUpComingSessions();
    },
    
    rescheduleBannerClose(session_id){
      console.log(`#reschedule_banner_${session_id}`);
      $(`#reschedule_banner_${session_id}`).remove();
    },
  },
};
</script>

<style src="./livesession.css" scoped></style>

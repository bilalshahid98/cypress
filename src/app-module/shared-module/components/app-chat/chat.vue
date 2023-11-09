<template src="./chat.html"></template>

<script>
import { saveLiveSessionChatSocketInit } from "@/services/live-session-chat-service";
import customStorageService from "@/app-module/app-services/custom-storage-service";
import appService from "@/app-module/app-services/app-service";
import AppCustomForm from "./../../../shared-module/components/custom-form/custom-form";
import sessionCustomForm from "./../../../shared-module/components/session-custom-form/custom-form";
import toastr from "toastr";
import courseService from "@/app-module/course-module/services/course-service";
import StarRating from 'vue-star-rating'
// import ZoomMeeting from "@/app-module/shared-module/components/zoom-meeting/zoom-meeting.vue";
import moment from "moment";

export default {
  name: "app-chat",
  components: {
    "app-custon-form": AppCustomForm,
    "session-custom-form": sessionCustomForm,
    "star-rating": StarRating,
    // "zoom-meeting": ZoomMeeting,
  },
  data() {
    return {
      sendMessage: null,
      message: "",
      socket: null,
      user: this.instructor?.uid ? this.instructor : customStorageService.getUser(),
      show_registration_form: false,
      show_custom_form: false,
      liveChatReply:false,
      selfLeft: false,
      reportChatId: null,
      zoomMeetingId: null,
      loaded: false,
      sessionFinished: false,
      good: false,
      poor: false,
      average: false,
      feedback: {
        experience: 0,
        suggestion: ""
      },
      disableBtn: false,
      session_user_count: 0,
    };
  },
  props: {
    session: null,
    chats: null,
    instructor: null,
    is_instructor: Boolean,
  },
  methods: {
    scrollToBottom() {
      const lastChildElement = this.$refs.chatContainer.lastElementChild;
      lastChildElement?.scrollIntoView(false,{
        behavior: 'smooth',
      });
    },
    truncateLastEnterCharacter(inputString) {
      // Check if the last character is an Enter character (newline)
      if (inputString.endsWith('\n')) {
        // Remove the last character by slicing the string

        return inputString.slice(0, -1);
      }
      // If the last character is not an Enter character, return the original string

      return inputString;
    },
    replyInputValueChange(chatId){
      const str = $('#reply_input_field_' + chatId).val();
      if(str.length) {
        $('#reply_send_svg_' + chatId).removeClass('empty');
        $('#reply_send_svg_' + chatId).addClass('filled');
      }
      else {
        $('#reply_send_svg_' + chatId).removeClass('filled');
        $('#reply_send_svg_' + chatId).addClass('empty');
      }
    },
    reactComment(chat){
      this.$nextTick(() => {
        if(!this.instructor && !customStorageService.getUser()?.id){
          this.$emit("onLogin");
          return;
        }
        let usersArr = chat.reaction?.users;
        if(usersArr && usersArr.length > 0) usersArr.push(customStorageService.getUser());
        else usersArr = [customStorageService.getUser()]
        if(chat.selfLiked) {
          usersArr = usersArr.filter(u => u.id !== customStorageService.getUser()?.id);
          chat.selfLiked = false;
        }
        else chat.selfLiked = true;
        let reactionObj = {
          type: "like",
          users: usersArr,
          count: usersArr.length
        };
        const reaction = {
          session_id: this.session.id,
          comment_id: chat.id,
          user_id: this.instructor ? this.instructor.uid : (customStorageService.getUser()?.id ?? customStorageService.getBrowserId()),
          type: 'like',
          reaction: reactionObj,
          user: {
            id: this.instructor ? this.instructor.uid : (customStorageService.getUser()?.id ?? customStorageService.getBrowserId()),
            full_name: this.instructor ? this.instructor.full_name : (customStorageService.getUser()?.full_name ?? "Guest User"),
            image: this.instructor ? this.instructor.image : (customStorageService.getUser()?.image ?? null)
          }
        }
        this.socket.emit('like-comment', reaction)
        $('#comment_like_svg_' + chat.id).addClass('filled');
        $('#comment_like_svg_' + chat.id).removeClass('empty');
      });
      this.$nextTick(() => {
        this.checkIfSelfLiked(this.chats);
      });
    },
    send_message(){
      

      if(!this.instructor && !customStorageService.getUser()?.id){
        this.$emit("onLogin");
        return;
      }
      this.message = this.truncateLastEnterCharacter(this.message);

      if(!this.message.length) {

        return;
      }
      this.$nextTick(() => {
        this.scrollToBottom();
      });

      const message = {
        session_id: this.session.id,
        user_id: this.instructor ? this.instructor.uid : (customStorageService.getUser()?.id ?? customStorageService.getBrowserId()),
        message: this.message,
        comment_time: moment.tz('Asia/Karachi').format('YYYY-MM-DD HH:mm:ss'),
        user: {
          id: this.instructor ? this.instructor.uid : (customStorageService.getUser()?.id ?? customStorageService.getBrowserId()),
          full_name: this.instructor ? this.instructor.full_name : (customStorageService.getUser()?.full_name ?? "Guest User"),
          image: this.instructor ? this.instructor.image : (customStorageService.getUser()?.image ?? null)
        }
      }
      this.socket.emit('send-message', message)
      this.message = "";
    },
    send_message_reply(chatId){
      if(!this.instructor && !customStorageService.getUser()?.id){
        this.$emit("onLogin");
        return;
      }
      const message_reply = this.truncateLastEnterCharacter($('#reply_input_field_' + chatId).val());

      if(!message_reply.length) {

        return;
      }

      const message = {
        session_id: this.session.id,
        comment_id: chatId,
        user_id: this.instructor ? this.instructor.uid : (customStorageService.getUser()?.id ?? customStorageService.getBrowserId()),
        message: message_reply,
        comment_time: moment.tz('Asia/Karachi').format('YYYY-MM-DD HH:mm:ss'),
        user: {
          id: this.instructor ? this.instructor.uid : (customStorageService.getUser()?.id ?? customStorageService.getBrowserId()),
          full_name: this.instructor ? this.instructor.full_name : (customStorageService.getUser()?.full_name ?? "Guest User"),
          image: this.instructor ? this.instructor.image : (customStorageService.getUser()?.image ?? null)
        }
      }
      this.socket.emit('send-message-reply', message)
      $('#reply_input_field_' + chatId).val('');
      $('#reply_input_' + chatId).hide()
    },
    async catch_like_comment(message){
      this.$nextTick(() => {
        if(message.session_id == this.session.id){

          if (message.status) {
            this.chats.find( chat => chat.id === message.comment_id).reaction = message.reaction;
          } else {
            toastr.error("Like Failed");

          }
        }
      });
      this.$nextTick(() => {
        this.checkIfSelfLiked(this.chats);
        this.$forceUpdate();
      });
    },
    catch_session_user_count(count){
      this.session_user_count = count;
    },
    async catch_message(message){


      if(message.session_id == this.session.id){

        if (message.status) {
          // const session_chats = await liveSessionService.getSessionChatsBySessionId(session_id);
          // this.chats = session_chats.data;
          this.chats.push({
            id: message.id,
            session_id: message.session_id,
            user_id: message.user_id,
            text: message.text,
            user: message.user,
            replies: [],
            comment_time: moment.tz('Asia/Karachi').format('YYYY-MM-DD HH:mm:ss'),
          })
          this.$nextTick(() => {
            this.checkIfSelfLiked(this.chats);
          });
        } else {
          toastr.error("Message Sending Failed");

        }
      }
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    async catch_message_reply(message){


      if(message.session_id == this.session.id){

        if (message.status) {

          let replies = this.chats.find( chat => chat.id === message.comment_id).replies;

          const reply = {
            id: message.id,
            comment_id: message.comment_id,
            session_id: message.session_id,
            user_id: message.user_id,
            text: message.text,
            user: message.user,
            comment_time: moment.tz('Asia/Karachi').format('YYYY-MM-DD HH:mm:ss'),
          };
          if(!replies) {
            replies = [reply];

          }
          else {
            replies.push(reply);

          }
          this.$nextTick(() => {
            this.checkIfSelfLiked(this.chats);
          });
        } else {
          toastr.error("Message Sending Failed");

        }
      }
    },
    toggle_registration_form() {
      console.log("in toggle registration form");
      this.show_registration_form = !this.show_registration_form;
      if(this.show_registration_form) {
        console.log("emitting onLogin");
        this.$emit("onLogin");
      }

      // if(!customStorageService.getUid() && !this.instructor && this.session.is_registration_form && this.session.registration_form_id  && this.session.registration_form && this.show_custom_form){
      //   setTimeout(this.toggle_registration_form, 5000)
      // }
    },
    toggle_custom_form() {
      if(!this.instructor && this.session.is_custom_form && this.session.custom_form_id && this.session.custom_form && this.show_registration_form){
        setTimeout(this.toggle_custom_form, 5000)
      }
      this.show_custom_form = !this.show_custom_form;
    },
    handleFormSaveEvent(form_type){
      if(form_type == "registration"){
        this.show_registration_form = false;
      }
      else if(form_type == "custom"){
        this.show_custom_form = false;
      }
    },
    sessionEndCallback(user_id){

      if(this.instructor && this.instructor.uid){

        if (window.history.length > 0) window.history.back();
        else this.$router.push('/landing');
      }
      else {
        this.sessionFinished = true;
        if(user_id.toString() === this.session.instructor_id.toString()) {
          toastr.info("Session Ended by Instructor");
          this.socket.emit('session-end')
        }
        // this.$router.push('/live-session');
        // if(!this.selfLeft || user_id != customStorageService.getUser()?.id) this.socket.emit('session-end')
      }
    },
    liveChatReplyBtn(chatId){

     $('#reply_input_' + chatId).toggle()
     $(document).mouseup(function(e) 
      {
          var container = $('#reply_input_' + chatId);

          // if the target of the click isn't the container nor a descendant of the container
          if (!container.is(e.target) && container.has(e.target).length === 0)
          {
              container.hide();
          }
      });

     if(chatId === this.chats[this.chats.length - 1].id) {
       console.log("last message in chat for reply")
       this.$nextTick(() => {
         this.scrollToBottom()
       });
     }

    },
    checkIfSelfLiked(comments) {
      comments.forEach(comment => {
        if ((((comment || {}).reaction || {}).users || []).length > 0) {
          (((comment || {}).reaction || {}).users || []).forEach(u => {
            if (u.id == customStorageService.getUser()?.id) {
              comment.selfLiked = true;
            } else {
              comment.selfLiked = false;
            }
          });
        }
      });
    },
    openReportModal(chatId) {
      this.reportChatId = chatId;
      // Assuming you have an event or method that triggers the modal opening
      $('#report_an_issue').modal('show'); // This line opens the modal
    },
    async submitReport() {
      if(this.reportChatId){
        let obj = {
          comment_id: this.reportChatId,
          report_type: "comment",
          // reported_by: user ? user.id : null,
          // guest_user_ref: {
          //   browserInfo: browserInfo,
          //   userInfo: userInfoData
          // },
          report_desc: '{"report_des_arr":[]}',
          user_id: customStorageService.getUser()?.id,
          other_Issue: $('#reportAnIssue').val()
        };

        let reportSent = await courseService.createReport(obj);
        if (reportSent.success) {
          toastr.info("Successfully reported");
          $('#reportAnIssue').val('')
          $('#report_an_issue').modal('hide'); // This line opens the modal
        } else {
          toastr.error("Something went wrong!");
        }
      }
    },
    checkZoomLink(url) {
      // Regular expression to match Zoom meeting links
      const zoomLinkRegex = /https:\/\/zoom\.us\/j\/(\d+)/;

      // Check if the input link matches the Zoom link pattern
      if (zoomLinkRegex.test(url)) {
        // Extract the meeting ID using regex capture groups
        const match = url.match(zoomLinkRegex);
        if (match && match.length > 1) {
          this.zoomMeetingId = match[1];
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    getUserName(){
      if(this.instructor && this.instructor.id) return this.instructor.full_name;
      else if(customStorageService.getUser()?.id) return customStorageService.getUser().full_name;
      return "Guest User";
    },
    jitsiMeetingEnd(){
      console.log("jitsiMeetingEnd")
      this.socket.emit('session-end')
    },
    zoomMeetingEnd(){
      console.log("zoomMeetingEnd")
      this.socket.emit('session-end')
    },
    skipFeedback(){
      this.sessionFinished = false;
      this.$router.push('/live-session');
    },
    async addFeedback() {
      this.disableBtn = true;
      this.feedback.id = customStorageService.getUid();
      this.feedback.session_id = this.session.id;
      if (!this.feedback.experience) {
        toastr.error("Please Select Feedback");
        this.disableBtn = false;
        return;
      }
      let request = await appService.addFeedback({
        user_id: this.feedback.id,
        feedback: { feedback: this.feedback },
        type: "live_session_feedback"
      });
      if (request.success) {
        this.sessionFinished = false;
        this.$router.push('/live-session');
        this.feedback.experience = 0;
        this.feedback.suggestion = "";

        toastr.success("Feedback successfully added!");
        this.disableBtn = false;
      } else {
        toastr.error("Something went wrong");
      }
    },
  },
  watch: {
    session: {
      immediate: true,
      async handler(newValue, oldValue) {
        if(newValue != oldValue && newValue.id){
          this.loaded = true;

          this.socket = saveLiveSessionChatSocketInit(
              this.instructor ? this.instructor.uid : (customStorageService.getUser()?.id ?? customStorageService.getBrowserId()),
              newValue,
              () => {
                console.log("complete")
              },
              () => {
                console.log("error while connecting socket")
              },
              this.catch_message,
              this.catch_message_reply,
              this.sessionEndCallback,
              this.catch_like_comment,
              this.catch_session_user_count
          );

          const loadIframe = setInterval( () => {
            try{
              if (newValue.url_type == 'NEARPEER') {
                const domain = 'meet.nearpeer.org';
                const options = {
                  roomName: `${newValue.name}`,
                  width: 573,
                  height: 490,
                  parentNode: document.querySelector('#meet'),
                  lang: 'en',
                  logLevel: 'error',
                  userInfo: {
                    email: this.user ? this.user.email : 'default@nearpeer.org',
                    displayName: this.user ? this.user.full_name : 'Unkown User'
                  },
                  configOverwrite: {
                    disableReactions: true,
                    disableInviteFunctions: true,
                    disableDeepLinking: true,
                    participantsPane: {
                      hideModeratorSettingsTab: true,
                      hideMoreActionsButton: true,
                    },
                    toolbarButtons: [
                      'camera',
                      'closedcaptions',
                      'desktop',
                      'download',
                      'embedmeeting',
                      'etherpad',
                      'feedback',
                      'filmstrip',
                      'fullscreen',
                      'hangup',
                      'help',
                      'highlight',
                      'linktosalesforce',
                      'livestreaming',
                      'microphone',
                      'noisesuppression',
                      'participants-pane',
                      'profile',
                      'raisehand',
                      'recording',
                      'security',
                      'select-background',
                      'settings',
                      'shareaudio',
                      'sharedvideo',
                      'shortcuts',
                      'stats',
                      'tileview',
                      'toggle-camera',
                      'videoquality',
                      'whiteboard',
                    ],
                  }
                };
                const api = new JitsiMeetExternalAPI(domain, options);
                api.addEventListener('videoConferenceLeft', (event, data) => {
                  console.log("Emitting session leave event from jitsi")
                  this.selfLeft = true;
                  this.jitsiMeetingEnd();
                });
              } else if (this.checkZoomLink(newValue.url)) {
                console.log("this is zoom link with meeting id:", this.zoomMeetingId)
              }
              clearInterval(loadIframe);
            }
            catch (e) {
              console.log("Error", e);
            }
          }, 500);

          window.addEventListener('beforeunload', (event) => {
            console.log("Emitting session leave event")
            this.selfLeft = true;
            this.socket.emit('session-end')
          });

          if(!customStorageService.getUid() && !this.instructor && newValue.is_registration_form){
            console.log("is registration form true")
            setTimeout(this.toggle_registration_form, newValue.show_registration_form_after_min * 60 * 1000);
          }

          if(!this.instructor && newValue.is_custom_form && newValue.custom_form_id && newValue.custom_form){

            if(customStorageService.getUser()?.id){
              const submitted_data = await appService.getSubmittedDataByFormIDAndUserId(newValue.custom_form_id, customStorageService.getUser().id);

              if(!(submitted_data.success && submitted_data.total)){
                setTimeout(this.toggle_custom_form, newValue.show_custom_form_after_min * 60 * 1000);
              }
            }
            else setTimeout(this.toggle_custom_form, newValue.show_custom_form_after_min * 60 * 1000);
          }
        }
      }
    },
    chats: {
      immediate: true,
      handler(newValue, oldValue) {
        if(newValue != oldValue){
          this.$nextTick(() => {
            this.scrollToBottom();
          });
          this.checkIfSelfLiked(newValue)
        }
      }
    }
  },
  mounted() {
  }
};
</script>

<style src="./chat.css" scoped></style>

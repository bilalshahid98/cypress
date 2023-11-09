<template src="./zoom-meeting.html"> </template>

<script>
// import ZoomMtgEmbedded from '@zoomus/websdk/embedded';
import liveSessionService from "../../../app-services/live-session-service";

export default {
  name: "zoom-meeting",
  props: {
    meetingNumber: null,
    role: null,
    userName: null,
  },
  data() {
    return {
      // client: ZoomMtgEmbedded.createClient(),
      authEndpoint: "",
      sdkKey: "t17MMxdLTn2N_7Zlx7PI1w",
      passWord: "",
      userEmail: "",
      registrantToken: '',
      zakToken: ''
    };
  },
  methods: {
    async getSignature() {
      const res =  await liveSessionService.generateZoomSignature({
        meetingNumber: this.meetingNumber,
        role: this.role
      })
      if(res && res.signature) {
        this.startMeeting(res.signature);
      }
    },
    startMeeting(signature) {
      let meetingSDKElement = document.getElementById('meetingSDKElement');

      this.client.init({
        debug: true,
        zoomAppRoot: meetingSDKElement,
        language: 'en-US',
        customize: {
          meetingInfo: ['topic', 'host', 'mn', 'pwd', 'telPwd', 'invite', 'participant', 'dc', 'enctype'],
          video: {
          isResizable: false,
          popper: {
            anchorElement: meetingSDKElement,
            disableDraggable: true,
            placement: 'top',
          },
          viewSizes: {
            default: {
              width: 573,
              height: 490,
            },
            ribbon: {
              width: 220,
              height: 490,
            },
          },
        },
        }
      });
      this.client.join({
        signature: signature,
        sdkKey: this.sdkKey,
        meetingNumber: this.meetingNumber,
        password: this.passWord,
        userName: this.userName,
        userEmail: this.userEmail,
        tk: this.registrantToken,
        zak: this.zakToken
      }).then((res) => {
        setInterval(() => {
          const videoCanvas = document.getElementById('zoom-sdk-video-canvas');
          console.log('videoCanvas');
          console.log(videoCanvas);
          if(!videoCanvas) this.$emit('meetingEnd');
        }, 4000)
      }).catch((e) => {
        console.log('eeeeeeee')
      });
    }
  },
  mounted() {
    console.log('mounted', this.meetingNumber, this.role, this.userName);
    this.getSignature();
  },
  created () {
  },
};
</script>

<style src="./zoom-meeting.css"></style>

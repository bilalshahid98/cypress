<template src="./score-predictor.html"></template>

<script>
import VueSpeedometer from "vue-speedometer";
import appHeader from "../shared-module/components/app-header/app-header";
import appFooter from "../shared-module/components/app-footer/app-footer.vue";
import appsidebar from "../shared-module/components/app-sidebar/app-sidebar.vue";
import { lmsBackend } from "../../environment/environment";

import AppService from "../app-services/app-service";
import customStorageService from "../app-services/custom-storage-service";
import toastr from "toastr";
import html2canvas from "html2canvas";

export default {
  name: "score-predictor",
  data() {
    return {
      // customSegmentLabels
      queryUserId: false,
      queryUserId2: false,
      user: customStorageService.getUser(),
      courseVideo: {},
      sharing: {
        title: `Hey!
Nearpeer has predicted my MDCAT scores. I'm scoring ${
          this.$store.state.mdcatScore
        } and guess what, only ${this.$store.state.mdcatPosition -
          1} students are ahead of me. Click here to check it out:`,
        description: "",
        hashtags: ""
      },
      customSegmentLabels: [
        {
          text: "50",
          position: "OUTSIDE",
          color: "#000"
        },
        {
          text: "100",
          position: "OUTSIDE",
          color: "#000"
        },
        {
          text: "150",
          position: "OUTSIDE",
          color: "#000"
          // fontSize: "19px"
        },
        {
          text: "200",
          position: "OUTSIDE",
          color: "#000"
        }
      ],
      segmentColors: ["#D01830", "#F79329", "#FDEB48", "#99C817"]
    };
  },
  components: {
    VueSpeedometer,
    "app-header": appHeader,
    "app-footer": appFooter,
    "app-sidebar": appsidebar
  },
  mounted() {
    if (this.$route.query && this.$route.query.user_id) {
      this.queryUserId = this.$route.query.user_id;
      if (!this.user) {
        this.queryUserId2 = true;
      }
      this.getScore();
      this.getScoreLink();
    } else if (
      !this.$store.state.mdcatScoreImageGenerated &&
      !customStorageService.get("score_ss")
    ) {
      setTimeout(() => {
        this.takeScreenshot();
      }, 1500);
      this.$store.commit("setMdcatScoreImageGenerated", true);
    }
    this.getLastVideo();

    let valueEl = document.getElementsByClassName("current-value");
    if (valueEl && valueEl[0]) {
      if (this.$store.state.mdcatScore >= 160) {
        valueEl[0].style.fill = "green";
      } else {
        valueEl[0].style.fill = "rgb(224, 50, 73)";
      }
    }
  },
  destroyed() {},
  methods: {
    async getScore() {
      const res = await AppService.getUserScore(this.queryUserId);
      this.$store.commit("setMdcatScore", {
        score: res.score.score_200,
        user: res.score.user,
        position: res.position,
        usersPositions: res.usersPositions
      });
    },
    async getScoreLink() {
      const res = await AppService.getUserScoreLink(this.queryUserId);
      this.$store.commit("setMdcatScoreLink", {
        link: res.shareableLink
      });
    },
    async getLastVideo() {
      const lastVideo = await AppService.getLastVideoData();
      this.courseVideo = lastVideo.course;
      this.sharing = {
        title: `Hey!
Nearpeer has predicted my MDCAT scores. I'm scoring ${
          this.$store.state.mdcatScore
        } and guess what, only ${this.$store.state.mdcatPosition -
          1} students are ahead of me. Click here to check it out:`,
        description: "",
        hashtags: ""
      };
    },
    resumeVideo() {
      this.$router.push(
        `/course/${this.courseVideo.module_index_url}/${this.courseVideo.module_id}/${this.courseVideo.video_id}?courseIndexUrl=${this.courseVideo.course_index_url}`
      );
    },
    dataURLtoFile(dataurl, filename) {
      const arr = dataurl.split(",");
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n) {
        u8arr[n - 1] = bstr.charCodeAt(n - 1);
        n -= 1; // to make eslint happy
      }
      return new File([u8arr], filename, { type: mime });
    },
    async takeScreenshot() {
      const el = this.$refs.scorePredictor;
      const options = {
        type: "dataURL"
      };
      const printCanvas = await html2canvas(el, options);
      var dataURL = printCanvas.toDataURL();
      const file = this.dataURLtoFile(dataURL, "MDCAT_score.png");
      let fd = new FormData();
      fd.append("file", file, file.name);
      return lmsBackend
        .post(
          "uploader/uploadImageToS3?type=mdcat-score&userId=" + this.user.id,
          fd,
          {
            headers: {
              "Content-Type": "multipart/form-data"
            }
            // onUploadProgress: function(progressEvent) {
            //   this.isImgUploaded = false;
            //   this.uploadPercentage = parseInt(
            //     Math.round((progressEvent.loaded / progressEvent.total) * 100)
            //   );
            // }.bind(this)
          }
        )
        .then(res => {
          if (res.data) {
            customStorageService.set("score_ss", "true");
          }
          return res.data;
        })
        .catch(err => {
          toastr.error("Oops! It seems service is down.");
          return err;
        });
    },
    copyURL() {
      const el = document.createElement("textarea");
      el.value = `${this.sharing.title} ${this.$store.state.mdcatScoreLink}`;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      toastr.info("Link Copied", "Copied");
    }
  }
};
</script>

<style src="./score-predictor.css" scoped></style>

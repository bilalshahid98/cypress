<template src="./userPosition.html"></template>

<script>
import appHeader from "../../../shared-module/components/app-header/app-header";
import appFooter from "../../../shared-module/components/app-footer/app-footer.vue";
import appsidebar from "../../../shared-module/components/app-sidebar/app-sidebar.vue";
import quizService from "../../services/quiz-service";
import toastr from "toastr";
// import AppVerification from "./../shared-module/components/app-verification/app-verification";

export default {
  name: "userPosition",
  data() {
    return {
      congratsBox: true,
      userPositions: false,
      topThirty: false,
      userpositon: 0,
      userPositionString: "",
      resultId: "",
      results: [],
      currentResult: {},
      top3: [],
      top4to6: [],
      top6to10: [],
      top11to50: [],
      left50res: [],
      right50res: [],
      loading: false,
      counter: 30,
      currentShareUrl: "",
      interval: null,
      isIntervalCleared: false,
      certificate_url: "",
      certificate_number: "",
      currentShareTitle: "",
      leftRightMerged: []
    };
  },
  components: {
    "app-header": appHeader,
    "app-footer": appFooter,
    "app-sidebar": appsidebar
    // "app-verification": AppVerification
  },
  created() {
    this.resultId = this.$route.params.id;
    this.getResultPsoitions();
    this.currentUrl =
      process.env.VUE_APP_REDIRCT_URL + window.location.pathname;
  },
  methods: {
    async getResultPsoitions() {
      try {
        this.loading = true;
        const response = await quizService.getStudentsPositions(this.resultId);
        if (response.data.status === "success") {
          const data = response.data.data;
          this.userpositon = data.postionIndex + 1;
          console.log("user position", this.userpositon);
          this.userPositionString =
            this.userpositon == 1
              ? "1st"
              : this.userpositon == 2
              ? "2nd"
              : this.userpositon == 3
              ? "3rd"
              : this.userpositon + "th";
          this.results = data.results;

          this.currentResult = data.results[data.postionIndex];
          this.currentShareUrl =
            process.env.VUE_APP_QUIZ_SERVICE_URL +
            "result/get-certificate-preview/" +
            data.results[data.postionIndex].certificate_number +
            "?preview=true";
          console.log(this.currentShareUrl);
          this.currentShareTitle = `Hi, I've scored ${this.userPositionString} position at Nearpeer's Quiz. Check out my certificate here:`;
          console.log(this.currentShareTitle);

          this.top3 = [...data.results].slice(
            0,
            data.results.length > 3 ? 3 : data.results.length
          );
          this.top4to6 =
            data.results.length > 3
              ? [...data.results].slice(
                  3,
                  data.results.length > 11 ? 11 : data.results.length
                )
              : [];
          // this.top6to10 =
          //   data.results.length > 7
          //     ? [...data.results].slice(
          //         7,
          //         data.results.length > 11 ? 11 : data.results.length
          //       )
          //     : [];
          if (this.userpositon <= 3) this.top3.splice(this.userpositon - 1, 1);

          if (this.userpositon > 3 && this.userpositon <= 11)
            this.top4to6.splice(this.userpositon - 4, 1);

          // if (this.userpositon > 6 && this.userpositon <= 10)
          // this.top6to10.splice(this.userpositon - 7, 1);

          if (this.userpositon > 10) {
            this.left50res = [...data.results].slice(
              this.userpositon - 4,
              this.userpositon - 1
            );
            this.right50res = [...data.results].slice(
              this.userpositon,
              this.userpositon + 3
            );
            this.leftRightMerged = [...this.left50res, ...this.right50res];
          }

          const vThisRef = this;
          setTimeout(function() {
            vThisRef.congratsBox = false;
            vThisRef.startCounter();
          }, 5000);
          if (!this.currentResult.certificate_url && this.userpositon <= 3) {
            const certificateResponse = await quizService.getBuildCertificate(
              this.resultId
            );
            this.currentResult.certificate_url =
              certificateResponse.data.certificate_url;
            this.certificate_url = certificateResponse.data.certificate_url;
            this.certificate_number =
              certificateResponse.data.certificate_number;
            this.currentShareUrl =
              process.env.VUE_APP_QUIZ_SERVICE_URL +
              "result/get-certificate-preview/" +
              this.certificate_number +
              "?preview=true";
          }
        } else {
          throw new Error(response.data.message || "Something went wrong");
        }
        this.loading = false;
      } catch (err) {
        this.loading = false;
        console.log(err);
        // this.$router.push("/quiz/standard-quiz-results/" + this.resultId);
      }
    },
    formatTime(sec) {
      try {
        let avgTime = "";
        sec = parseInt(sec);
        sec = sec.toFixed(0);
        sec = parseInt(sec);
        let time = new Date(sec * 1000).toISOString().substr(11, 8);
        time = time.split(":");
        if (parseInt(time[0]) > 0) {
          avgTime = time[0] + "h ";
        }
        if (parseInt(time[1]) > 0) {
          avgTime = avgTime + time[1] + "m ";
        }
        if (parseInt(time[2]) > 0) {
          avgTime = avgTime + time[2] + "s";
        }
        return avgTime;
      } catch (error) {
        console.log(error);
        return "0m";
      }
    },
    startCounter() {
      this.counter = 30;
      const vThisRef = this;
      const interval = setInterval(function() {
        vThisRef.counter--;
        if (vThisRef.counter === 0) {
          clearInterval(interval);
          vThisRef.proceeed();
        }
      }, 1000);
      this.interval = interval;
    },
    clearTimer() {
      toastr.success("Timer paused");
      clearInterval(this.interval);
      this.isIntervalCleared = true;
    },
    proceeed() {
      this.$router.push("/quiz/standard-quiz-results/" + this.resultId);
    },
    async getCertificate(download) {
      try {
        if (this.currentResult.certificate_url) {
          if (download) window.open(this.currentResult.certificate_url);
          else
            this.$router.push(
              "/quiz/certificate/" + this.currentResult.certificate_number
            );
        } else {
          if (download) window.open(this.certificate_url);
          else
            this.$router.push("/quiz/certificate/" + this.certificate_number);
        }
      } catch (err) {
        console.log(err);
        if (err.response && err.response.data && err.response.data.message)
          toastr.error(err.response.data.message);
        else toastr.error("Certificate could not be generated");
      }
    }
  }
};
</script>

<style src="./userPosition.css" scoped></style>

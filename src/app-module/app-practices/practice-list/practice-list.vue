<template src="./practice-list.html"></template>

<script>
// import customStorageService from "../app-services/custom-storage-service";
// import appService from "../app-services/app-service";
import appHeader from "../../shared-module/components/app-header/app-header";
import appFooter from "../../shared-module/components/app-footer/app-footer.vue";
import appsidebar from "../../shared-module/components/app-sidebar/app-sidebar.vue";
import AppVerification from "./../../shared-module/components/app-verification/app-verification";
import PracticeService from "./../../app-services/practice-service";
import toastr from "toastr";

export default {
  name: "practices-list",
  data() {
    return {
      attempts: []
    };
  },
  components: {
    "app-header": appHeader,
    "app-footer": appFooter,
    "app-sidebar": appsidebar,
    "app-verification": AppVerification
  },
  mounted() {
    this.getPracticeAttempts();
  },
  methods: {
    async getPracticeAttempts() {
      const res = await PracticeService.getPracticeAttempts();
      console.log(res);
      console.log(res.success);
      if (res.success) {
        this.attempts = res.results;
      }
      console.log("----");
    },

    reattemptQuiz(attempt) {
      this.$router.push("/quiz/standard-quiz-main/" + attempt.session_id);
    },

    viewResult(attempt) {
      this.$router.push("/quiz/standard-quiz-results/" + attempt._id);
    },

    backToMainPractice() {
      this.$router.push("/practices");
    }
  }
};
</script>

<style src="./practice-list.css" scoped></style>

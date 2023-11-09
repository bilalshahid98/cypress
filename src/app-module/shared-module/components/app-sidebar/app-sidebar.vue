<template src="./app-sidebar.html"></template>

<script>
import appFeedback from "../../../shared-module/components/app-feedback/app-feedback";
import customStorageService from "../../../app-services/custom-storage-service";

export default {
  name: "app-sidebar",
  components: {
    "app-feedback": appFeedback
  },
  data() {
    return {
      predictor: false,
      courses: false,
      schedule: false,
      assignment: false,
      practice: false,
      user: {},
      currentFrontendUrl: process.env.VUE_APP_REDIRCT_URL,
      practiceWt: false,
      livesession: false
    };
  },
  methods: {
    sidebar() {
      this.activeClass();
      if (window.innerWidth < 600) {
        var side = document.getElementById("nav-menu");
        var sideShadow = document.getElementById("nav-menu-shadow");
        var body_ = document.getElementById("main-body");
        body_.classList.remove("right-side-responsive");
        side.style.display = "none";
        sideShadow.style.display = "none";
      }
    },
    activeClass() {
      if (this.$route.name == "app-course-landing") {
        this.courses = true;
      } else if (this.$route.name == "AppSchedule") {
        this.schedule = true;
      } else if (this.$route.name == "AppAssignments") {
        this.assignment = true;
      } else if (this.$route.name == "AppPractices") {
        this.practice = true;
      } else if (this.$route.name == "AppLivesession") {
        this.livesession = true;
      } else if (this.$route.name == "AppLivesessionDetail") {
        this.livesession = true;
      } else if (this.$route.name == "liveChat") {
        this.livesession = true;
      } else {
        this.courses = true;
      }
    },
    goToPractice() {
      localStorage.removeItem("val");
      this.$router.push("/practices");
    },
    cancelWT() {
      localStorage.removeItem("val");
      this.practiceWt = false;
    },
    redirectToNp(){
      console.log('adadsfei')
      mixpanel.track('VL-Redirect-To-NP')
    }
  },
  async mounted() {
    let practicePopUpFirstTime = customStorageService.getPracticePopUpFirstTime();
    if (!practicePopUpFirstTime) {
      this.practiceWt = false;
      customStorageService.setPracticePopUpFirstTime("Done");
    }

    this.activeClass();
    this.user = customStorageService.getUser();
  }
};
</script>

<style src="./app-sidebar.css" scoped></style>

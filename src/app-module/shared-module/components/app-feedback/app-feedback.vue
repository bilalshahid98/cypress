<template src="./app-feedback.html"></template>

<script>
import appService from "../../../app-services/app-service";
import customStorage from "../../../../app-module/app-services/custom-storage-service";
import toastr from "toastr";
export default {
  name: "app-feedback",
  data() {
    return {
      showFeedback: false,
      terrible: false,
      poor: false,
      average: false,
      good: false,
      great: false,
      feedbackType: 1,
      selected: "",
      practice: false,
      assignment: false,
      schedule: false,
      feedbackPercentage: "",
      data: {
        id: "",
        experience: "",
        suggestion: "",
        feature: ""
      }
    };
  },
  methods: {
    userExperience(experience) {
      this.feedbackPercentage = 33.33;
      if (experience == "terrible") {
        this.terrible = true;
        this.poor = false;
        this.average = false;
        this.good = false;
        this.great = false;
      } else if (experience == "poor") {
        this.poor = true;
        this.terrible = false;
        this.average = false;
        this.good = false;
        this.great = false;
      } else if (experience == "average") {
        this.average = true;
        this.terrible = false;
        this.poor = false;
        this.good = false;
        this.great = false;
      } else if (experience == "good") {
        this.good = true;
        this.terrible = false;
        this.poor = false;
        this.average = false;
        this.great = false;
      } else if (experience == "great") {
        this.great = true;
        this.terrible = false;
        this.poor = false;
        this.average = false;
        this.good = false;
      }
      this.data.experience = experience;
      this.feedbackType = 2;
    },
    feature(feat) {
      this.feedbackPercentage = 98;
      if (feat == "practice") {
        this.practice = true;
        this.assignment = false;
        this.schedule = false;
      } else if (feat == "assignment") {
        this.assignment = true;
        this.practice = false;
        this.schedule = false;
      } else if (feat == "schedule") {
        this.schedule = true;
        this.practice = false;
        this.assignment = false;
      }
      this.data.feature = feat;
      this.feedbackType = 3;
    },
    userRecommendations() {},
    feedbackPopUp() {
      this.showFeedback = true;
    },
    back() {
      this.feedbackPercentage = this.feedbackPercentage - 33.33;
      this.feedbackType = this.feedbackType - 1;
    },
    skip() {
      this.feedbackPercentage = this.feedbackPercentage + 33.33;
      this.feedbackType = this.feedbackType + 1;
    },
    async addFeedback() {
      this.feedbackPercentage = 100;
      this.feedbackType = 4;

      this.data.id = JSON.parse(localStorage.getItem("user")).id;
      let request = await appService.addFeedback({
        user_id: this.data.id,
        feedback: { feedback: this.data },
        type: "lms_feedback"
      });
      if (request.success) {
        this.feedbackPercentage = 0;
        this.showFeedback = false;
        this.data.experience = "";
        this.data.feature = "";
        this.data.suggestion = "";
        this.data = {};
        this.refreshState();

        toastr.success("Feedback successfully added!");
      } else {
        this.showFeedback = false;
        this.data.experience = "";
        this.data.feature = "";
        this.data.suggestion = "";
        toastr.error("Something went wrong");
        this.refreshState();
      }
      this.feedbackType = 1;
    },
    refreshState() {
      this.great = false;
      this.terrible = false;
      this.poor = false;
      this.average = false;
      this.good = false;
      this.practice = false;
      this.assignment = false;
      this.schedule = false;
    }
  }
};
</script>

<style src="./app-feedback.css" scoped></style>

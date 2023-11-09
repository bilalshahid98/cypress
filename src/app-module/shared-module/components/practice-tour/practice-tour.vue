<template src="./practice-tour.html"></template>

<script>
// import customStorageService from "../../../app-services/custom-storage-service";
// import LoginService from "../../../app-services/app-login-service";

export default {
  name: "practice-tour",
  data() {
    return {
      practiceWt: false
    };
  },
  methods: {
    goToPractice() {
      this.$router.push("/practices");
      this.practiceWt = false;
    },
    cancelWT() {
      this.practiceWt = false;
    }
  },
  mounted() {}
};
</script>

<style src="./practice-tour.css"></style>

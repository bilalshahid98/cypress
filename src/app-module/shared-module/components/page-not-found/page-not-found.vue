<template src="./page-not-found.html"></template>

<script>
import customStorageService from "../../../app-services/custom-storage-service";
import LoginService from "../../../app-services/app-login-service";

export default {
  name: "app-page-not-found",

  methods: {
    logout() {
      const data = {
        session: JSON.parse(localStorage.getItem("user")).token
      };
      customStorageService.removeUser();
      customStorageService.removeUid();
      this.$store.commit("setUid", {
        uid: null
      });
      if (this.reactApp) {
        customStorageService.removeVideoDownloading();
        console.log("loggedOut"); //Donot Remove this console
      }
      LoginService.logout(data);

      this.$router.push("/login");
    }
  },
  data() {
    return {
      reactApp: false
    };
  },
  async mounted() {
    let userAgent = navigator.userAgent;
    if (userAgent.includes("React-Native-NP")) {
      this.reactApp = true;
    }
  }
};
</script>

<style src="./page-not-found.css"></style>

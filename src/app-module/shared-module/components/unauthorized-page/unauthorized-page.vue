<template src="./unauthorized-page.html"></template>

<script>
import customStorageService from "../../../app-services/custom-storage-service";
import LoginService from "../../../app-services/app-login-service";

export default {
  name: "unauthorized-page",
  methods: {
    logout() {
      const data = {
        session: JSON.parse(localStorage.getItem("user")).token
      };
      customStorageService.removeUser();
      customStorageService.removeUid();
      if (this.reactApp) {
        customStorageService.removeVideoDownloading();
        console.log("loggedOut"); //Donot Remove this console
      }
      LoginService.logout(data);

      this.$store.commit("setUid", {
        uid: null
      });
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

<style src="./unauthorized-page.css"></style>

<template src="./access-denied-popup.html"></template>

<script>
import customStorageService from "../../../app-services/custom-storage-service";
import pagination from "../../../shared-module/components/pagination/pagination";
import SingleQuestionStat from "../../../quiz-module/components/single-question-stat/single-question-stat";
import { isAndroid, isIOS } from "mobile-device-detect";

export default {
  name: "app-access-denied-pop-up",
  components: {
    "base-pagination": pagination,
    "app-single-question-stat": SingleQuestionStat
  },
  data() {
    return {
      user: {}
    };
  },
  props: {
    isMobileOrTablet: {
      type: Boolean
    }
  },
  mounted() {
    this.user = customStorageService.getUser();
  },
  methods: {
    DownloadApp() {
      if (this.isMobileOrTablet) {
        if (isIOS) {
          window.location.href = "https://www.nearpeer.org/np-link/ozpsqx5dmv";
        } else {
          window.location.href = "https://www.nearpeer.org/np-link/iowcp8ia8e";
        }
      } else {
        window.location.href = "https://www.nearpeer.org/downloadapp";
      }
    },
    closeAccessPopup() {
      this.$router.go(-1);
    }
  }
};
</script>

<style src="./access-denied-popup.css" scoped></style>

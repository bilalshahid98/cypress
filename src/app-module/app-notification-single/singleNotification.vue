<template src="./singleNotification.html"></template>

<script>
import appHeader from "../shared-module/components/app-header/app-header";
import appFooter from "../shared-module/components/app-footer/app-footer.vue";
import appsidebar from "../shared-module/components/app-sidebar/app-sidebar.vue";
import AppVerification from "./../shared-module/components/app-verification/app-verification";

export default {
  name: "AppLivesession",
  data() {
    return {
      popup: false
    };
  },
  components: {
    "app-header": appHeader,
    "app-footer": appFooter,
    "app-sidebar": appsidebar,
    "app-verification": AppVerification
  },
  methods: {
    openPopup() {
      this.popup = true;
      // document.body.style.overflowy="hidden";
    }
  },
  mounted() {
    // document.body.style.overflow="hidden";
  }
  // async mounted() {}
};
</script>

<style src="./singleNotification.css" scoped></style>

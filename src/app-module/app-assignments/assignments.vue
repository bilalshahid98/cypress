<template src="./assignments.html"></template>

<script>
import customStorageService from "../app-services/custom-storage-service";
import appService from "../app-services/app-service";
import appHeader from "../shared-module/components/app-header/app-header";
import appFooter from "../shared-module/components/app-footer/app-footer.vue";
import appsidebar from "../shared-module/components/app-sidebar/app-sidebar.vue";
import AppVerification from "./../shared-module/components/app-verification/app-verification";

export default {
  name: "assignments",
  data() {
    return {};
  },
  components: {
    "app-header": appHeader,
    "app-footer": appFooter,
    "app-sidebar": appsidebar,
    "app-verification": AppVerification
  },
  async mounted() {}
};
</script>

<style src="./assignments.css" scoped></style>

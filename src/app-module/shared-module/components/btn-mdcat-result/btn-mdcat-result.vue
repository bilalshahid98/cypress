<template src="./btn-mdcat-result.html"> </template>

<script>
import customStorageService from "../../../app-services/custom-storage-service";
import appService from "../../../app-services/app-service";
export default {
  name: "btn-mdcat-result",
  props: {
  },
  data() {
    return {
      isMDCATEnrolled: false,
    };
  },
  methods: {
    
  },
  async mounted() {
    if (customStorageService.getUser()) {
      this.user = customStorageService.getUser();

      let PaidStatus = await appService.checkUserPaidStatus();
      if (PaidStatus.isMDCATEnrolled) {
        this.isMDCATEnrolled = true;
      }
    }
  }
};
</script>

<style src="./btn-mdcat-result.css"></style>

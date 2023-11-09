<template src="./ddos-error-popup.html"></template>

<script>
import customStorageService from "../../../app-services/custom-storage-service";

export default {
  name: "app-access-denied-pop-up",
  components: {},
  data() {
    return {
      user: customStorageService.getUser()
    };
  },
  created() {},
  mounted() {},
  methods: {}
};
</script>

<style src="./ddos-error-popup.css" scoped></style>

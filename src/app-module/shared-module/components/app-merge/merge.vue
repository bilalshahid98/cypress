<template src="./merge.html"></template>

<script>
import customStorageService from "../../../app-services/custom-storage-service";
import ClickOutside from "vue-click-outside";
import AppService from "./../../../app-services/app-service";

export default {
  name: "app-merge",
  props: {
    path: String,
    users: Array,
    mergeAccount: Boolean,
    userData: Object
  },
  components: {},
  directives: {
    ClickOutside
  },
  methods: {
    getCurrentDate() {
      var today = new Date();
      let dd = today.getDate();
      let mm = today.getMonth() + 1;
      let yyyy = today.getFullYear();
      if (dd < 10) {
        dd = "0" + dd;
      }
      if (mm < 10) {
        mm = "0" + mm;
      }

      today = yyyy + "-" + mm + "-" + dd;
      this.currentDate = today;
    },
    async mergeAccountCall() {
      this.mergeMain = false;
      this.mergeWait = true;
      await AppService.mergeAccounts({ user_id: this.userID });
      this.user.is_migrated = true;
      customStorageService.setUser(this.user);
      setTimeout(() => {
        this.mergeWait = false;
        this.mergeSuccess = true;
      }, 2000);
    },
    closeMerge() {
      this.mergeAccount = false;
      this.mergeMain = true;
      this.mergeWait = false;
      this.mergeSuccess = false;
    }
  },
  data() {
    return {
      emailSent: false,
      user: "",
      userEmail: "",
      errorMessage: "",
      currentDate: "",
      dataValidated: false,
      emailSelected: false,
      phoneSelected: false,
      userPhone: "",
      userID: "",
      updateEmail: false,
      editable: true,
      skipLoading: false,
      mergeMain: true,
      provider: "",
      currentDevice: true,
      mergeWait: false,
      mergeSuccess: false
    };
  },
  async mounted() {
    this.getCurrentDate();
    if (customStorageService.getUser()) {
      this.user = customStorageService.getUser();
      this.userEmail = this.user.email;
      this.userID = this.user.id;
      this.user.provider = this.provider;
      if (this.user.phone) {
        this.userPhone = this.user.phone;
      }
    }
  },
  created() {
    this.getCurrentDate();
  }
};
</script>

<style src="./merge.css" scoped></style>

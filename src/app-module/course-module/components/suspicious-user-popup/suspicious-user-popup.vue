<template src="./suspicious-user-popup.html"></template>

<script>
import AppService from "../../../app-services/app-service";
import toastr from "toastr";

export default {
  name: "app-access-denied-pop-up",
  components: {},
  data() {
    return {
      requestSubmit: false,
      loading: false
    };
  },
  props: {
    user: String
  },
  mounted() {
    if (this.user.isPending || this.user.isRejected) {
      this.requestSubmit = true;
    }
  },
  methods: {
    async submitRequest() {
      if(this.requestSubmit) {
        this.$emit("close");
        this.requestSubmit = false;
      } else {
        if(!this.loading) {
          this.loading = true;
          await AppService.saveSuspiciousUser({ user_id: this.user.id });
          this.loading = false;
          toastr.success("Review Request Submitted Successfully");
          this.requestSubmit = true;
        }
        
      }
      
    },
    closeAccessPopup() {
      this.$emit("close");
      this.requestSubmit = false;
    }
  }
};
</script>

<style src="./suspicious-user-popup.css" scoped></style>

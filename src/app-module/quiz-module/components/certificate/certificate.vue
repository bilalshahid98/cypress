<template src="./certificate.html"></template>

<script>
import toastr from "toastr";
import quizService from "../../services/quiz-service";
// import AppVerification from "./../shared-module/components/app-verification/app-verification";

export default {
  name: "userPosition",
  data() {
    return {
      certificateId: "",
      certificateUrl: ""
    };
  },
  mounted() {
    this.certificateId = this.$route.params.id;
    this.getCertificate();
  },
  methods: {
    async getCertificate() {
      try {
        const certificatResponse = await quizService.getCertificate(
          this.certificateId
        );
        this.certificateUrl = certificatResponse.data.certificate_url;
      } catch (err) {
        if (err.response && err.response.data && err.response.data.message)
          toastr.error(err.response.data.message);
        else toastr.error("Invalid Certificate");
        setTimeout(() => {
          history.back();
        }, 3000);
      }
    }
  }
};
</script>

<style src="./certificate.css" scoped></style>

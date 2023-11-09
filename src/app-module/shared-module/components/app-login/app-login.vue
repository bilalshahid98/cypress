<template src="./app-login.html"></template>

<script>
import AppLogin from "./../../../app-login-page/login-page.vue";

export default {
  name: "app-login",
  props: {
    type: String,
    mandatory: Boolean,
  },
  components: {
    "app-login-page": AppLogin
  },
  methods: {
    openSignupPopup() {
      this.openLoginPage = true;
    },
    closeLoginPage() {
      this.openLoginPage = false;
    },
    onLogin() {
      this.$emit("onLogin");
    }
  },

  data() {
    return {
      openLoginPage: false,
    };
  },
  async mounted() {},
  created() {}
};
</script>

<style src="./app-login.css" scoped></style>

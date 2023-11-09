<template src="./quiz.html"></template>

<script>
import AppVerification from "./../shared-module/components/app-verification/app-verification";

import customStorageService from "../../app-module/app-services/custom-storage-service";
import authService from "../../app-module/app-services/auth-service";
import appService from "../../app-module/app-services/app-service";
export default {
  name: "app-quiz",
  props: {
    msg: String
  },
  components: {
    "app-verification": AppVerification
  },
  methods: {
    redirect() {
      this.showGuestLogin = false;
      this.$router.go();
    },
    async validateLogin() {
      let uid;
      let userVisited;
      let currentUser = customStorageService.getUser();
      uid = this.$route.query.uid;
      let token = this.$route.query.token;
      let isValidToken = false;
      if (uid && token) {
        const body = {
          user_id: uid,
          session: token
        };
        const isValid = await authService.validateSession(body);
        if (isValid && isValid.success) {
          isValidToken = true;
        }
      }

      if (this.$route.query.uid || currentUser) {
        let obj = {
          uid: uid,
          welcome_page: true
        };
        customStorageService.setUid(uid);
        if (this.$route.query.uid && token && isValidToken) {
          uid = this.$route.query.uid;
          this.$store.commit("setUid", {
            uid: uid
          });
          userVisited = await appService.checkUserVisited(uid);
          let user = { ...userVisited?.userVisited?.user_id };
          let userObj = { ...userVisited?.userVisited };
          user.visited = userObj;
          user.token = token;
          userObj.token = token;
          customStorageService.setUser(userObj);
          this.markLoggedin();
          location.reload();
        } else {
          this.markLoggedin();
        }
      } else {
        this.verifiedUser = false;
        this.verificationBanner = false;
        this.verificationNeeded = true;
        this.guestUser = false;
        this.showGuestLogin = false;
      }
    },
    markLoggedin() {
      this.user = customStorageService.getUser();
      if (this.user.user_type === "guest") {
        this.verifiedUser = false;
        this.verificationBanner = false;
        this.verificationNeeded = false;
        this.guestUser = false;
        let check = customStorageService.getUser();
      } else {
        if (this.user.confirmed_at) {
          this.verifiedUser = true;
        } else {
          this.verifiedUser = false;
          this.verificationBanner = true;
          this.verificationNeeded = true;
        }
      }
      this.$router.replace({ query: {} });
    }
  },
  created() {
    this.validateLogin();
  },
  async mounted() {},
  afterRouteEnter(to, from, next) {
    window.scroll(0, 0);
  },
  data() {
    return {
      verificationBanner: true,
      signupPopUp: false,
      emailVerification: false,
      verifiedUser: false,
      verificationNeeded: false,
      guestUser: false,
      showGuestLogin: false,
      path: ""
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss"></style>

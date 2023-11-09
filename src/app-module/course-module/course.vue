<template src="./course.html"></template>

<script>
import appHeader from "./../shared-module/components/app-header/app-header.vue";
import appFooter from "./../shared-module/components/app-footer/app-footer.vue";
import appsidebar from "./../shared-module/components/app-sidebar/app-sidebar.vue";
import AppVerification from "./../shared-module/components/app-verification/app-verification";
import AppLogin from "./../shared-module/components/app-login/app-login.vue";
import customStorageService from "./../app-services/custom-storage-service";
import AppService from "./../app-services/app-service";
import AppMerge from "./../shared-module/components/app-merge/merge.vue";
import AppCustomForm from "./../shared-module/components/custom-form/custom-form";

export default {
  name: "app-course",
  props: {
    msg: String
  },
  data() {
    return {
      verificationPhoneBanner: false,
      verificationBanner: false,
      signupPopUp: false,
      emailVerification: false,
      verifiedUser: false,
      verificationNeeded: false,
      guestUser: false,
      mergeAccount: false,
      users: []
    };
  },
  components: {
    "app-header": appHeader,
    "app-footer": appFooter,
    "app-sidebar": appsidebar,
    "app-verification": AppVerification,
    "app-login": AppLogin,
    "app-merge": AppMerge,
    "app-custon-form": AppCustomForm
  },
  methods: {
    openSignupPopup() {
      this.$refs.loginModal.openSignupPopup();
    },
    async checkMerge() {
      if (!this.user.is_migrated && this.$route.name === "app-course-landing") {
        const resAccounts = await AppService.getEmailAccounts({
          user_id: this.user.id
        });
        if (resAccounts.success && resAccounts.users.length > 1) {
          this.mergeAccount = true;
          this.users = resAccounts.users;
        }
      }
    }
  },
  async mounted() {
    this.user = customStorageService.getUser();
    if (this.user.user_type === "guest") {
      this.verifiedUser = false;
      this.verificationBanner = false;
      this.verificationNeeded = true;
      this.guestUser = true;
      let check = customStorageService.getUser();
      this.mergeAccount = false;
    } else {
      if (this.user.confirmed_at) {
        this.verifiedUser = true;
        this.verificationNeeded = true;
        this.mergeAccount = false;
        this.verificationBanner = false;
      } else {
        this.verifiedUser = false;
        this.verificationBanner = true;
        this.verificationNeeded = true;
        this.mergeAccount = false;
      }
      if (!this.verificationBanner && !this.user.phone_confirmed_at) {
        this.verifiedUser = false;
        this.verificationPhoneBanner = true;
        this.verificationBanner = false;
        this.verificationNeeded = true;
        this.mergeAccount = false;
      }
      try {
        const resVerification = await AppService.checkVerification(
          this.user.id
        );
        if (resVerification.emailVerified) {
          this.verifiedUser = false;
          this.verificationBanner = false;
          this.verificationNeeded = false;

          if (resVerification.phoneVerified) {
            this.verifiedUser = false;
            this.verificationPhoneBanner = false;
            this.verificationNeeded = false;
            this.mergeAccount = false;
          } else {
            this.verifiedUser = false;
            this.verificationPhoneBanner = true;
            this.verificationNeeded = true;
            this.mergeAccount = false;
          }
        } else {
          this.verifiedUser = false;
          this.verificationBanner = true;
          this.verificationPhoneBanner = false;
          this.verificationNeeded = true;
          this.mergeAccount = false;
        }
      } catch (error) {
        console.log(error);
      }

      // this.checkMerge();
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.margin-div {
  margin-top: -65px;
}
</style>

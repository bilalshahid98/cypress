<template src="./app-otp.html"></template>

<script>
import customStorageService from "../../../app-services/custom-storage-service";
import ClickOutside from "vue-click-outside";
import toastr from "toastr";
import LoginService from "./../../../app-services/app-login-service";

export default {
  name: "app-otp",
  props: {
    banner: Boolean,
    enterOTP: Boolean,
    OTP: Boolean,
    logoutAll: Boolean,
    path: String,
    from: String,
    sessions: Array,
    userData: Object,
    otpVerification: String,
    type: String,
  },
  components: {},
  directives: {
    ClickOutside
  },
  methods: {
    onKeydown(event) {
      const char = String.fromCharCode(event.keyCode);
      if (!/[0-9]/.test(char) && event.keyCode != 91 && event.keyCode != 86) {
        event.preventDefault();
        // event.target.nextElementSibling.focus();
      }
    },
    backVerification() {
      if (!this.logoutAll && !this.enterOTP) {
        this.logoutAll = true;
      } else {
        this.logoutAll = false;
        this.enterOTP = false;
        this.clearOtp();
      }
    },
    checkKey(event, model) {
      if (
        event.key === "Backspace" ||
        (event.keyCode === 229 && !event.target.value)
      ) {
        event.target.value = "";
        event.target.previousElementSibling.focus();
        if (model === 1) {
          this.digit1 = "";
        } else if (model === 2) {
          this.digit2 = "";
        } else if (model === 3) {
          this.digit3 = "";
        } else if (model === 4) {
          this.digit4 = "";
        } else if (model === 5) {
          this.digit5 = "";
        } else if (model === 6) {
          this.digit6 = "";
        }
      } else {
        if (event.target.value) {
          event.target.nextElementSibling.focus();
        }
      }
    },
    async sendOtp(type) {
      if (type === "phone") {
        this.enterOTP = true;
        this.phoneSelected = true;
        this.emailSelected = false;
      } else {
        this.enterOTP = true;
        this.phoneSelected = false;
        this.emailSelected = true;
      }
      const data = {
        user_id: this.userData.id,
        type: type
      };
      let loginResponse = await LoginService.sendOTP(data);
    },
    async resendOtp() {
      const data = {
        user_id: this.userData.id,
        type: this.phoneSelected ? "phone" : "email"
      };
      await LoginService.resendOtp(data);
      this.clearOtp();
      toastr.success("OTP sent!");
    },
    clearOtp() {
      this.digit1 = "";
      this.digit2 = "";
      this.digit3 = "";
      this.digit4 = "";
      this.digit5 = "";
      this.digit6 = "";
    },
    onPasteOTP(event, num) {
      var clipboardData = event.clipboardData || window.clipboardData;
      var pastedData = clipboardData.getData("Text");
      const data = pastedData.split("");
      this.digit1 = data[0];
      this.digit2 = data[1];
      this.digit3 = data[2];
      this.digit4 = data[3];
      this.digit5 = data[4];
      this.digit6 = data[5];
      document.getElementById("digit-6").focus();
    },
    async skipValidate() {
      try {
        this.skipLoading = true;
        const formData = {
          user_id: this.userData.id,
          origin: "LMS"
        };
        let validationResponse = await LoginService.skipValidate(formData);
        if (validationResponse.success && validationResponse.token) {
          await customStorageService.setUid(validationResponse.user.id);
          let user = validationResponse.user;
          user.token = validationResponse.token;
          customStorageService.setUser(user);
          if (this.reactApp) {
            console.log("userToken" + user.token);
            console.log("userID" + user.id);
            console.log("loggedIn");
          }
          toastr.success("Successfully Logged In!");
          this.OTP = false;
          this.enterOTP = false;
          if(this.type === 'quizSubmit') {
            this.$emit("onLogin");
          }else if(this.type === 'liveSession') {
            this.$emit("onLoginLiveSession");
          } else {
            if (this.from) {
              this.$router.go(-1);
            } else {
              if (((user || {}).user_visits || {}).visited_welcome_page) {
                this.$router.push("/course/course-landing");
              } else {
                this.$router.push("/landing");
              }
            }
            setTimeout(() => {
              window.location.reload();
            }, 300);
          }
          

          
        } else {
          toastr.error("Session error");
        }
        this.skipLoading = false;
      } catch (err) {
        console.log("Error in OTP");
      }
    },
    async sendOTPConfirmation() {
      var data =
        this.digit1 +
        this.digit2 +
        this.digit3 +
        this.digit4 +
        this.digit5 +
        this.digit6;
      const formData = {
        user_id: this.userData.id,
        code: data,
        session: this.selectedSession.session,
        type: this.otpVerification,
        removeAllSession: this.removeAllSession,
        origin: "LMS"
      };
      let validationResponse = await LoginService.validateOTP(formData);
      // console.log(validationResponse);
      if (validationResponse.success && validationResponse.token) {
        await customStorageService.setUid(validationResponse.user.id);
        let user = validationResponse.user;
        user.token = validationResponse.token;
        customStorageService.setUser(user);
        if (this.reactApp) {
          console.log("userToken" + user.token);
          console.log("userID" + user.id);
          console.log("loggedIn");
        }
        toastr.success("Successfully Logged In!");
        this.otpSuccess = true;
        this.OTP = false;
        this.enterOTP = false;
        if(this.type === 'quizSubmit') {
          this.$emit("onLogin");
        }else if(this.type === 'liveSession') {
          this.$emit("onLoginLiveSession");
        } else {
          if (this.from) {
            this.$router.go(-1);
          } else {
            if (((user || {}).user_visits || {}).visited_welcome_page) {
              this.$router.push("/course/course-landing");
            } else {
              this.$router.push("/landing");
            }
          }
          setTimeout(() => {
            window.location.reload();
          }, 300);
        }
        
      } else if (validationResponse.success) {
        toastr.success("OTP Verified!");
        customStorageService.setUser(validationResponse.user);
        setTimeout(() => {
          window.location.reload();
        }, 300);
      } else {
        this.otpError = "Invalid OTP";
        toastr.error("Invalid OTP!");
      }
      // console.log("DATA",data);
    },
    async changeEmail() {
      this.emailVerification = false;
      this.missingEmail = true;
      this.updateEmail = true;
    },

    getUserData() {
      if (this.userData.provider === "email") {
        this.userEmail = this.userData.email;
      } else if (this.userData.provider === "facebook") {
        this.userEmail = this.userData.fb_email
          ? this.userData.fb_email
          : this.userData.email;
      } else if (this.userData.provider === "apple") {
        this.userEmail = this.userData.apple_email
          ? this.userData.apple_email
          : this.userData.email;
      } else if (this.userData.provider === "google") {
        this.userEmail = this.userData.email;
      }
      this.splitEmail = [];
      if (this.userEmail) {
        this.splitEmail = this.userEmail.split("@");
      }
      if (
        this.userData.phone &&
        (this.userData.phone.length === 11 ||
          this.userData.phone.length === 12) &&
        !isNaN(this.userData.phone)
      ) {
        this.userPhone = this.userData.phone;
      }
    }
  },

  data() {
    return {
      user: "",
      userEmail: "",
      errorMessage: "",
      emailSelected: false,
      phoneSelected: false,
      userPhone: "",
      digit1: "",
      digit2: "",
      digit3: "",
      digit4: "",
      digit5: "",
      digit6: "",
      selectedSession: "",
      userID: "",
      updateEmail: false,
      editable: true,
      splitEmail: [],
      skipLoading: false,
      otpError: "",
      otpSuccess: false,
      removeAllSession: false,
      reactApp: false
    };
  },
  async mounted() {
    if (this.enterOTP) {
      this.userPhone = this.userData.phone;
      this.phoneSelected = true;
    }
    var userAgent = navigator.userAgent;
    if (userAgent.includes("React-Native-NP")) {
      this.reactApp = true;
    }
  },
  created() {}
};
</script>

<style src="./app-otp.css" scoped></style>

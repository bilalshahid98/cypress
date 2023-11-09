<template src="./app-verification.html"></template>

<script>
import { eventBus } from "../../../../main";
import customStorageService from "../../../app-services/custom-storage-service";
import ClickOutside from "vue-click-outside";
import toastr from "toastr";
import appService from "../../../app-services/app-service";
import validatorService from "../../../app-services/validator-service";
import LoginService from "./../../../app-services/app-login-service";
import AppOtp from "../app-otp/app-otp";

export default {
  name: "app-verification",
  props: {
    collapse: Boolean,
    banner: Boolean,
    phoneBanner: Boolean,
    signupPopUp: Boolean,
    emailVerification: Boolean,
    guestUser: Boolean,
    missingEmail: Boolean,
    showGuestLogin: Boolean,
    path: String,
    sessions: Array,
    mergeAccount: Boolean,
    userData: Object
  },
  components: {
    "app-otp": AppOtp
  },
  directives: {
    ClickOutside
  },
  methods: {
    closeSignup() {
      this.signupPopUp = false;
    },
    closeEmail() {
      document.getElementById("nav-bar").style.zIndex = "11";
      this.emailVerification = false;
      if (this.reactApp) {
        console.log("popup-close");
      }
      this.emailSent = false;
      this.editable = true;
    },
    closePhone() {
      document.getElementById("nav-bar").style.zIndex = "11";
      this.phoneVerification = false;
      if (this.reactApp) {
        console.log("popup-close");
      }
      this.emailSent = false;
      this.editable = true;
    },
    async openEmailVerification() {
      if (document.getElementById("nav-bar")) {
        document.getElementById("nav-bar").style.zIndex = "10";
      }
      this.emailVerification = true;
      var user = await customStorageService.getUser();
      this.missingCredentials.email = user.email;

      if (this.reactApp) {
        console.log("popup-open");
      }
    },
    async openPhoneVerification() {
      const navBar = document.getElementById("nav-bar");
      if (navBar) navBar.style.zIndex = "10";
      var user = await customStorageService.getUser();
      var userPhone = "";
      if (user.phone && user.phone.startsWith("92")) {
        userPhone = user.phone.substring(2);
      } else if (user.phone && user.phone.startsWith("0")) {
        userPhone = user.phone.substring(1);
      } else {
        userPhone = user.phone;
      }
      this.missingCredentials.phone = userPhone;

      if (this.reactApp) {
        console.log("popup-open");
      }
      this.phoneVerification = true;
      setTimeout(() => {
        $("#country-verify").countrySelect({
          defaultCountry: this.missingCredentials.countryCode
            ? this.missingCredentials.countryCode
            : "pk",
          preferredCountries: ["pk"],
          localizedCountries: {}
        });
      }, 300);
    },
    backVerifyPopup() {
      this.editable = true;
      this.emailSent = false;
    },
    async sendEmailVerification(data) {
      let requestEmailResponse = await LoginService.requestEmailConfirmation({
        email: data,
        url: process.env.VUE_APP_LMS_HOME
      });
      if (requestEmailResponse.success) {
        this.emailSent = true;
        toastr.success("Email Verification Sent!");
        return true;
      } else {
        toastr.error("Email Verification Not Sent!");
        return false;
      }
    },
    async postMissingCredentials(data, status, type) {
      let userID;
      if (customStorageService.getUser()) {
        let user = customStorageService.getUser();
        userID = user.id;
      }
      let isAllowUpdate = true;
      if (type === "phone") {
        const selectedCountry = $("#country-verify").countrySelect(
          "getSelectedCountryData"
        );
        data.countryCode = selectedCountry.phone_code;
        if (data.phone.startsWith("0")) {
          data.phone = data.phone.substring(1);
        }
        if (
          data.countryCode == "92" &&
          (!data.phone.startsWith("3") || data.phone.length != 10)
        ) {
          this.errorMessage = "Enter Valid phone Ex. 3*******";
          setTimeout(() => {
            this.errorMessage = "";
          }, 3000);
          isAllowUpdate = false;
        }
      }
      if (isAllowUpdate) {
        if (status === "update" || status === "update-close") {
          let body = {
            id: userID
          };
          if (type === "phone") {
            body.phone = data.phone;
            body.countryCode = data.countryCode;
            if (data.countryCode) {
              body.uidPhone = data.countryCode + data.phone;
            } else {
              body.uidPhone = 92 + data.phone;
            }
          } else {
            body.email = data;
          }
          let updateResponse = await LoginService.updateEmail(body);
          if (updateResponse.success) {
            const reqdata = {
              user_id: userID,
              type: type
            };
            if (type === "phone") {
              let newData = customStorageService.getUser();
              if (type === "phone") {
                newData.phone = data.phone;
                newData.uid_phone = data.countryCode + data.phone;
                newData.country_code = data.countryCode;
                this.userPhone = data.phone;
              } else {
                newData.email = data;
                this.userEmail = data;
              }
              this.user = newData;
              customStorageService.setUser(newData);

              if (status === "update-close") {
                this.verificationNeeded = false;
                if (this.reactApp) {
                  console.log("popup-close");
                }
                this.phoneVerification = false;
                this.emailSent = false;
                this.editable = true;
              } else {
                let loginResponse = await LoginService.sendOTP(reqdata);
                this.verificationNeeded = true;
                if (this.reactApp) {
                  console.log("popup-close");
                }
                this.phoneVerification = false;
                this.emailSent = false;
                this.editable = true;
              }
            } else {
              let verify = this.sendEmailVerification(data);
              if (verify) {
                // toastr.success("Email Updated Successfully!");
                let newData = customStorageService.getUser();
                if (type === "phone") {
                  newData.phone = data;
                  this.userPhone = data;
                } else {
                  newData.email = data;
                  this.userEmail = data;
                }

                customStorageService.setUser(newData);
              }
            }
          } else {
            if (updateResponse.message) {
              toastr.error(updateResponse.message);
              this.errorMessage = updateResponse.message;
              setTimeout(() => {
                this.errorMessage = null;
              }, 3000);
            } else {
              toastr.error("Something went Wrong!");
            }
          }
        } else {
          if (type === "phone") {
            const data = {
              user_id: this.userID,
              type: type
            };
            let loginResponse = await LoginService.sendOTP(data);
            this.verificationNeeded = true;
            if (this.reactApp) {
              console.log("popup-close");
            }
            this.phoneVerification = false;
            this.emailSent = false;
            this.editable = true;
          } else {
            this.sendEmailVerification(data);
          }
        }
      }
    },
    async postSignup(data) {
      if (!this.loader) {
        this.loader = true;
        this.errorMessage = "";
        // this.userEmail = data.email;
        try {
          const selectedCountry = $("#country-verify").countrySelect(
            "getSelectedCountryData"
          );
          data.countryCode = selectedCountry.phone_code;
          if (data.contact.startsWith("0")) {
            data.contact = data.contact.substring(1);
          }
          data.browser_id = customStorageService.getUser().browser_id;
          data.id = customStorageService.getUser().id;
          data.user_type = "student";
          const fields = [
            "full_name",
            "email",
            "contact",
            "password",
            "gender",
            "dob"
          ];
          let isDataValidated = await validatorService.validate(
            fields,
            this.signUp
          );
          if (isDataValidated) {
            throw new Error(isDataValidated);
          } else if (this.signUp.password != this.signUp.confirmPassword) {
            throw "Password doesn't match";
          } else if (
            data.countryCode == "92" &&
            (!data.contact.startsWith("3") || data.contact.length !== 10)
          ) {
            throw "Enter a valid contact Ex: 3*********";
          } else {
            let d = new Date(data.dob);
            data.dob = d;
            data.phone = data.countryCode + data.contact;
            let signupResponse = await LoginService.registerGuest(data);
            if (signupResponse.success) {
              let oldToken = customStorageService.getUser().token;
              let updatedUser = signupResponse.user;
              updatedUser.token = oldToken;
              customStorageService.setUser(updatedUser);
              toastr.success("Account Created Successfully!");

              this.$router.push("/landing");
              Object.keys(this.signUp).forEach(element => {
                this.signUp[element] = "";
              });
              this.signupPopUp = false;
            } else {
              throw res.msg;
            }
          }
          this.loader = false;
        } catch (error) {
          if (error == "ReferenceError: res is not defined") {
            this.errorMessage = "Email already exist";
            toastr.error(this.errorMessage);
          } else {
            this.errorMessage = error;
            toastr.error(this.errorMessage);
          }
          this.loader = false;
        }
      }
    },
    async postSignupAsGuest() {
      this.dataValidated = true;
      this.errorMessage = "";
      try {
        let browserId;
        if (appService.getCookie("browserId")) {
          browserId = appService.getCookie("browserId");
        } else {
          browserId = appService.getBrowserId();
          appService.setCookie("browserId", browserId, 100);
        }
        let loginResponse = await LoginService.signupAsGuest({
          browser_id: browserId
        });
        await customStorageService.setUid(loginResponse.user.id);
        // let oldToken = customStorageService.getUser().token;
        let user = loginResponse.user;
        user.token = loginResponse.token;
        // user.token = oldToken;
        customStorageService.setUser(user);
        toastr.success("Successfully Logged In!");
        this.$parent.redirect();
        this.$router.push(this.path);
      } catch (error) {
        this.errorMessage = error;
        console.log(error);
        this.dataValidated = false;
      }
    },
    async clickLogin() {
      this.$router.push("/login?from=quiz");
    },
    withoutVerification() {
      this.emailVerification = false;
      if (this.reactApp) {
        console.log("popup-close");
      }
    },
    closePopup() {
      this.verificationNeeded = false;
    },
    async changeEmail() {
      this.emailVerification = false;
      if (this.reactApp) {
        console.log("popup-close");
      }
      this.missingEmail = true;
      this.updateEmail = true;
    },
    getFormattedDate(date) {
      var year = date.getFullYear();

      var month = (1 + date.getMonth()).toString();
      month = month.length > 1 ? month : "0" + month;

      var day = date.getDate().toString();
      day = day.length > 1 ? day : "0" + day;

      return month + "/" + day + "/" + year;
    },
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
    saveRecommendation(score) {
      appService.saveRecommendation({ score, moduleId: this.moduleId });
      this.isRecomendationBanner = false;
      this.recomendationDone = true;
      toastr.info("Thank you for your feedback!");
    }
  },

  data() {
    return {
      signUp: {
        email: "",
        password: "",
        confirmPassword: "",
        full_name: "",
        contact: "",
        countryCode: 92,
        user_type: "",
        gender: "",
        dob: ""
      },
      missingCredentials: {
        email: "",
        countryCode: 92,
        contact: "",
        phone: ""
      },
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
      editable: false,
      skipLoading: false,
      mergeMain: true,
      phoneVerification: false,
      verificationNeeded: false,
      forceEnter: false,
      reactApp: false,
      currentUser: customStorageService.getUser(),
      vidPage: false,
      moduleId: 0,
      isRecomendationBanner: false,
      isPaidUser: false,
      isMDCATEnrolled: false,
      recomendationDone: false
    };
  },
  async mounted() {
    eventBus.$on("show-phone-popup", data => {
      const eventUser = customStorageService.getUser();
      if (
        !eventUser.phone &&
        !eventUser.uid_phone &&
        !this.$store.state.isNewReactNative
      ) {
        this.forceEnter = true;
        this.openPhoneVerification();
      }
    });
    this.getCurrentDate();
    if (this.user.phone) {
      this.userPhone = this.user.phone;
    }

    var userAgent = navigator.userAgent;
    if (this.$route.name === "app-video-main") {
      this.moduleId = this.$route.params.moduleNo;
      this.vidPage = true;
    } else {
      this.moduleId = 0;
      this.vidPage = false;
    }

    if (userAgent.includes("React-Native-NP")) {
      this.reactApp = true;
    }

    if (this.signupPopUp) {
      setTimeout(() => {
        $("#country-verify-signup").countrySelect({
          defaultCountry: "pk",
          preferredCountries: ["pk"],
          localizedCountries: {}
        });
      }, 800);
    }

    if (customStorageService.getUser()) {
      this.user = customStorageService.getUser();

      if (this.user.phone && this.user.phone.startsWith("92")) {
        this.userPhone = this.user.phone.substring(2);
      } else if (this.user.phone && this.user.phone.startsWith("0")) {
        this.userPhone = this.user.phone.substring(1);
      } else {
        this.userPhone = this.user.phone;
      }

      this.userEmail = this.user.email;
      this.userCountryCode = this.user.country_code;
      this.missingCredentials.email = this.userEmail;
      this.missingCredentials.phone = this.userPhone;
      this.missingCredentials.countryCode = this.userCountryCode
        ? this.userCountryCode
        : 92;
      this.userID = this.user.id;

      let PaidStatus = await appService.checkUserPaidStatus();
      if (PaidStatus.isPaidUser) {
        this.isPaidUser = true;
      }
      if (PaidStatus.isMDCATEnrolled) {
        this.isMDCATEnrolled = true;
      }
      if (this.vidPage && PaidStatus.isPaidUser) {
        // this.isRecomendationBanner = true;
      }
    }
  },
  destroyed() {
    document.getElementById("nav-bar").style.zIndex = "11";
  },
  created() {
    this.getCurrentDate();
  },
  watch: {
    $route(to, from) {
      if (to.name === "app-video-main") {
        this.vidPage = true;
        this.moduleId = to.params.moduleNo;
      } else {
        this.vidPage = false;
        this.moduleId = 0;
      }
      if (this.vidPage && this.isPaidUser && !this.recomendationDone) {
        // this.isRecomendationBanner = true;
      } else {
        this.isRecomendationBanner = false;
      }
    }
  }
};
</script>

<style src="./app-verification.css" scoped></style>

<template src="./login-page.html"></template>

<script>
import Vue from "vue";
import VueFormulate from "@braid/vue-formulate";
import LoginService from "./../app-services/app-login-service";
import validatorService from "./../app-services/validator-service";
import CustomStorageService from "./../app-services/custom-storage-service";
import appService from "./../app-services/app-service";
import toastr from "toastr";
import facebookLogin from "facebook-login-vuejs";
import GoogleSignInButton from "vue-google-signin-button-directive";
import jwt_decode from "jwt-decode";
import customStorageService from "./../app-services/custom-storage-service";
import AppOtp from "./../shared-module/components/app-otp/app-otp";
import SuspiciousUserPopup from "../course-module/components/suspicious-user-popup/suspicious-user-popup";

import CryptoJS from "crypto-js";

Vue.use(VueFormulate);

var OtpType;
export default {
  name: "app-login-page",
  props: {
    guestMode: Boolean,
    type: String,
    mandatory: Boolean,
  },
  directives: {
    GoogleSignInButton
  },
  components: {
    facebookLogin,
    "app-otp": AppOtp,
    "suspicious-user-popup": SuspiciousUserPopup
  },
  data() {
    return {
      form: {
        signIn: true,
        signUp: false,
        forget: false,
        confirmation: false,
        currentDate: "",
        otp: false,
        otpCode: false,
      },
      signIn: {
        email: "",
        your_password: "",
        remember_me: false
      },
      signUp: {
        email: "",
        password: "",
        confirmPassword: "",
        full_name: "",
        contact: "",
        user_type: "",
        gender: "",
        dob: "",
        countryCode: 92
      },
      forget: {
        email: ""
      },
      loginOtp: {
        email: ""
      },
      errorMessage: "",
      user_email: "",
      verificationNeeded: false,
      sessions: [],
      user: {},
      // params: {
      //   client_id:
      //     "715283382661-7rfvtjhs9eaofrhkn50017d4kg7862mh.apps.googleusercontent.com",
      // },
      clientId: process.env.VUE_APP_GOOGLE_CLIENT_ID,
      loader: false,
      OTP: true,
      logoutAll: true,
      enterOTP: false,
      otpVerification: "",
      reactApp: false,
      appObject: [],
      objectFromReact: "",
      suspiciousUser: {},
      isSuspiciousUser: false,
      digit1: "",
      digit2: "",
      digit3: "",
      digit4: "",
      digit5: "",
      digit6: "",
      otpUserId: '',
    };
  },

  async mounted() {
    mixpanel.track("VL-Login-Page", {});
    var userAgent = navigator.userAgent;

    if (userAgent.includes("React-Native-NP")) {
      this.reactApp = true;
    }
    document.addEventListener(
      "AppleIDSignInOnSuccess",
      this.appleSigninSuccess
    );
    this.getCurrentDate();
    let rem_me = customStorageService.get("remember_me");
    if (rem_me) {
      let decPassword = this.decrypt(rem_me.your_password);
      this.signIn.email = rem_me.email;
      this.signIn.your_password = decPassword;
      this.signIn.remember_me = rem_me.remember_me;
      document.getElementById("email").style.backgroundColor = "#dc354521";
      document.getElementById("password").style.backgroundColor = "#dc354521";
    }
  },
  methods: {
    onLoginLiveSession() {
      this.$emit("onLoginLiveSession");
    },
    onLogin() {
      this.$emit("onLogin");
    },
    closeSusPopup() {
      this.isSuspiciousUser = false;
    },

    closePopup() {
      this.verificationNeeded = false;
    },
    encrypt(text) {
      return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
    },

    decrypt(data) {
      return CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
    },
    handleLoignForm() {
      this.$emit("closeLoginPage");
    },
    async googleForReactApp() {
      console.log("googleClicked");
    },
    async facebookForReactApp() {
      console.log("facebookClicked");
    },
    async appleForReactApp() {
      console.log("applePressed");
    },
    async OnGoogleAuthSuccess(idToken) {
      if (this.reactApp) {
        console.log("inGoogle");
      }
      console.log("BeforeEnter");
      var token = idToken;
      let browserId = appService.getBrowserId();
      appService.setCookie("browserId", browserId, 7);
      var decoded = jwt_decode(token);
      let obj = {
        user: {
          jwt: idToken,
          email: decoded.email ? decoded.email : null,
          name: decoded.name ? decoded.name : null,
          img: decoded.picture
        },
        browserId,
        origin: "LMS"
      };
      let googleLoggedIn = await appService.googleLogin(obj);
      mixpanel.track("VL-Google-login", {
        User_Email: googleLoggedIn.user.email,
        User_ID: googleLoggedIn.user.id
      });
      if (googleLoggedIn.success) {
        let currentUser = JSON.parse(localStorage.getItem("user"));
        if (currentUser && currentUser.token && !googleLoggedIn.token) {
          googleLoggedIn.token = authToken;
        }
        googleLoggedIn.user.token = googleLoggedIn.token;
        toastr.success("Successfully Logged In!");
        CustomStorageService.setUser(googleLoggedIn.user);
        if (this.reactApp) {
          console.log("userToken" + googleLoggedIn.user.token);
          console.log("userID" + googleLoggedIn.user.id);
          console.log("loggedInGuest");
        }
        if(this.type === 'quizSubmit') {
          this.$emit("onLogin");
        }
        else if(this.type === 'liveSession') {
          this.$emit("onLoginLiveSession");
        } else {
          if (this.$route.query.from) {
            this.$router.go(-1);
          } else if (this.$route.name === "app-course-landing") {
            this.$router.go();
          } else {
            if (
              (((googleLoggedIn || {}).user || {}).user_visits || {})
                .visited_welcome_page
            ) {
              this.$router.push("/course/course-landing");
            } else {
              this.$router.push("/landing");
            }
          }
        }
        
      } else if (googleLoggedIn.data.code === "LIMIT_REACHED") {
        this.verificationNeeded = true;
        this.sessions = googleLoggedIn?.data?.data?.sessions;
        this.user = googleLoggedIn?.data?.user;
        throw googleLoggedIn.data?.data?.message;
      } else {
        toastr.error(googleLoggedIn.message);
      }
    },
    OnGoogleAuthFail(error) {
      console.log("error");
      console.log(error);
      toastr.error(error);
      if (this.reactApp) {
        console.log("googleLoginFailed");
        console.log(error);
      }
    },
    async googleAppSpecific(idToken) {
      if (this.reactApp) {
        console.log("inGoogle");
      }
      console.log("BeforeEnter");
      var token = idToken;
      let browserId = appService.getBrowserId();
      appService.setCookie("browserId", browserId, 7);
      var decoded = jwt_decode(token);
      let obj = {
        user: {
          jwt: idToken,
          email: decoded.email ? decoded.email : null,
          name: decoded.name ? decoded.name : null,
          img: decoded.picture
        },
        browserId,
        origin: "LMS"
      };
      let googleLoggedIn = await appService.googleLogin(obj);
      if (googleLoggedIn.success) {
        googleLoggedIn.user.token = googleLoggedIn.token;
        toastr.success("Successfully Logged In!");
        CustomStorageService.setUser(googleLoggedIn.user);
        if (this.reactApp) {
          console.log("userToken" + googleLoggedIn.user.token);
          console.log("userID" + googleLoggedIn.user.id);
          console.log("loggedInGuest");
        }
        if(this.type === 'quizSubmit') {
          this.$emit("onLogin");
        }
        else if(this.type === 'liveSession') {
          this.$emit("onLoginLiveSession");
        } else {
          if (this.$route.query.from) {
            this.$router.go(-1);
          } else if (this.$route.name === "app-course-landing") {
            this.$router.go();
          } else {
            if (
              (((googleLoggedIn || {}).user || {}).user_visits || {})
                .visited_welcome_page
            ) {
              this.$router.push("/course/course-landing");
            } else {
              this.$router.push("/landing");
            }
          }
        }
        
      } else if (googleLoggedIn.data.code === "LIMIT_REACHED") {
        this.verificationNeeded = true;
        this.sessions = googleLoggedIn?.data?.data?.sessions;
        this.user = googleLoggedIn?.data?.user;
        throw googleLoggedIn.data?.data?.message;
      } else {
        toastr.error(googleLoggedIn.message);
      }
    },
    async appleSigninSuccess(data) {
      try {
        this.objectFromReact = "";
        let browserId = appService.getBrowserId();
        appService.setCookie("browserId", browserId, 7);
        let appleObj;
        if (this.reactApp) {
          console.log(JSON.stringify(data));
          var nameStr = await data.email.split("@");
          console.log(nameStr[0]);
          console.log(nameStr[1]);
          appleObj = data;
        } else {
          appleObj = data.detail;
        }

        let obj = {
          user: {
            jwt: appleObj.authorization
              ? appleObj.authorization.id_token
              : appleObj.id_token,
            email: appleObj.user ? appleObj.user.email : appleObj.email,
            name: appleObj.user
              ? appleObj.user.name
              : appleObj.name
              ? appleObj.name
              : null
          },
          browserId,
          origin: "LMS"
        };
        console.log("Apple INIT");

        let appleLoggedIn = await appService.appleLogin(obj);
        if (appleLoggedIn.success) {
          console.log("Apple Success");
          appleLoggedIn.user.token = appleLoggedIn.token;
          CustomStorageService.setUser(appleLoggedIn.user);
          if (this.reactApp) {
            console.log("userToken" + appleLoggedIn.token);
            console.log("userID" + appleLoggedIn.user.id);
            console.log("loggedInGuest", appleLoggedIn.user);
          }
          toastr.success("Successfully Logged In!");
          if(this.type === 'quizSubmit') {
            this.$emit("onLogin");
          }
          else if(this.type === 'liveSession') {
            this.$emit("onLoginLiveSession");
          } else {
            if (this.$route.query.from) {
              console.log("Apple -1");

              this.$router.go(-1);
            } else if (this.$route.name === "app-course-landing") {
              console.log("Apple Router");

              this.$router.go();
            } else {
              if (
                (((appleLoggedIn || {}).user || {}).user_visits || {})
                  .visited_welcome_page
              ) {
                console.log("Apple Landing");

                this.$router.push("/course/course-landing");
              } else {
                this.$router.push("/landing");
                console.log("Apple Landing -1");
              }
            }
          }
          
        } else if (appleLoggedIn.data.code === "LIMIT_REACHED") {
          this.verificationNeeded = true;
          this.sessions = appleLoggedIn?.data?.data?.sessions;
          this.user = appleLoggedIn?.data?.user;
          console.log("APple limit");
          console.log(appleLoggedIn.data);

          throw appleLoggedIn.data?.data?.message;
        } else {
          toastr.error(appleLoggedIn.message);
          console.log("Apple Failed");
          console.log(appleLoggedIn.message);
        }
      } catch (err) {
        console.log("Error in Apple Login");
        console.log(err);
        console.log(JSON.stringify(err));
      }
    },
    getCurrentDate() {
      let today = new Date();
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
    filter(type) {
      this.errorMessage = "";
      Object.keys(this.form).forEach(element => {
        if (element == type) {
          this.form[element] = true;
        } else {
          this.form[element] = false;
        }
      });

      if (type === "signUp") {
        setTimeout(function() {
          $("#country").countrySelect({
            defaultCountry: "pk",
            preferredCountries: ["pk"],
            localizedCountries: {}
          });
        }, 300);
      }
    },
    async rememberMe(check) {
      if (check) {
        let encPassword = this.encrypt(this.signIn.your_password);

        let rememberData = {
          email: this.signIn.email,
          your_password: encPassword,
          remember_me: this.signIn.remember_me
        };

        CustomStorageService.set("remember_me", rememberData);
      } else {
        localStorage.removeItem("remember_me");
      }
    },
    async post(data) {
      console.log('this.type')
      console.log(this.type)
      mixpanel.track("VL-Email-Login", {
        User_Email: data.email,
        User_Password: data.password
      });
      if (!this.loader) {
        this.loader = true;
        this.errorMessage = "";
        try {
          const fields = ["your_password"];
          let isDataValidated = await validatorService.validate(
            fields,
            this.signIn
          );
          if (isDataValidated) {
            throw new Error(isDataValidated);
          } else {
            data.password = data.your_password;
            let browserId = appService.getBrowserId();
            appService.setCookie("browserId", browserId, 7);
            data.browser_id = browserId;
            let loginResponse = await LoginService.login(data);
            if (loginResponse.token) {
              await CustomStorageService.setUid(loginResponse.user.id);
              let user = loginResponse.user;
              user.token = loginResponse.token;
              CustomStorageService.setUser(user);

              if (this.reactApp) {
                console.log("userToken" + user.token);
                console.log("userID" + user.id);
                console.log("loggedInGuest", user);
              }

              //  window.onmessage('loggedInGuest');
              toastr.success("Successfully Logged In!");
              if(this.type === 'quizSubmit') {
                this.$emit("onLogin");
              }
              else if(this.type === 'liveSession') {
                this.$emit("onLoginLiveSession");
              } else {
                if (this.$route.query.from) {
                  this.$router.go(-1);
                } else if (this.$route.name === "app-course-landing") {
                  this.$router.go();
                } else {
                  if (((user || {}).user_visits || {}).visited_welcome_page) {
                    this.$router.push("/course/course-landing");
                  } else {
                    this.$router.push("/landing");
                  }
                }
              }
              
            } else {
              console.log("loginResponse");
              console.log(loginResponse);
              if (loginResponse?.data?.code === "LIMIT_REACHED") {
                this.otpVerification = "login";
                this.verificationNeeded = true;
                this.sessions = loginResponse?.data?.data?.sessions;
                this.user = loginResponse?.data?.user;
                throw loginResponse.data?.data?.message;
              } else if (loginResponse?.data?.code === "ACCESS_BLOCKED") {
                const type = loginResponse?.data?.type;
                if (type === "email") {
                  toastr.error(
                    "Please Check your email and verify email address!"
                  );
                } else {
                  this.user = loginResponse?.data?.user;
                  this.OTP = true;
                  this.logoutAll = false;
                  this.enterOTP = true;
                  this.otpVerification = "phoneVerify_Login";
                  this.verificationNeeded = true;
                }
                throw loginResponse.data?.data?.message;
              } else if (
                loginResponse?.data?.error_code === "Suspicious_User"
              ) {
                const susUserData = {...loginResponse.data.user, isPending: loginResponse.data.isPending, isRejected: loginResponse.data.isRejected,}
                this.suspiciousUser = susUserData;
                this.isSuspiciousUser = true;
              } else {
                throw loginResponse.data?.message;
              }
            }
          }
          this.loader = false;
        } catch (error) {
          this.errorMessage = error;
          this.loader = false;
        }
      }
    },
    async postSignupAsGuest() {
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
        await CustomStorageService.setUid(loginResponse.user.id);
        let user = loginResponse.user;
        user.token = loginResponse.token;
        CustomStorageService.setUser(user);
        if (this.reactApp) {
          console.log("userToken" + user.token);
          console.log("userID" + user.id);
          console.log("loggedInGuest", user);
        }

        toastr.success("Successfully Logged In!");
        if(this.type === 'quizSubmit') {
          this.$emit("onLogin");
        }
        else if(this.type === 'liveSession') {
          this.$emit("onLoginLiveSession");
        } else {
          if (this.$route.query.from) {
            this.$router.go(-1);
          } else {
            this.$router.push("/landing");
          }
        }
      } catch (error) {
        this.errorMessage = error;
      }
    },
    async postSignup(data) {
      console.log(this.signUp, '-------------------------')
      const selectedCountry = $("#country").countrySelect(
        "getSelectedCountryData"
      );
      data.countryCode = selectedCountry.phone_code;
      if (data.contact.startsWith("0")) {
        data.contact = data.contact.substring(1);
      }
      if (!this.loader) {
        this.loader = true;
        this.errorMessage = "";
        this.user_email = data.email;
        try {
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
            var d = new Date(data.dob);
            data.dob = d;
            data.phone = data.countryCode + data.contact;
            let signupResponse = await LoginService.signup(data);
            console.log(signupResponse);
            mixpanel.track("VL-SignUp", {
              User_id: signupResponse.user.id,
              User_email: signupResponse.user.email,
              User_Phone: signupResponse.user.phone,
              User_DOB: signupResponse.user.dob,
              User_gender: signupResponse.user.gender,
            });
            if (signupResponse.success) {
              toastr.success("Account Created Successfully!");
              if (signupResponse.token) {
                await CustomStorageService.setUid(signupResponse.user.id);
                let user = signupResponse.user;
                user.token = signupResponse.token;
                CustomStorageService.setUser(user);
                if (this.reactApp) {
                  window.postMessage("signedUp");
                  console.log("userToken" + user.token);
                  console.log("userID" + user.id);
                  console.log("signedUp", user);
                }
                if(this.type === 'quizSubmit') {
                  this.$emit("onLogin");
                }
                else if(this.type === 'liveSession') {
                  this.$emit("onLoginLiveSession");
                } else {
                  if (this.$route.query.from) {
                    this.$router.go(-1);
                  } else if (this.$route.name === "app-course-landing") {
                    this.$router.go();
                  } else {
                    if (((user || {}).user_visits || {}).visited_welcome_page) {
                      this.$router.push("/course/course-landing");
                    } else {
                      this.$router.push("/landing");
                    }
                  }
                }
                
              } else {
                toastr.error("Token not Found!");
              }
            } else if (
              signupResponse.error &&
              signupResponse.data &&
              signupResponse.data.error_code === "Suspicious_User"
            ) {
              this.suspiciousUser = signupResponse.data.user;
              this.isSuspiciousUser = true;
            } else {
              throw signupResponse.msg;
            }
          }
          this.loader = false;
        } catch (error) {
          console.log(error);
          if (error == "ReferenceError: res is not defined") {
            this.errorMessage = "Email already exist";
          } else {
            this.errorMessage = error;
          }
          this.loader = false;
        }
      }
    },
    async signupGuestLogin(data) {
      if (!this.loader) {
        this.loader = true;
        this.errorMessage = "";
        // this.userEmail = data.email;
        const selectedCountry = $("#country").countrySelect(
          "getSelectedCountryData"
        );
        data.countryCode = selectedCountry.phone_code;
        if (data.contact.startsWith("0")) {
          data.contact = data.contact.substring(1);
        }
        try {
          data.browser_id = customStorageService.getUser().browser_id;
          data.id = customStorageService.getUser().id;
          data.phone = data.countryCode + data.contact;
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
            let signupResponse = await LoginService.registerGuest(data);
            if (signupResponse.success) {
              let oldToken = customStorageService.getUser().token;
              let updatedUser = signupResponse.user;
              updatedUser.token = oldToken;
              customStorageService.setUser(updatedUser);
              if (this.reactApp) {
                window.postMessage("signUpGuest");
                console.log("userToken" + updatedUser.token);
                console.log("userID" + updatedUser.id);
                console.log("signUpGuest", updatedUser);
              }
              toastr.success("Account Created Successfully!");

              this.$router.push("/landing");
              Object.keys(this.signUp).forEach(element => {
                this.signUp[element] = "";
              });
              this.signupPopUp = false;
            } else {
              throw signupResponse.msg;
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
    async postForget(data) {
      this.loader = true;
      this.errorMessage = "";
      try {
        const fields = ["email"];
        let isDataValidated = await validatorService.validate(
          fields,
          this.forget
        );
        if (isDataValidated) {
          throw new Error(isDataValidated);
        } else {
          let reqPasswordResponse = await LoginService.requestPassword(data);
          if (reqPasswordResponse.success) {
            toastr.success("Confirmation Sent on your Email Address");
            Object.keys(this.forget).forEach(element => {
              this.forget[element] = "";
            });
            this.filter("signIn");
          } else {
            throw reqPasswordResponse.msg;
          }
        }
        this.loader = false;
      } catch (error) {
        this.errorMessage = error;
        this.loader = false;
      }
    },
    async authenticateApple() {
      if (this.reactApp) {
        this.objectFromReact = "apple";
        return console.log("appleClicked");
      }
      AppleID.auth.signIn().then(async function(authData) {});
    },

    async logInWithFacebook() {
      if (this.reactApp) {
        this.objectFromReact = "facebook";
        return console.log("facebookClicked");
      }
      await this.loadFacebookSDK(document, "script", "facebook-jssdk");
      if (this.reactApp) console.log("inFacebook");
      let vm = this;
      FB.login(
        function(response) {
          console.log(response, "FACEBOOK");
          if (response.authResponse) {
            FB.api(
              "/me?access_token=" + response.authResponse.accessToken,
              "GET",
              { fields: "id,name,email" },
              async function(res) {
                let browserId = appService.getBrowserId();
                appService.setCookie("browserId", browserId, 7);
                let obj = {
                  user: {
                    id: res.id,
                    fb_email: res.email ? res.email : null,
                    name: res.name ? res.name : null
                  },
                  browserId,
                  origin: "LMS"
                };
                let facebookLoggedIn = await appService.facebookLogin(obj);
                if (facebookLoggedIn.success) {
                  toastr.success("Successfully Logged In!");
                  facebookLoggedIn.user.token = facebookLoggedIn.token;
                  CustomStorageService.setUser(facebookLoggedIn.user);
                  if(vm.type === 'quizSubmit') {
                    vm.$emit("onLogin");
                  }
                  else if(vm.type === 'liveSession') {
                    vm.$emit("onLoginLiveSession");
                  } else {
                    if (vm.$route.query.from) {
                      vm.$router.go(-1);
                    } else if (vm.$route.name === "app-course-landing") {
                      vm.$router.go();
                    } else {
                      if (
                        (((facebookLoggedIn || {}).user || {}).user_visits || {})
                          .visited_welcome_page
                      ) {
                        vm.$router.push("/course/course-landing");
                      } else {
                        vm.$router.push("/landing");
                      }
                    }
                  }

                  
                } else if (facebookLoggedIn.data.code === "LIMIT_REACHED") {
                  vm.verificationNeeded = true;
                  vm.sessions = facebookLoggedIn?.data?.data?.sessions;
                  vm.user = facebookLoggedIn?.data?.user;
                  throw facebookLoggedIn.data?.data?.message;
                } else {
                  toastr.error(facebookLoggedIn.message);
                }
              }
            );
          } else {
            toastr.error("User cancelled login or did not fully authorize.");
          }
        },
        { scope: "public_profile,email" }
      );
      return false;
    },
    async reactFacebook(response) {
      try {
        let vm = this;
        this.objectFromReact = "";
        let browserId = appService.getBrowserId();
        appService.setCookie("browserId", browserId, 7);
        let obj = {
          user: {
            id: response.id,
            fb_email: response.email ? response.email : null,
            name: response.first_name
              ? response.last_name
                ? response.first_name + response.last_name
                : response.first_name
              : null
          },
          browserId,
          origin: "LMS"
        };
        console.log("FB INIT");
        let facebookLoggedIn = await appService.facebookLogin(obj);
        if (facebookLoggedIn.success) {
          console.log("FB Success");
          toastr.success("Successfully Logged In!");
          facebookLoggedIn.user.token = facebookLoggedIn.token;
          CustomStorageService.setUser(facebookLoggedIn.user);
          if (this.reactApp) {
            console.log("userToken" + facebookLoggedIn.token);
            console.log("userID" + response.id);
            console.log("loggedInGuest", facebookLoggedIn.user);
          }
          if (vm.$route.query.from) {
            vm.$router.go(-1);
            console.log("Router -1");
          } else if (vm.$route.name === "app-course-landing") {
            vm.$router.go();
            console.log("Router");
          } else {
            if (
              (((facebookLoggedIn || {}).user || {}).user_visits || {})
                .visited_welcome_page
            ) {
              vm.$router.push("/course/course-landing");
              console.log("landing");
            } else {
              vm.$router.push("/landing");
              console.log("landing -1");
            }
          }
        } else if (facebookLoggedIn.data.code === "LIMIT_REACHED") {
          vm.verificationNeeded = true;
          vm.sessions = facebookLoggedIn?.data?.data?.sessions;
          vm.user = facebookLoggedIn?.data?.user;
          console.log("Limit Reached FB");
          console.log(facebookLoggedIn.data);
          throw facebookLoggedIn.data?.data?.message;
        } else {
          toastr.error(facebookLoggedIn.message);
          if (this.reactApp) {
            console.log(facebookLoggedIn.message);
            console.log("Facebook Login Failed");
          }
        }
      } catch (err) {
        console.log("Error in Facebook Login");
        console.log(err);
        console.log(JSON.stringify(err));
      }
    },
    async loadFacebookSDK(d, s, id) {
      if (this.reactApp) {
        console.log("inFacebookSDK");
      }
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    },
    beforeDestroy() {
      document.removeEventListener(
        "AppleIDSignInOnSuccess",
        this.appleSigninSuccess
      );
    },
    async handleEvent(message) {
      ///DONOT CHANGE STATES IN THIS FUNCTION
      if (this.reactApp) {
        try {
          console.log("Login Page");
          console.log(message.data.message);
          if (message.data.message.includes("googleLogin")) {
            var token = await message.data.message.split("googleLogin");
            console.log(token);
            console.log("Processing Google");
            await this.OnGoogleAuthSuccess(token[1]);
          } else if (message.data.message.includes("googleFailed")) {
            this.OnGoogleAuthFail("Google Authentication Failed,Try Again");
          } else {
            console.log("Receiving Objects From Native");
            console.log(message.data.message);
            var loginObject = [...message.data.message];
            this.appObject = [...message.data.message];
            if (this.objectFromReact == "facebook") {
              this.reactFacebook(this.appObject[0]);
            } else if (this.objectFromReact == "apple") {
              this.appleSigninSuccess(this.appObject[0]);
            }

            console.log(JSON.stringify(loginObject));
            console.log(this.appObject);
          }
        } catch (err) {
          console.log("ERROR in Catching Events");
          console.log(JSON.stringify(err));
        }
      }
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
    async resendOtp() {
      const data = {
        user_id: this.otpUserId,
        type: OtpType
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
    onKeydown(event) {
      const char = String.fromCharCode(event.keyCode);
      if (!/[0-9]/.test(char) && event.keyCode != 91 && event.keyCode != 86) {
        event.preventDefault();
        // event.target.nextElementSibling.focus();
      }
    },
    async sendOtp(email) {
      try{
        
          let type;
          if (/^\d+$/.test(email)) {
            type = 'phone'
          } else if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
            type = 'email'
          } else {
            type = 'email'

          }
          OtpType = type;
          const fields = [type];
          let isDataValidated = await validatorService.validate(
            fields,
            {email: email, phone: email}
          );
          if (isDataValidated) {
              throw new Error(isDataValidated);
          }

          this.loader = true;
          let emailPhoneResponse = await LoginService.validateEmailPhone({email_phone: email});
          if(emailPhoneResponse.success) {
            let userID = emailPhoneResponse.user.id
            this.otpUserId = userID;
            if(emailPhoneResponse.success){
              let loginResponse = await LoginService.sendOTP({type: type, user_id: userID});
              if(loginResponse){
                this.filter("otpCode");
              }
            }
            else {
              this.errorMessage = emailPhoneResponse.message;
              this.loader = false;
            }
          } else{
            throw new Error(emailPhoneResponse.message || "Server Error");
          }
      }catch (error) {
          this.errorMessage = error;
          this.loader = false;
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
    async sendOTPConfirmation() {
      var data =
        this.digit1 +
        this.digit2 +
        this.digit3 +
        this.digit4 +
        this.digit5 +
        this.digit6;
      const formData = {
        user_id: this.otpUserId,
        code: data,
        type: 'otp_login',
        origin: "LMS"
      };
      let validationResponse = await LoginService.validateOTP(formData);
      if (validationResponse.success && validationResponse.token) {
        await customStorageService.setUid(validationResponse.user.id);
        let user = validationResponse.user;
        user.token = validationResponse.token;
        customStorageService.setUser(user);
        toastr.success("Successfully Logged In!");
        if(this.type === 'quizSubmit') {
          this.$emit("onLogin");
        } else {
          if(this.type === 'liveSession') {
            this.$emit("onLoginLiveSession");
          } else {
            if (this.$route.query.from) {
              this.$router.go(-1);
            } else if (this.$route.name === "app-course-landing") {
              this.$router.go();
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
        }
      } else {
        console.log(validationResponse);
        validationResponse.data = validationResponse.data.data;
        if (validationResponse?.data?.code === "LIMIT_REACHED") {
          this.otpVerification = "login";
          this.verificationNeeded = true;
          this.sessions = validationResponse?.data?.data?.sessions;
          this.user = validationResponse?.data?.user;
        } else if (validationResponse?.data?.code === "ACCESS_BLOCKED") {
          const type = validationResponse?.data?.type;
          if (type === "email") {
            toastr.error(
              "Please Check your email and verify email address!"
            );
          } else {
            this.user = validationResponse?.data?.user;
            this.OTP = true;
            this.logoutAll = false;
            this.enterOTP = true;
            this.otpVerification = "phoneVerify_Login";
            this.verificationNeeded = true;
          }
          throw validationResponse.data?.data?.message;
        } else if (
          validationResponse?.data?.error_code === "Suspicious_User"
        ) {
          const susUserData = {...validationResponse.data.user, isPending: validationResponse.data.isPending, isRejected: validationResponse.data.isRejected,}
          this.suspiciousUser = susUserData;
          this.isSuspiciousUser = true;
        } else {
          toastr.error("Invalid OTP!");
        }
      }
      // console.log("DATA",data);
    },
  },
  created() {
    var listener = document.addEventListener("message", this.handleEvent); ///DONOT REMOVE THIS
    if (this.reactApp) {
      console.log(listener); ///DONOT REMOVE THIS CONSOLE
      this.handleEvent(listener); ///DONOT REMOVE THIS
    }
  }
};
</script>

<style src="./login-page.css" scoped></style>

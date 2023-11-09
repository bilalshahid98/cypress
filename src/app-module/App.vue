<template src="./App.html"></template>

<script>
const axios = require("axios");
import appService from "./app-services/app-service";
import customStorageService from "./app-services/custom-storage-service";
import DesktopAppHeader from "./shared-module/components/desktop-app-header/desktop-app-header.vue";
import FloatingButton from "./shared-module/components/floating-button/floating-button.vue";
import SecurityPopup from "./shared-module/components/security-error-popup/security-error-popup.vue";
import DdosPopup from "./shared-module/components/ddos-error-popup/ddos-error-popup.vue";
import $ from "jquery";

export default {
  name: "app",
  components: {
    "desktop-app-header": DesktopAppHeader,
    "floating-button": FloatingButton,
    "security-popup": SecurityPopup,
    "ddos-popup": DdosPopup
  },
  data() {
    return {
      isDesktopApp: false,
      reactNativeApp: false,
      noSecurity: false
    };
  },
  created() {
    if(this.$route.name == 'liveChatInstructor'){
      this.noSecurity = true
    }
    // Listen you CRX event
    customStorageService.setBrowserId(`__${Math.floor(Math.random() * 100000)}`);
    this.appendTawkWidget();
    var userAgent = navigator.userAgent;
    if (userAgent.includes("desktop")) {
      this.isDesktopApp = true;
    }
    if (userAgent.includes("React-Native-NP")) {
      this.reactNativeApp = true;
      customStorageService.setApp(this.reactNativeApp);
    }
    if (userAgent.includes("React-Native-NP-New")) {
      this.$store.commit("setNewReactNative", true);
    }

    appService.postUserVisitTracking();
    window.addEventListener("load", function() {
      $.getScript("https://www.googleoptimize.com/optimize.js?id=GTM-NHZH63N");
    });
    window.addEventListener("scroll", function() {
      if (window.scrollY >= 30) {
        if (this.document.getElementById("nav-bar")) {
          this.document
            .getElementById("nav-bar")
            .classList.add("bottom-border");
        }
      } else {
        if (this.document.getElementById("nav-bar")) {
          this.document
            .getElementById("nav-bar")
            .classList.remove("bottom-border");
        }
      }
    });
  },
  methods: {
    appendTawkWidget() {
      var userAgent = navigator.userAgent;
      const user = customStorageService.getUser();
      if (user && user.id) {
        axios({
          method: "GET",
          headers: { uid: user.id },
          url: `${process.env.VUE_APP_FRONTEND_BASE_URL}api/v1/users/get-tawk-config`
        })
          .then(function(response) {
            // handle success
            console.log(response);
            if (response.data && response.data.showTalk) {
              const script = document.createElement("script");
              script.innerHTML =
                "var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();(function(){var s1=document.createElement('script'),s0=document.getElementsByTagName('script')[0];s1.async=true;s1.src='https://embed.tawk.to/5881c8302438f53b0a2e3007/default';s1.charset='UTF-8';s1.setAttribute('crossorigin','*');s0.parentNode.insertBefore(s1,s0);})();";
              document.body.appendChild(script);
            }
          })
          .catch(function(error) {
            // handle error
            console.log(error);
          });
      }
    }
  },
  watch: {
    $route(to, from) {
      this.$store.commit("setCurrentPage", to.name);
    }
  }
};
</script>

<style>
@import "https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css";
@import "../styles/style.css";
@import "../styles/nearpeer.styles.css";
</style>

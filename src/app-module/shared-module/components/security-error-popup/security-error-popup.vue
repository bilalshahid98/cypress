<template src="./security-error-popup.html"></template>

<script>
import {
  isMobile,
  isTablet,
  isFirefox,
  browserName,
  isIOS
} from "mobile-device-detect";
const axios = require("axios");
import customStorageService from "../../../app-services/custom-storage-service";

let sendScreenSize = true;
let BlockedExtensionIds = [];
let BlockedExtensionNames = [];
let getExtEventCalled = false;

export default {
  name: "app-access-denied-pop-up",
  components: {},
  data() {
    return {
      unauthorizedBrowser: false,
      devToolOpened: false,
      extensionFound: false,
      systemDimension: {},
      installedExtensions: []
    };
  },
  props: {
    isMobileOrTablet: {
      type: Boolean
    }
  },
  created() {
    this.checkExtensionInstalled();
    this.browserCheck();
    this.validateScreenSizeChange();
    this.getBlockedExtension();
  },
  mounted() {},
  methods: {
    reloadPage() {
      location.reload();
    },
    closeBrowser() {
      window.close();
      window.postMessage({ type: "CLOSE_CURRENT_TAB" }, "*");
    },
    gotoExtensions() {
      window.postMessage({ type: "REDIRECT_TO_EXTENSION_MANAGMENT" }, "*");
    },
    gotoNpExtensions() {
      window.open(
        "https://chrome.google.com/webstore/detail/nearpeer/ohcpifgeajnbinjdjpmoolpkafafpkag",
        "_blank"
      );
    },
    downloadApp() {
      if (isIOS) {
        window.location.href =
          "https://apps.apple.com/us/app/nearpeer/id1525357562";
      } else {
        window.location.href =
          "https://play.google.com/store/apps/details?id=org.nearpeer.learning";
      }
    },
    checkExtensionInstalled() {
      setTimeout(() => {
        if (
          this.$store.state.npExtensionFound === "PENDING" &&
          !isMobile &&
          !isTablet
        ) {
          this.$store.commit("setNpExtensionFound", "NOT_INSTALLED");
        }
      }, 3000);
      document.addEventListener("NP_EXTENSION_INSTALLED", event => {
        this.$store.commit("setNpExtensionFound", "INSTALLED");
      });
      document.addEventListener("GET_INSTALLED_EXTENSIONS", event => {
        this.installedExtensions = event.detail;
        console.log(this.installedExtensions);
        getExtEventCalled = true;
        console.log("get exxttttt");
      });
      document.addEventListener("GET_SYSTEM_DIMENSIONS", event => {
        const dimension = event.detail;
        this.systemDimension = dimension;
        if (dimension.width && dimension.width - window.innerWidth > 400) {
          this.$store.commit("setDevToolOpened", true);
        }
      });
    },
    browserCheck() {
      if (isMobile || isTablet) {
        const browser = browserName.toLowerCase();
        if (
          browser.includes("ucbrowser") ||
          browser.includes("uc browser") ||
          isFirefox
        ) {
          this.$store.commit("setUnauthorizedBrowser", true);
        }
      }
    },
    async getBlockedExtension() {
      const user = customStorageService.getUser();
      if(user) {
        const res = await axios({
          method: "GET",
          headers: { uid: user.id },
          url: `${process.env.VUE_APP_BACKEND_LMS_BASE_URL}/config/get-extensions`
        });
        if (res.data && res.data.success) {
          res.data.extensions.forEach(ext => {
            BlockedExtensionIds.push(ext.ext_id);
            BlockedExtensionNames.push(ext.ext_name);
          });
          if (res.data.allowWebServing) {
            this.$store.commit("setAllowWebServing", true);
          }
          setTimeout(() => {
            getExtEventCalled = true;
          }, 2000);
          this.checkBlockedExtension();
        }
      }
      
    },
    checkBlockedExtension() {
      if (getExtEventCalled) {
        console.log(BlockedExtensionIds);
        console.log(BlockedExtensionNames);
        this.installedExtensions.forEach(app => {
          BlockedExtensionNames.forEach(extName => {
            if (app.name.toLowerCase().includes(extName) && app.enabled) {
              this.extensionFound = true;
              this.$store.commit("setUnauthExtensionFound", true);
            }
          });
          BlockedExtensionIds.forEach(extId => {
            if (app.id == extId && app.enabled) {
              this.extensionFound = true;
              this.$store.commit("setUnauthExtensionFound", true);
            }
          });
        });
      } else {
        setTimeout(() => {
          this.checkBlockedExtension();
        }, 300);
      }
    },
    async DevToolsOpened(type) {
      if (type !== "right_click") {
        this.$store.commit("setDevToolOpened", true);
      }

      const user = customStorageService.getUser();
      if(user) {
        axios({
          method: "POST",
          headers: { uid: user.id },
          data: { type, origin: "LMS", user_id: user.id },
          url: `${process.env.VUE_APP_AUTH_SERVICE_URL}/v1/event-tracking/save-event`
        });
      }
      
    },
    validateScreenSizeChange() {
      document.addEventListener(
        "contextmenu",
        event => {
          this.DevToolsOpened("right_click");
        },
        true
      );
      if (
        window.outerHeight - window.innerHeight > 220 ||
        window.outerWidth - window.innerWidth > 140
      ) {
        this.DevToolsOpened("screen_size_change");
      }

      // Detect Resize (Chrome/Firefox/Edge Works) but (Triggers on Zoom In Chrome and Zoom Out FireFox)
      window.onresize = () => {
        if (!isMobile || (this.systemDimension && this.systemDimension.width)) {
          if (
            (this.systemDimension &&
              this.systemDimension.width &&
              this.systemDimension.width - window.innerWidth > 400) ||
            window.outerHeight - window.innerHeight > 220 ||
            window.outerWidth - window.innerWidth > 140
          ) {
            this.$store.commit("setDevToolOpened", true);

            if (sendScreenSize) {
              sendScreenSize = false;
              this.DevToolsOpened("screen_size_change");
              setTimeout(() => {
                sendScreenSize = true;
              }, 10000);
            }
          } else {
            this.$store.commit("setDevToolOpened", false);
          }
        }
      };

      // Detect Key Shortcuts
      window.addEventListener("keydown", e => {
        if (
          // CMD + Alt + I (Chrome, Firefox, Safari)
          (e.metaKey == true && e.altKey == true && e.keyCode == 73) ||
          // CMD + Alt + J (Chrome)
          (e.metaKey == true && e.altKey == true && e.keyCode == 74) ||
          // CMD + Alt + C (Chrome)
          (e.metaKey == true && e.altKey == true && e.keyCode == 67) ||
          // CMD + Shift + C (Chrome)
          (e.metaKey == true && e.shiftKey == true && e.keyCode == 67) ||
          // Ctrl + Shift + I (Chrome, Firefox, Safari, Edge)
          (e.ctrlKey == true && e.shiftKey == true && e.keyCode == 73) ||
          // Ctrl + Shift + J (Chrome, Edge)
          (e.ctrlKey == true && e.shiftKey == true && e.keyCode == 74) ||
          // Ctrl + Shift + C (Chrome, Edge)
          (e.ctrlKey == true && e.shiftKey == true && e.keyCode == 67) ||
          // F12 (Chome, Firefox, Edge)
          e.keyCode == 123 ||
          // CMD + Alt + U, Ctrl + U (View source: Chrome, Firefox, Safari, Edge)
          (e.metaKey == true && e.altKey == true && e.keyCode == 85) ||
          (e.ctrlKey == true && e.keyCode == 85)
        ) {
          this.DevToolsOpened("shortcut_key_for_devtool");
        }
      });
    }
  }
};
</script>

<style src="./security-error-popup.css" scoped></style>

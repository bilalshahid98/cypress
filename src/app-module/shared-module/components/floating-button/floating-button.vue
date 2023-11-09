<template src="./floating-button.html"></template>

<script>
import VibrationService from "./../../../app-services/vibration-service";

export default {
  name: "floating-button",
  data() {
    return {
      floatingButtonContent: false,
      showDeleteArea: false,
      showElement: true,
      closeArea: window.innerHeight - 200
    };
  },
  methods: {
    disableScrolling() {
      document.body.style.overflow = "hidden";
      document.body.style.html = "hidden";
    },
    enableScrolling() {
      document.body.style.overflow = "scroll";
      document.body.style.html = "scroll";
    },
    touchStart(e) {
      var isTouchDevice =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0;

      if (isTouchDevice) {
        this.disableScrolling();
        let closeElement = document.getElementById("close-floting-element");
        closeElement.style.display = "block";
      }
    },
    touchMove(e) {
      var isTouchDevice =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0;

      if (isTouchDevice) {
        e.stopPropagation();
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        const dragElement = document.getElementById("floating-menu-container");
        dragElement.style.top = y - 25 + "px";
        dragElement.style.left = x - 25 + "px";
      }
    },
    touchEnd(e) {
      this.enableScrolling();
      var isTouchDevice =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0;
      if (isTouchDevice) {
        let closeElement = document.getElementById("close-floting-element");
        const dragElement = document.getElementById("floating-menu-container");

        let startCloseAreaX = closeElement.offsetLeft - 100;
        let endCloseAreaX = closeElement.offsetLeft;
        let startCloseAreaY = closeElement.offsetTop - 100;
        let endCloseAreaY = closeElement.offsetTop + 100;

        if (
          dragElement.offsetLeft > startCloseAreaX &&
          dragElement.offsetLeft < endCloseAreaX &&
          dragElement.offsetTop > startCloseAreaY &&
          dragElement.offsetTop < endCloseAreaY
        ) {
          this.showElement = false;
          VibrationService.vibrate();
        }
        closeElement.style.display = "none";
      }
    },
    floatingMenuClickToggle() {
      let MENU = document.getElementById("floating-menu-container");
      let INFO = document.getElementById("floating-menu-content-wrapper");
      let LOGO = document.getElementById("floating-menu-logo");
      let INFOTXT = document.getElementById("floating-menu-info-txt");
      if (INFO.style.display === "none") {
        INFO.style.display = "block";
        // insertAfter(LOGO, INFOTXT);
      } else {
        INFO.style.display = "none";
        LOGO.style.display = "block";
        // insertAfter(LOGO, INFO);
        LOGO.style.display = "block";
      }
    },
    startDrag(evt, item) {
      console.log(evt.dataTransfer);
      evt.dataTransfer.dropEffect = "move";
      evt.dataTransfer.effectAllowed = "move";
      // evt.dataTransfer.setData('itemID', item.id)
    },
    goToPractice() {
      this.floatingMenuClickToggle();
      this.$router.push("/practices");
    }
  },
  mounted() {
    var thisRef = this;
    dragElement(document.getElementById("floating-menu-container"));

    function dragElement(elmnt) {
      let pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
      let LOGO = document.getElementById("floating-menu-logo");
      elmnt.onmousedown = dragMouseDown;
      function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
      }

      function elementDrag(e) {
        let closeElement = document.getElementById("close-floting-element");
        closeElement.style.display = "block";
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        elmnt.style.top = elmnt.offsetTop - pos2 + "px";
        elmnt.style.left = elmnt.offsetLeft - pos1 + "px";

        LOGO.style.pointerEvents = "none";
      }

      function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;

        let closeElement = document.getElementById("close-floting-element");

        let startCloseAreaX = closeElement.offsetLeft - 100;
        let endCloseAreaX = closeElement.offsetLeft;
        let startCloseAreaY = closeElement.offsetTop - 100;
        let endCloseAreaY = closeElement.offsetTop + 100;

        if (
          elmnt.offsetLeft > startCloseAreaX &&
          elmnt.offsetLeft < endCloseAreaX &&
          elmnt.offsetTop > startCloseAreaY &&
          elmnt.offsetTop < endCloseAreaY
        ) {
          thisRef.showElement = false;
        }
        LOGO.style.pointerEvents = "auto";
        closeElement.style.display = "none";
      }
    }
  }
};
</script>

<style src="./floating-button.css"></style>

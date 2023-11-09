<template src="./pdf-viewer.html"></template>

<script>
import courseService from "../../services/course-service";
import customStorageService from "../../../app-services/custom-storage-service";
import ClickOutside from "vue-click-outside";
import VueSlider from "vue-slider-component";
import { isIOS } from "mobile-device-detect";
/* eslint-disable no-useless-escape */
var Base64 = {
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  encode: function(input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = Base64._utf8_encode(input);

    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output =
        output +
        this._keyStr.charAt(enc1) +
        this._keyStr.charAt(enc2) +
        this._keyStr.charAt(enc3) +
        this._keyStr.charAt(enc4);
    }

    return output;
  },

  decode: function(input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {
      enc1 = this._keyStr.indexOf(input.charAt(i++));
      enc2 = this._keyStr.indexOf(input.charAt(i++));
      enc3 = this._keyStr.indexOf(input.charAt(i++));
      enc4 = this._keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);

      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }
    }

    output = Base64._utf8_decode(output);

    return output;
  },

  _utf8_encode: function(string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }

    return utftext;
  },

  _utf8_decode: function(utftext) {
    var string = "";
    var i = 0;
    var c1;
    var c2;
    var c3;
    var c = (c1 = c2 = 0);

    while (i < utftext.length) {
      c = utftext.charCodeAt(i);

      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if (c > 191 && c < 224) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(
          ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
        );
        i += 3;
      }
    }

    return string;
  }
};

let pdfDoc = null,
  pageIsRendering = false,
  pageNumIsPending = null;

let canvas = "",
  ctx = "";

let user = {};
const browserSession =
  Math.random()
    .toString(36)
    .substring(2, 15) +
  Math.random()
    .toString(36)
    .substring(2, 15);

var moment = require("moment");

export default {
  name: "app-pdf-viewer",
  props: [
    "selectedNotes",
    "selectedVideo",
    "currentCourse",
    "selectedModule",
    "selectedChapter",
    "selectedTrackModule"
  ],
  components: {
    "vue-slider": VueSlider
  },
  directives: {
    ClickOutside
  },
  data() {
    return {
      isFullScreen: false,
      pageNum: 1,
      totalPages: 1,
      scale: 1,
      watchPercg: 0,
      pdfLoading: false
    };
  },
  methods: {
    async fullScreen() {
      let div = document.getElementById("pdf-container");
      let pdf = document.getElementsByClassName("pdf-center")[0];
      if (!isIOS) {
        pdf.removeAttribute("id");
        if (div.requestFullscreen) {
          div.requestFullscreen();
        } else if (div.mozRequestFullScreen) {
          div.mozRequestFullScreen(); // Firefox
        } else if (div.webkitRequestFullscreen) {
          div.webkitRequestFullscreen(); // Chrome and Safari
        }
        div.style.height = 100 + "%";
        pdf.style = { height: 100 + "% !important" };
        pdf.style.width = 100 + "%";
        pdf.style["text-align"] = "center";
        this.isFullScreen = true;
        this.scale = 1.3;
      } else {
        let videoContainer = document.getElementById("video-center");
        videoContainer.style.top = 0;
        this.$store.commit("setNotesIOSFullscreen", true);
        let height = window.innerHeight;
        pdf.removeAttribute("id");
        div.style.height = height + "px";
        div.style.background = "white";
        // div.style["align-items"] = "center";
        // div.style["justify-content"] = "center";
        this.isFullScreen = true;
        this.scale = 1.3;
      }
      this.queueRenderPage(this.pageNum);
    },
    async exitFulScreen() {
      try {
        if (!isIOS) {
          document.exitFullscreen();
        } else {
          let videoContainer = document.getElementById("video-center");
          videoContainer.style = {};
        }
        this.$store.commit("setNotesIOSFullscreen", false);
        let div = document.getElementById("pdf-container");
        let pdf = document.getElementsByClassName("pdf-center")[0];
        pdf.setAttribute("id", "pdf-center");
        div.style = {};
        pdf.style = {};
        this.isFullScreen = false;
        this.scale = 1;
        this.queueRenderPage(this.pageNum);
      } catch (error) {
        console.log(error);
      }
    },
    async changeFullscreen() {
      if (
        !document.webkitIsFullScreen &&
        !document.mozFullScreen &&
        !document.msFullscreenElement
      ) {
        this.exitFulScreen();
      }
    },
    zoomIn() {
      if (this.scale < 3) {
        this.scale += 0.3;
        this.renderPage(this.pageNum);
      }
    },
    zoomOut() {
      if (this.scale > 0) {
        this.scale -= 0.3;
        this.renderPage(this.pageNum);
      }
    },
    renderPdf() {
      this.pageNum = 1;
      this.pdfLoading = true;
      document.addEventListener("keydown", this.handleKeyboard);
      canvas = document.querySelector("#pdf-render");
      ctx = canvas.getContext("2d");
      const urlLink = Base64.decode(this.selectedNotes.url);
      // var pdfjsLib =
      //   window["../../../../../node_modules/pdfjs-dist/build/pdf.js"];
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc ='https://velocity.nearpeer.org/pdf.worker.js';
        pdfjsLib
        .getDocument({url: urlLink,
        rangeChunkSize: 200000,
        disableAutoFetch: true,
        disableStream: true,
        })
        .promise.then(pdfDoc_ => {
          pdfDoc = pdfDoc_;
          this.totalPages = pdfDoc.numPages;

          if (this.selectedTrackModule && this.selectedTrackModule.notes) {
            this.selectedTrackModule.notes.forEach(notes => {
              if (
                notes._id == this.selectedNotes.id &&
                notes.page_no < this.totalPages
              ) {
                this.pageNum = notes.page_no;
              }
            });
          }

          this.renderPage(this.pageNum);
          this.pdfLoading = false;
          this.saveNotesStats({ event_type: "pdf_open" });
        })
        .catch(err => {
          // Display error
          const div = document.createElement("div");
          div.className = "error";
          div.appendChild(document.createTextNode(err.message));
          document.querySelector("body").insertBefore(div, canvas);
          // Remove top bar
          document.querySelector(".top-bar").style.display = "none";
        });
      } catch (error) {
        console.log(error)
        setTimeout(() => {
          this.renderPdf();
        }, 700);
      }
        
      
    },
    renderPage(num) {
      pageIsRendering = true;

      // Get page
      pdfDoc.getPage(num).then(page => {
        // Set scale
        const viewport = page.getViewport({ scale: this.scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
          canvasContext: ctx,
          viewport
        };

        page.render(renderCtx).promise.then(() => {
          pageIsRendering = false;

          if (pageNumIsPending !== null) {
            this.renderPage(pageNumIsPending);
            pageNumIsPending = null;
          }
        });

        // Output current page
      });
    },

    // Check for pages rendering
    queueRenderPage(num) {
      if (pageIsRendering) {
        pageNumIsPending = num;
      } else {
        this.renderPage(num);

        this.selectedTrackModule.notes.forEach(notes => {
          if (notes._id == this.selectedNotes.id) {
            notes.page_no = num;
          }
        });
      }
    },

    // Show Prev Page
    showPrevPage() {
      if (this.pageNum <= 1) {
        return;
      }
      this.pageNum--;
      this.queueRenderPage(this.pageNum);
      this.saveNotesStats({ event_type: "previous_page" });
    },

    // Show Next Page
    showNextPage() {
      if (this.pageNum >= pdfDoc.numPages) {
        return;
      }
      this.pageNum++;
      this.queueRenderPage(this.pageNum);
      this.saveNotesStats({ event_type: "next_page" });
    },

    handleKeyboard(event) {
      switch (event.keyCode) {
        case 39:
          this.showNextPage();
          break;
        case 37:
          this.showPrevPage();
          break;
        default:
          break;
      }
    },
    saveNotesStats({ event_type }) {
      let obj = {
        session: browserSession,
        page_no: this.pageNum,
        total_pages: this.totalPages,
        event_type: event_type,
        total_time_spent: 0,
        time_spent_on_page: 0,
        notes: this.selectedNotes,
        course: {
          id: this.currentCourse.id,
          name: this.currentCourse.name
        },
        module: {
          id: this.selectedModule.id,
          name: this.selectedModule.name
        },
        chapter: {
          id: this.selectedChapter ? this.selectedChapter.id : null,
          name: this.selectedChapter ? this.selectedChapter.name : null
        },
        video: {
          id: this.selectedVideo.id,
          name: this.selectedVideo.name
        },
        user: {
          id: user.id,
          name: user.full_name,
          email: user.email
        }
      };
      courseService.saveNotesStat(obj).then(res => {});
    }
  },
  created() {},
  mounted() {
    user = customStorageService.getUser();
    this.renderPdf();

    document.addEventListener(
      "webkitfullscreenchange",
      this.changeFullscreen,
      false
    );
    document.addEventListener(
      "mozfullscreenchange",
      this.changeFullscreen,
      false
    );
    document.addEventListener("fullscreenchange", this.changeFullscreen, false);
    document.addEventListener(
      "MSFullscreenChange",
      this.changeFullscreen,
      false
    );

    window.addEventListener("resize", () => {
      if (isIOS && this.isFullScreen) {
        let div = document.getElementById("pdf-container");
        let height = window.innerHeight;
        div.style.cssText = `height: ${height}px`;
      }
    });

    let disableRightClickEle = document.getElementsByClassName("pdf-center")[0];
    disableRightClickEle.addEventListener("contextmenu", ev => {
      ev.preventDefault();
    });
  },
  watch: {
    selectedNotes: function(newVal, oldVal) {
      this.renderPdf();
    },
    pageNum: function(newVal, oldVal) {
      this.watchPercg = (this.pageNum / this.totalPages) * 100;
      console.log(this.watchPercg);
    }
  },
  async beforeDestroy() {}
};
</script>

<style src="./pdf-viewer.css" scoped></style>

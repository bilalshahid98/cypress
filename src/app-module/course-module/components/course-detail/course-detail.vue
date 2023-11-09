<template src="./course-detail.html"></template>

<script>
import courseService from "../../services/course-service";
import customStorageService from "../../../app-services/custom-storage-service";
import appService from "../../../app-services/app-service";
import _ from "lodash";
import moment from "moment";
import toastr from "toastr";
import breadCrumns from "../../../shared-module/components/bread-crumbs/bread-crumbs.vue";
import btnMdcatResult from "../../../shared-module/components/btn-mdcat-result/btn-mdcat-result.vue";

var courseDetailPopup;
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

export default {
  name: "app-course-detail",
  components: {
    "bread-crumbs": breadCrumns,
    "btn-mdcat-result": btnMdcatResult,
  },
  data: function() {
    return {
      moduleObj: {},
      moduleLoading: false,
      viewLess: true,
      courseDetailPopup,
      purchased: true,
      currentCourseDetails: {},
      currentCourse: {},
      moduleBody: -1,
      isPageLoading: true,
      walkThrough: false,
      courseService: courseService,
      currentCourseVisits: 0,
      redirect: false,
      currentChapterNo: -1,
      result_delay_in_hours: 1,
      courseIndexUrl: "",
      currentFrontendUrl: process.env.VUE_APP_REDIRCT_URL,
      reactApp: false,
      coourseDetailUrl: this.$route.fullPath,
      reactAppIOS: false,
      toastrShown: 0,
      user: customStorageService.getUser(),
      courseId: this.$route.params.course_id,
      isGuest: false,
      currentlyDownloadedCourse: [],
      currentlyDownloadingCourse: [],
      totalVideos: "",
      downloadedVideos: "",
      downloadDisabledCourse: false,
      showCancelCourse: false,
      downloadingStatusCourses: {
        downloadIcon: true,
        downloadedIcon: false,
        downloadingIcon: false
      },
      courseStatus: {
        downloadedVideos: 0,
        totalVideos: 0,
        completeStatus: false,
        id: ""
      },
      currentModule: {},
      currentlyDownloadedModules: [],
      currentlyDownloadingModules: [],
      downloadDisabledModule: false,
      totalModulePercentage: "",
      dwnID: "",
      downloadingStatusModules: {
        downloadIcon: true,
        downloadedIcon: false,
        downloadingIcon: false,
        progress: 0
      },
      moduleProgressObject: [],
      device_id: "",
      courseDownloadInProgress: false,
      courseDownloadPercentage: 0,
      dataToUpdate: {},
      downloadErrorMessage: undefined,
      crumbs: []
    };
  },
  methods: {
    formatTime(msec) {
      z;
      let avgTime = "";
      let time = new Date(msec).toISOString().substr(11, 8);
      time = time.split(":");
      if (parseInt(time[0]) > 0) {
        avgTime = time[0] + "h ";
      }
      if (parseInt(time[1]) > 0) {
        avgTime = avgTime + time[1] + "m ";
      }
      if (parseInt(time[2]) > 0) {
        avgTime = avgTime + time[2] + "s";
      }
      return avgTime;
    },
    viewLessHandler() {
      this.viewLess = !this.viewLess;
    },
    startTimer() {
      this.interval = setInterval(() => {
        this.moduleObj.moduleInfo.forEach(modul => {
          if (
            modul &&
            modul.content &&
            modul.content.content == "videos" &&
            ((modul || {}).content || {}).videos.length > 0
          ) {
            modul.content.videos.forEach(video => {
              if (
                video.type == "quiz" &&
                video.result_id &&
                video.result_delay_in_hours != 0
              ) {
                let resultRavelTime = moment(video.created_at).add(
                  video.result_delay_in_hours,
                  "hours"
                );

                let current = moment();
                const isAfter = current.isAfter(resultRavelTime);

                if (!isAfter) {
                  let remaningTime =
                    new Date(resultRavelTime.toString()) - new Date();
                  video.remaining_time = this.formatTime(remaningTime);

                  this.$forceUpdate();
                } else {
                  this.$forceUpdate();

                  video.result_delay_in_hours = 0;
                }
              }
            });
          } else if (modul.content && modul.content.content == "chapters") {
            modul?.content?.chapters.forEach(chap => {
              chap?.videos?.forEach(video => {
                if (
                  video.type == "quiz" &&
                  video.result_id &&
                  video.result_delay_in_hours != 0
                ) {
                  let resultRavelTime = moment(video.created_at).add(
                    video.result_delay_in_hours,
                    "hours"
                  );

                  let current = moment();
                  const isAfter = current.isAfter(resultRavelTime);

                  if (!isAfter) {
                    let remaningTime =
                      new Date(resultRavelTime.toString()) - new Date();
                    video.remaining_time = this.formatTime(remaningTime);
                    this.$forceUpdate();
                  } else {
                    this.$forceUpdate();
                    video.result_delay_in_hours = 0;
                  }
                }
              });
            });
          }
        });
      }, 1000);
    },
    getCurrentChapterNo(chapter, chapterNo) {
      mixpanel.track('VL-Course-Chapter-Page',{
        'Chapter_Name' : chapter.name,
        'Chapter_ID' : chapter.id,
        'Module_Name' : chapter.module_id,
      });
      if (this.currentChapterNo == chapterNo) {
        this.currentChapterNo = -1;
      } else {
        this.currentChapterNo = chapterNo;
      }
    },
    // videoName(video) {
    //   mixpanel.track('VL-Video-Page',{
    //     'Video_Name' : video.name,
    //     'Video_ID' : video.id,
    //     'Module_ID' : video.module_id,
    //     'Chapter_ID' : video.chapter_id,
    //     'Course_ID' : this.courseId,
    //   });

    // },
    lockedModule() {
      console.log('asdfasfdljasdf', currentCourseDetails);
      if (this.reactApp) {
        this.redirectPage((this.currentCourseDetails || []).index_url);
      } else {
        this.redirect = true;
      }
    },
    popupRedirect() {
      if (this.reactApp) {
        this.redirectPage((this.currentCourseDetails || []).index_url);
      } else {
        this.redirect = true;
      }
    },
    redirectPage(link) {
      this.redirect = false;
      window.location.href =
        this.currentFrontendUrl + "/" + link + "?token=" + this.user.token;
    },
    startQuiz(quiz, module) {
      console.log(module)
      mixpanel.track('VL-quiz-main-Page',{
        'Quiz_Name' : quiz.name,
        'Quiz_ID' : quiz.id,
        'index_url' : quiz.index_url,
      });
      
      if (quiz.quiz_type === "sat" && quiz.pg_quiz_id) {
        window.location.href =
          this.currentFrontendUrl + "/quiz/" + quiz.pg_quiz_id;
      } else if(quiz.quiz_type === "daq") {
        this.$router.push(`/course/${module.index_url}/${module.id}/${quiz.id}?daq=true&daq_id=${quiz.id}&courseIndexUrl=${this.courseIndexUrl}`);
      } else {
        this.$router.push("/quiz/standard-quiz-main/" + quiz.id);
      }
    },
    async moduleBodyHandler(moduleNo, module) {
      console.log("Mod Bod", moduleNo, module);
      mixpanel.track('VL-Module-Page',{
        'Module_Name' : module.name,
        'Module_ID' : module.id,
        'Module_Index URL' : module.index_url,
      });
      if (this.moduleBody == moduleNo) {
        this.moduleBody = -1;
      } else {
        let element = document.getElementById("parent");
        setTimeout(() => {
          element.scrollTo(
            0,
            document.getElementById(moduleNo).offsetTop - 150
          );
        }, 0.5);
        this.moduleBody = moduleNo;
        if (!module.content) {
          this.moduleLoading = true;
          let moduleContent = await courseService.getModuleData(
            this.courseId,
            module.id
          );
          moduleContent = moduleContent.data.content;
          this.moduleObj.moduleInfo.forEach(modInfo => {
            if (modInfo.id === moduleContent.id) {
              modInfo.content = moduleContent.content;
              this.setVideosInModule();
            }
          });
          this.moduleLoading = false;
          this.$forceUpdate();
        }
        if (this.reactApp) {
          this.reactAppStatesModule();
        }
      }
    },
    async getCourseByIndexUrl(indexUrl) {
      return await courseService.getCourseByIndexUrl(indexUrl);
    },
    async getCourseVisit(courseId) {
      return await courseService.getCourseVisit(courseId);
    },
    downloadCurrentVideoNotes(currentModule, currentVideo) {
      let video_name = currentVideo.name;
      video_name = video_name.split(" ").join("+");
      const urlLink = Base64.decode(currentVideo.attachments[0].url);
      window.open(urlLink);
    },
    downloadCurrentModuleNotes(currentModule) {
      let name = currentModule.name;
      name = name.split(" ").join("+");
      let id = currentModule.id;
      window.open(
        "https://nearpeer-zips.s3.amazonaws.com/moduleZips/" +
          name +
          "-" +
          id +
          ".zip",
        "_blank"
      );
    },
    async reactUpdateProgress(trackID) {
      let data = await courseService.reactUpdateProgress(
        this.currentCourseDetails.id,
        this.device_id
      );
      this.dataToUpdate = data.data;

      if (this.dataToUpdate.downloadedVideosCount > 0) {
        if (
          this.dataToUpdate.downloadedVideosCount > 0 &&
          parseInt(this.dataToUpdate.downloadedVideosCount) !==
            parseInt(this.currentCourseDetails.videosCount)
        ) {
          Object.keys(this.downloadingStatusCourses).forEach(element => {
            this.downloadingStatusCourses[element] = false;
          });
          this.courseDownloadPercentage = (
            (parseInt(this.dataToUpdate.downloadedVideosCount) /
              parseInt(this.currentCourseDetails.videosCount)) *
            100
          ).toFixed(0);
          this.courseDownloadInProgress = true;
        } else if (
          parseInt(this.dataToUpdate.downloadedVideosCount) > 0 &&
          parseInt(this.dataToUpdate.downloadedVideosCount) ===
            parseInt(this.currentCourseDetails.videosCount)
        ) {
          Object.keys(this.downloadingStatusCourses).forEach(element => {
            if (element === "downloadedIcon") {
              this.downloadingStatusCourses[element] = true;
            } else {
              this.downloadingStatusCourses[element] = false;
            }
          });
          this.courseDownloadPercentage = (
            (parseInt(this.dataToUpdate.downloadedVideosCount) /
              parseInt(this.currentCourseDetails.videosCount)) *
            100
          ).toFixed(0);
          this.courseDownloadInProgress = false;
        } else if (parseInt(this.dataToUpdate.downloadedVideosCount) === 0) {
          Object.keys(this.downloadingStatusCourses).forEach(element => {
            if (element === "downloadIcon") {
              this.downloadingStatusCourses[element] = true;
            } else {
              this.downloadingStatusCourses[element] = false;
            }
          });
          this.courseDownloadInProgress = false;
        } else {
          Object.keys(this.downloadingStatusCourses).forEach(element => {
            if (element === "downloadIcon") {
              this.downloadingStatusCourses[element] = true;
            } else {
              this.downloadingStatusCourses[element] = false;
            }
          });
          this.courseDownloadInProgress = false;
        }
      } else {
        this.courseDownloadInProgress = false;
        Object.keys(this.downloadingStatusCourses).forEach(element => {
          if (element === "downloadIcon") {
            this.downloadingStatusCourses[element] = true;
          } else {
            this.downloadingStatusCourses[element] = false;
          }
        });
      }

      if (trackID) {
        this.moduleObj.moduleInfo.forEach(modInfo => {
          console.log(
            "Mod update" +
              JSON.stringify(this.dataToUpdate.moduleDownloadedVideosCount),
            modInfo
          );
          let modProgress = 0;
          let modDownloaded = false;
          let modDownloading = false;
          let modDownload = true;
          let modResumed = false;
          let altered = false;

          if (this.dataToUpdate.moduleDownloadedVideosCount) {
            this.dataToUpdate.moduleDownloadedVideosCount.forEach(m => {
              if (m._id === modInfo.id) {
                if (this.dataToUpdate.downloadedVideosCount > 0) {
                  if (m.count !== parseInt(modInfo.moduleVideosCount)) {
                    modProgress = (
                      (m.count / parseInt(modInfo.moduleVideosCount)) *
                      100
                    ).toFixed();
                    modDownloaded = false;
                    modDownloading = true;
                    modDownload = false;
                    modResumed = true;
                    altered = false;
                    // if (
                    //   trackID === m.id ||
                    //   modInfo.downloadingStatusModules.altered
                    // ) {
                    //   modResumed = true;
                    //   altered = true;
                    // } else {
                    //   modResumed = false;
                    //   altered = false;
                    // }
                  } else if (m.count === parseInt(modInfo.moduleVideosCount)) {
                    modProgress = (
                      (m.count / parseInt(modInfo.moduleVideosCount)) *
                      100
                    ).toFixed();
                    modDownloaded = true;
                    modDownloading = false;
                    modDownload = false;
                    modResumed = false;
                    altered = false;
                  }
                  // else {
                  //   modProgress = (
                  //     (m.count / parseInt(modInfo.moduleVideosCount)) *
                  //     100
                  //   ).toFixed();
                  //   modDownloaded = false;
                  //   modDownloading = false;
                  //   modDownload = true;
                  //   modResumed = false;
                  //   altered = false;
                  // }
                }

                modInfo.downloadingStatusModules = {
                  downloadIcon: modDownload,
                  downloadedIcon: modDownloaded,
                  downloadingIcon: modDownloading,
                  progress: modProgress,
                  moduleResumed: modResumed,
                  altered: altered
                };
              } else {
                // modProgress = (
                //   (m.count / parseInt(modInfo.moduleVideosCount)) *
                //   100
                // ).toFixed();
                modDownloaded = false;
                modDownloading = false;
                modDownload = true;
                modResumed = false;
                altered = false;

                modInfo.downloadingStatusModules = {
                  downloadIcon: modDownload,
                  downloadedIcon: modDownloaded,
                  downloadingIcon: modDownloading,
                  progress: modProgress,
                  moduleResumed: modResumed,
                  altered: altered
                };
              }
            });
          }
        });
      }
      console.log("breakTheIntervalForRefreshCall");
    },
    async reactOverAllUpdate() {
      let data = await courseService.reactUpdateProgress(
        this.currentCourseDetails.id,
        this.device_id
      );
      this.dataToUpdate = data.data;

      if (this.dataToUpdate.downloadedVideosCount > 0) {
        if (
          this.dataToUpdate.downloadedVideosCount > 0 &&
          parseInt(this.dataToUpdate.downloadedVideosCount) !==
            parseInt(this.currentCourseDetails.videosCount)
        ) {
          Object.keys(this.downloadingStatusCourses).forEach(element => {
            this.downloadingStatusCourses[element] = false;
          });
          this.courseDownloadPercentage = (
            (parseInt(this.dataToUpdate.downloadedVideosCount) /
              parseInt(this.currentCourseDetails.videosCount)) *
            100
          ).toFixed(0);
          this.courseDownloadInProgress = true;
        } else if (
          parseInt(this.dataToUpdate.downloadedVideosCount) > 0 &&
          parseInt(this.dataToUpdate.downloadedVideosCount) ===
            parseInt(this.currentCourseDetails.videosCount)
        ) {
          Object.keys(this.downloadingStatusCourses).forEach(element => {
            if (element === "downloadedIcon") {
              this.downloadingStatusCourses[element] = true;
            } else {
              this.downloadingStatusCourses[element] = false;
            }
          });
          this.courseDownloadPercentage = (
            (parseInt(this.dataToUpdate.downloadedVideosCount) /
              parseInt(this.currentCourseDetails.videosCount)) *
            100
          ).toFixed(0);
          this.courseDownloadInProgress = false;
        } else if (parseInt(this.dataToUpdate.downloadedVideosCount) === 0) {
          Object.keys(this.downloadingStatusCourses).forEach(element => {
            if (element === "downloadIcon") {
              this.downloadingStatusCourses[element] = true;
            } else {
              this.downloadingStatusCourses[element] = false;
            }
          });
          this.courseDownloadInProgress = false;
        } else {
          Object.keys(this.downloadingStatusCourses).forEach(element => {
            if (element === "downloadIcon") {
              this.downloadingStatusCourses[element] = true;
            } else {
              this.downloadingStatusCourses[element] = false;
            }
          });
          this.courseDownloadInProgress = false;
        }
      } else {
        this.courseDownloadInProgress = false;
        Object.keys(this.downloadingStatusCourses).forEach(element => {
          if (element === "downloadIcon") {
            this.downloadingStatusCourses[element] = true;
          } else {
            this.downloadingStatusCourses[element] = false;
          }
        });
      }

      this.moduleObj.moduleInfo.forEach(modInfo => {
        console.log(
          "Mod update" +
            JSON.stringify(this.dataToUpdate.moduleDownloadedVideosCount),
          modInfo
        );
        let modProgress = 0;
        let modDownloaded = false;
        let modDownloading = false;
        let modDownload = true;
        let modResumed = false;
        let altered = false;

        if (this.dataToUpdate.moduleDownloadedVideosCount) {
          this.dataToUpdate.moduleDownloadedVideosCount.forEach(m => {
            if (m._id === modInfo.id) {
              if (this.dataToUpdate.downloadedVideosCount > 0) {
                if (m.count !== parseInt(modInfo.moduleVideosCount)) {
                  modProgress = (
                    (m.count / parseInt(modInfo.moduleVideosCount)) *
                    100
                  ).toFixed();
                  modDownloaded = false;
                  modDownloading = true;
                  modDownload = false;
                  modResumed = true;
                  altered = false;
                  // if (
                  //   trackID === m.id ||
                  //   modInfo.downloadingStatusModules.altered
                  // ) {
                  //   modResumed = true;
                  //   altered = true;
                  // } else {
                  //   modResumed = false;
                  //   altered = false;
                  // }
                } else if (m.count === parseInt(modInfo.moduleVideosCount)) {
                  modProgress = (
                    (m.count / parseInt(modInfo.moduleVideosCount)) *
                    100
                  ).toFixed();
                  modDownloaded = true;
                  modDownloading = false;
                  modDownload = false;
                  modResumed = false;
                  altered = false;
                }
                // else {
                //   modProgress = (
                //     (m.count / parseInt(modInfo.moduleVideosCount)) *
                //     100
                //   ).toFixed();
                //   modDownloaded = false;
                //   modDownloading = false;
                //   modDownload = true;
                //   modResumed = false;
                //   altered = false;
                // }
              }

              modInfo.downloadingStatusModules = {
                downloadIcon: modDownload,
                downloadedIcon: modDownloaded,
                downloadingIcon: modDownloading,
                progress: modProgress,
                moduleResumed: modResumed,
                altered: altered
              };
            } else {
              // modProgress = (
              //   (m.count / parseInt(modInfo.moduleVideosCount)) *
              //   100
              // ).toFixed();
              modDownloaded = false;
              modDownloading = false;
              modDownload = true;
              modResumed = false;
              altered = false;

              modInfo.downloadingStatusModules = {
                downloadIcon: modDownload,
                downloadedIcon: modDownloaded,
                downloadingIcon: modDownloading,
                progress: modProgress,
                moduleResumed: modResumed,
                altered: altered
              };
            }
          });
        }
      });
      console.log("breakTheIntervalForOverallRefreshCall");
    },
    async reactUpdateonDelete(trackID) {
      let data = await courseService.reactUpdateProgress(
        this.currentCourseDetails.id,
        this.device_id
      );
      this.dataToUpdate = data.data;
      console.log(JSON.stringify(data.data));
      if (this.dataToUpdate.downloadedVideosCount > 0) {
        if (
          this.dataToUpdate.downloadedVideosCount > 0 &&
          parseInt(this.dataToUpdate.downloadedVideosCount) !==
            parseInt(this.currentCourseDetails.videosCount)
        ) {
          Object.keys(this.downloadingStatusCourses).forEach(element => {
            this.downloadingStatusCourses[element] = false;
          });
          this.courseDownloadPercentage = (
            (parseInt(this.dataToUpdate.downloadedVideosCount) /
              parseInt(this.currentCourseDetails.videosCount)) *
            100
          ).toFixed(0);
          this.courseDownloadInProgress = true;
        } else if (
          parseInt(this.dataToUpdate.downloadedVideosCount) > 0 &&
          parseInt(this.dataToUpdate.downloadedVideosCount) ===
            parseInt(this.currentCourseDetails.videosCount)
        ) {
          Object.keys(this.downloadingStatusCourses).forEach(element => {
            if (element === "downloadedIcon") {
              this.downloadingStatusCourses[element] = true;
            } else {
              this.downloadingStatusCourses[element] = false;
            }
          });
          this.courseDownloadPercentage = (
            (parseInt(this.dataToUpdate.downloadedVideosCount) /
              parseInt(this.currentCourseDetails.videosCount)) *
            100
          ).toFixed(0);
          this.courseDownloadInProgress = false;
        } else if (parseInt(this.dataToUpdate.downloadedVideosCount) === 0) {
          Object.keys(this.downloadingStatusCourses).forEach(element => {
            if (element === "downloadIcon") {
              this.downloadingStatusCourses[element] = true;
            } else {
              this.downloadingStatusCourses[element] = false;
            }
          });
          this.courseDownloadInProgress = false;
        } else {
          Object.keys(this.downloadingStatusCourses).forEach(element => {
            if (element === "downloadIcon") {
              this.downloadingStatusCourses[element] = true;
            } else {
              this.downloadingStatusCourses[element] = false;
            }
          });
          this.courseDownloadInProgress = false;
        }
      } else {
        this.courseDownloadInProgress = false;
        Object.keys(this.downloadingStatusCourses).forEach(element => {
          if (element === "downloadIcon") {
            this.downloadingStatusCourses[element] = true;
          } else {
            this.downloadingStatusCourses[element] = false;
          }
        });
      }

      if (trackID) {
        console.log(
          "TRACKID" +
            parseInt(trackID) +
            JSON.stringify(this.dataToUpdate) +
            trackID +
            typeof trackID
        );
        console.log("beforeLoop");
        this.moduleObj.moduleInfo.forEach(modInfo => {
          let modProgress = 0;
          console.log("inLoop");

          let modDownloaded = false;
          let modDownloading = false;
          let modDownload = true;
          let modResumed = false;
          let altered = false;
          console.log("beforeplus+++++++");
          if (this.dataToUpdate.moduleDownloadedVideosCount) {
            this.dataToUpdate.moduleDownloadedVideosCount.forEach(m => {
              console.log(
                "plus+++++++" + m._id === modInfo.id &&
                  modInfo.id == parseInt(trackID)
              );
              if (m._id === modInfo.id && modInfo.id == parseInt(trackID)) {
                if (m.count !== parseInt(modInfo.moduleVideosCount)) {
                  modProgress = (
                    (m.count / parseInt(modInfo.moduleVideosCount)) *
                    100
                  ).toFixed();
                  modDownloaded = false;
                  modDownloading = true;
                  modDownload = false;
                  modResumed = true;
                  altered = false;
                } else if (m.count === parseInt(modInfo.moduleVideosCount)) {
                  modProgress = (
                    (m.count / parseInt(modInfo.moduleVideosCount)) *
                    100
                  ).toFixed();
                  modDownloaded = true;
                  modDownloading = false;
                  modDownload = false;
                  modResumed = false;
                  altered = false;
                }

                modInfo.downloadingStatusModules = {
                  downloadIcon: modDownload,
                  downloadedIcon: modDownloaded,
                  downloadingIcon: modDownloading,
                  progress: modProgress,
                  moduleResumed: modResumed,
                  altered: altered
                };
              } else if (modInfo.id == parseInt(trackID)) {
                modProgress = 0;
                modDownloaded = false;
                modDownloading = false;
                modDownload = true;
                modResumed = false;
                altered = false;
                modInfo.downloadingStatusModules = {
                  downloadIcon: modDownload,
                  downloadedIcon: modDownloaded,
                  downloadingIcon: modDownloading,
                  progress: modProgress,
                  moduleResumed: modResumed,
                  altered: altered
                };
              }
            });
          } else if (modInfo.id == parseInt(trackID)) {
            modProgress = 0;
            modDownloaded = false;
            modDownloading = false;
            modDownload = true;
            modResumed = false;
            altered = false;
            modInfo.downloadingStatusModules = {
              downloadIcon: modDownload,
              downloadedIcon: modDownloaded,
              downloadingIcon: modDownloading,
              progress: modProgress,
              moduleResumed: modResumed,
              altered: altered
            };
          }
        });
      } else {
        console.log("TrackIDNotWorking");
      }
      console.log("breakTheIntervalForDeleteCall");
    },

    setVideosInModule() {
      // if(this.reactApp){
      //   this.isPageLoading = true;
      // }
      if (
        this.moduleObj.moduleProgressInfo?.modules
          ? this.moduleObj.moduleProgressInfo?.modules.length > 0
          : []
      ) {
        this.moduleObj.moduleInfo.forEach(modInfo => {
          console.log("MODDDDDDDD", modInfo);
          let modProgress = 0;
          let modDownloaded = false;
          let modDownloading = false;
          let modDownload = true;
          let modResumed = false;
          let altered = false;
          if (modInfo.moduleDownloadCount > 0) {
            if (
              modInfo.moduleDownloadCount !==
              parseInt(modInfo.moduleVideosCount)
            ) {
              modProgress = (
                (modInfo.moduleDownloadCount /
                  parseInt(modInfo.moduleVideosCount)) *
                100
              ).toFixed();
              modDownloaded = false;
              modDownloading = true;
              modDownload = false;
              modResumed = true;
            } else if (
              modInfo.moduleDownloadCount ===
              parseInt(modInfo.moduleVideosCount)
            ) {
              modProgress = (
                (modInfo.moduleDownloadCount /
                  parseInt(modInfo.moduleVideosCount)) *
                100
              ).toFixed();
              modDownloaded = true;
              modDownloading = false;
              modDownload = false;
              modResumed = false;
            } else {
              // modProgress = (
              //   (m.count / parseInt(modInfo.moduleVideosCount)) *
              //   100
              // ).toFixed();
              modDownloaded = false;
              modDownloading = false;
              modDownload = true;
              modResumed = false;
              altered = false;
            }
          }
          modInfo.downloadingStatusModules = {
            downloadIcon: modDownload,
            downloadedIcon: modDownloaded,
            downloadingIcon: modDownloading,
            progress: modProgress,
            moduleResumed: modResumed,
            altered: altered
          };
          this.moduleObj.moduleProgressInfo?.modules
            ? this.moduleObj.moduleProgressInfo?.modules.forEach(mods => {
                if (modInfo.id == mods.module_id) {
                  modInfo.isComingSoon = mods.isComingSoon;
                  modInfo.progress = mods.progress;
                  if (
                    modInfo.content?.content == "chapters" &&
                    modInfo.content?.chapters.length > 0
                  ) {
                    modInfo.isComingSoon = false;
                    modInfo.content.chapters.forEach(chapter => {
                      ((chapter || {}).videos || []).forEach(video => {
                        mods.videos.forEach(trackVideo => {
                          if (video.id == trackVideo.id) {
                            video.videoLastStat = trackVideo.videoLastStat;
                            video.watched = trackVideo.watched;
                            video.isResume = trackVideo.isResume;
                            video.isStart = trackVideo.isStart;
                          }
                        });
                      });
                    });
                    this.isPageLoading = false;
                  } else if (
                    modInfo.content?.content == "videos" &&
                    modInfo.content?.videos.length > 0
                  ) {
                    modInfo.isComingSoon = false;
                    modInfo.content?.videos.forEach(video => {
                      mods.videos.forEach(trackVideo => {
                        if (video.id == trackVideo.id) {
                          video.videoLastStat = trackVideo.videoLastStat;
                          video.watched = trackVideo.watched;
                          video.isResume = trackVideo.isResume;
                          video.isStart = trackVideo.isStart;
                        }
                      });
                    });
                    this.isPageLoading = false;
                  }
                }
              })
            : [];
        });
      }
      // if(this.reactApp){
      // this.isPageLoading = false;
      // }
    },

    async initialization() {
      if (this.user?.user_visits) {
        if (
          this.user?.user_visits?.visited_course_details == null ||
          !this.user.user_visits.visited_course_details
        ) {
          ((this.user || {}).user_visits || {}).visited_course_details = true;
          customStorageService.setUser(this.user);
          this.walkThrough = true;
          let obj = {
            uid: this.user.id,
            visited_course_details: true
          };
          await appService.postUserVisited(obj);
        }
      }
      if (this.user.user_type === "guest") {
        this.isGuest = true;
      } else {
        this.isGuest = false;
      }
      let indexUrl =
        this.$route.params.faculty +
        "/" +
        this.$route.params.facultyDetails +
        "/" +
        this.$route.params.course;
      customStorageService.setCourseIndexUrl(indexUrl);
      this.courseIndexUrl = indexUrl;
      const parallelRes = await Promise.all([
        courseService.getCourseProgress(this.courseId, this.user.id),
        courseService.getAllModulesData(
          indexUrl,
          this.user.id,
          null,
          this.device_id
        )
      ]);

      let response = parallelRes[0];
      let courses = parallelRes[1];
      this.moduleObj.moduleInfo = courses?.data?.course?.courseData?.modules;
      this.currentCourseDetails = courses?.data?.course?.courseData;
      delete this.currentCourseDetails.modules;
      this.currentCourse = courses.data.course;
      this.courseStatus.id = this.currentCourseDetails.id;
      this.crumbs = [];
      if (this.crumbs.length === 0) {
        const flag = customStorageService.getBreadcrumbFlag();
        if (flag === "true") {
          this.crumbs.push({
            name: "Nearpeer.org",
            url:
              process.env.VUE_APP_FRONTEND_BASE_URL +
              "/" +
              this.currentCourseDetails.index_url,
            imageurl: "---"
          });
        } else {
          this.crumbs.push({
            name: "Nearpeer.org",
            url: "/course/course-landing",
            imageurl: "---"
          });
        }
        this.crumbs.push({
          name: this.currentCourseDetails.name,
          url:
            "/course/course-detail" +
            "/" +
            this.currentCourseDetails.index_url +
            "/" +
            this.currentCourseDetails.id
        });
      }
      // console.log("courseChanged c", this.currentCourseDetails); ///DONOT REMOVE THIS CONSOLE

      console.log("courseChanged" + this.currentCourseDetails.id); ///DONOT REMOVE THIS CONSOLE

      console.log(
        "current course",
        this.courseStatus,
        this.currentCourse,
        this.currentCourseDetails
      );
      if (
        !this.currentCourse.coursePurchased &&
        this.currentCourseDetails.paid
      ) {
        this.downloadDisabledCourse = true;
      } else if (!this.currentCourse.courseData.downloadAccess) {
        this.downloadDisabledCourse = true;
      } else if (
        this.currentCourse.coursePurchased &&
        this.currentCourseDetails.paid
      ) {
        this.downloadDisabledCourse = false;
        if (
          parseInt(this.currentCourseDetails.downloadedVideos) > 0 &&
          parseInt(this.currentCourseDetails.downloadedVideos) !==
            parseInt(this.currentCourseDetails.videosCount)
        ) {
          Object.keys(this.downloadingStatusCourses).forEach(element => {
            this.downloadingStatusCourses[element] = false;
          });
          this.courseDownloadPercentage = (
            (parseInt(this.currentCourseDetails.downloadedVideos) /
              parseInt(this.currentCourseDetails.videosCount)) *
            100
          ).toFixed(0);
          this.courseDownloadInProgress = true;
        } else if (
          parseInt(this.currentCourseDetails.downloadedVideos) > 0 &&
          parseInt(this.currentCourseDetails.downloadedVideos) ===
            parseInt(this.currentCourseDetails.videosCount)
        ) {
          Object.keys(this.downloadingStatusCourses).forEach(element => {
            if (element === "downloadedIcon") {
              this.downloadingStatusCourses[element] = true;
            } else {
              this.downloadingStatusCourses[element] = false;
            }
          });
          this.courseDownloadPercentage = (
            (parseInt(this.currentCourseDetails.downloadedVideos) /
              parseInt(this.currentCourseDetails.videosCount)) *
            100
          ).toFixed(0);
          this.courseDownloadInProgress = false;
        } else if (parseInt(this.currentCourseDetails.downloadedVideos) === 0) {
          Object.keys(this.downloadingStatusCourses).forEach(element => {
            if (element === "downloadIcon") {
              this.downloadingStatusCourses[element] = true;
            } else {
              this.downloadingStatusCourses[element] = false;
            }
          });
          this.courseDownloadInProgress = false;
        } else {
          this.courseDownloadInProgress = false;
        }
      } else if (
        !this.currentCourse.coursePurchased &&
        !this.currentCourseDetails.paid
      ) {
        this.downloadDisabledCourse = false;
        if (
          parseInt(this.currentCourseDetails.downloadedVideos) > 0 &&
          parseInt(this.currentCourseDetails.downloadedVideos) !==
            parseInt(this.currentCourseDetails.videosCount)
        ) {
          this.courseDownloadPercentage = (
            (parseInt(this.currentCourseDetails.downloadedVideos) /
              parseInt(this.currentCourseDetails.videosCount)) *
            100
          ).toFixed(0);
          this.courseDownloadInProgress = true;
        } else if (
          parseInt(this.currentCourseDetails.downloadedVideos) > 0 &&
          parseInt(this.currentCourseDetails.downloadedVideos) ===
            parseInt(this.currentCourseDetails.videosCount)
        ) {
          Object.keys(this.downloadingStatusCourses).forEach(element => {
            if (element === "downloadedIcon") {
              this.downloadingStatusCourses[element] = true;
            } else {
              this.downloadingStatusCourses[element] = false;
            }
          });
          this.courseDownloadPercentage = (
            (parseInt(this.currentCourseDetails.downloadedVideos) /
              parseInt(this.currentCourseDetails.videosCount)) *
            100
          ).toFixed(0);
          this.courseDownloadInProgress = false;
        } else if (parseInt(this.currentCourseDetails.downloadedVideos) === 0) {
          Object.keys(this.downloadingStatusCourses).forEach(element => {
            if (element === "downloadIcon") {
              this.downloadingStatusCourses[element] = true;
            } else {
              this.downloadingStatusCourses[element] = false;
            }
          });
          this.courseDownloadInProgress = false;
        } else {
          this.courseDownloadInProgress = false;
        }
      }

      console.log(
        "DDDDDDD" + JSON.stringify(this.courseDownloadPercentage),
        +JSON.stringify(this.courseDownloadInProgress)
      );

      this.viewLess = !this.viewLess;
      this.viewLess = !this.viewLess;
      this.moduleObj.moduleProgressInfo = response.data?.data;
      this.setVideosInModule();
      this.isPageLoading = false;
      this.startTimer();
      const courseVisitsRes = await courseService.getCourseVisit(this.courseId);
      this.currentCourseVisits = courseVisitsRes.data?.visits;

      console.log("courseDetailPageLoaded");
      // this.reactUpdateProgress();
    },
    async checkCourseAccess() {
      const downloadAccessRes = await courseService.checkDownloadAccess();
      if (
        downloadAccessRes &&
        downloadAccessRes.data &&
        !downloadAccessRes.data.allowDownload
      ) {
        // console.log("in here", downloadAccessRes);
        this.downloadDisabled = true;
        this.downloadErrorMessage = downloadAccessRes.data.downloadErrorMessage;
      }
    },
    async cancelDownload() {
      console.log("Current Course Details ", this.currentCourseDetails);
      console.log("cancelCourse" + this.currentCourseDetails.id); ///DONOT REMOVE THIS CONSOLE
      console.log(JSON.stringify(this.currentlyDownloadingCourse));
      Object.keys(this.downloadingStatusCourses).forEach(element => {
        console.log(element, "ELEMENT");
        if (element == "downloadIcon") {
          this.downloadingStatusCourses[element] = true;
        } else {
          this.downloadingStatusCourses[element] = false;
        }
      });
      this.reactAppStatesModule();
    },
    async cancelDownloadModule(modDetails, index) {
      this.currentModule = modDetails;
      /// have to send module id to react native
      console.log("Current Module Details ", this.currentModule);
      console.log("cancelModule" + modDetails.id); ///DONOT REMOVE THIS CONSOLE

      console.log(JSON.stringify(this.currentlyDownloadingModules));
      Object.keys(this.currentModule.downloadingStatusModules).forEach(
        element => {
          console.log(element, "ELEMENT");
          if (element == "downloadIcon") {
            this.currentModule.downloadingStatusModules[element] = true;
          } else {
            this.currentModule.downloadingStatusModules[element] = false;
          }
        }
      );
      this.moduleObj.moduleInfo[index] = this.currentModule;
      this.$forceUpdate();

      console.log("updated", this.moduleObj.moduleInfo[index]);
    },
    async downloadCourse() {
      console.log("Current Course Details ", this.currentCourseDetails);
      console.log("courseID" + this.currentCourseDetails.id); ///DONOT REMOVE THIS CONSOLE
      console.log(JSON.stringify(this.currentlyDownloadingCourse));
      this.currentlyDownloadingCourse.push(this.currentCourseDetails.id);
      // this.reactAppStates();
      // customStorageService.setVideoDownloading(this.currentlyDownloadingCourse);
      console.log("downloadClickedCourse"); ///DONOT REMOVE THIS CONSOLE
    },
    async downloadModule(modDetails, index) {
      this.currentModule = { ...modDetails };
      console.log("Current Module Details ", modDetails);
      console.log("moduleID" + modDetails.id + "?" + modDetails.course_id); ///DONOT REMOVE THIS CONSOLE
      console.log(JSON.stringify(this.currentlyDownloadingModules));
      // if (modDetails.id == 1992) {
      //   this.moduleProgressObject.push({
      //     module_id: modDetails.id,
      //     progress: 100,
      //   });
      // } else {
      //   this.moduleProgressObject.push({
      //     module_id: modDetails.id,
      //     progress: 75,
      //   });
      // }

      // this.reactAppStatesModule();

      console.log("downloadClickedModule"); ///DONOT REMOVE THIS CONSOLE

      // console.log("updated", this.moduleObj.moduleInfo[index]);
    },
    reactAppStates() {
      var checkDownloadingCourses = this.currentlyDownloadingCourse.findIndex(
        vid => vid == this.currentCourseDetails.id
      );
      var checkDownloadedCourses = this.currentlyDownloadedCourse.findIndex(
        cid => cid == this.currentCourseDetails.id
      );
      console.log(checkDownloadingCourses);
      console.log(checkDownloadedCourses);
      if (checkDownloadingCourses != -1) {
        Object.keys(this.downloadingStatusCourses).forEach(element => {
          console.log(element, "ELEMENT");
          if (element == "downloadingIcon") {
            this.downloadingStatusCourses[element] = true;
            setTimeout(() => {
              this.showCancelCourse = true;
            }, 5000);
          } else {
            this.downloadingStatusCourses[element] = false;
          }
        });

        return null;
      }
      if (checkDownloadedCourses != -1) {
        Object.keys(this.downloadingStatusCourses).forEach(element => {
          if (element == "downloadedIcon") {
            this.downloadingStatusCourses[element] = true;
          } else {
            this.downloadingStatusCourses[element] = false;
          }
        });
        return null;
      }

      Object.keys(this.downloadingStatusCourses).forEach(element => {
        if (element == "downloadIcon") {
          this.downloadingStatusCourses[element] = true;
          this.courseDownloadInProgress = false;
        } else {
          this.downloadingStatusCourses[element] = false;
        }
      });
    },
    reactAppStatesModule() {
      // moduleProgressObject
      this.moduleProgressObject.forEach(tempObj => {
        var moduleIndex = this.moduleObj.moduleInfo.findIndex((mid, i) => {
          if (mid.id == tempObj.module_id) {
            if (tempObj.progress == 100) {
              // if (moduleIndex != -1) {
              Object.keys(
                this.moduleObj.moduleInfo[i].downloadingStatusModules
              ).forEach(element => {
                console.log(element, "ELEMENT");
                if (element == "downloadedIcon") {
                  this.moduleObj.moduleInfo[i].downloadingStatusModules[
                    element
                  ] = true;
                } else if (element != "progress") {
                  this.moduleObj.moduleInfo[i].downloadingStatusModules[
                    element
                  ] = false;
                } else if (element == "progress") {
                  this.moduleObj.moduleInfo[i].downloadingStatusModules[
                    element
                  ] = 0;
                }
              });
              // }
            } else {
              console.log(this.moduleObj.moduleInfo[i]);
              // if (moduleIndex != -1) {
              Object.keys(
                (this.moduleObj || []).moduleInfo[i].downloadingStatusModules
              ).forEach(element => {
                console.log(element, "ELEMENT");
                if (element == "downloadingIcon") {
                  this.moduleObj.moduleInfo[i].downloadingStatusModules[
                    element
                  ] = true;
                } else if (element != "progress") {
                  this.moduleObj.moduleInfo[i].downloadingStatusModules[
                    element
                  ] = false;
                } else if (element == "progress") {
                  this.moduleObj.moduleInfo[i].downloadingStatusModules[
                    element
                  ] = tempObj.progress;
                }
              });
              // }
            }
          }
          // console.log(mid.id, tempObj.module_id, "MID");
        });

        // console.log(moduleIndex, "Module INdex", tempObj);
      });
      this.$forceUpdate();
    },
    removeDownloadedFromDownloading() {
      console.log(this.currentlyDownloadingCourse);

      var exists = this.currentlyDownloadingCourse.findIndex(
        vid => vid == this.courseId
      );
      if (exists != -1) {
        var inCourseDownloads = this.currentlyDownloadedCourse.findIndex(
          did => did == this.courseId
        );
        if (inCourseDownloads != -1) {
          this.currentlyDownloadingCourse.splice(exists, 1);
          // customStorageService.setVideoDownloading(this.currentlyDownloadingCourses);
        }
      }
    },
    removeDownloadedFromDownloadingModules() {
      console.log(this.currentlyDownloadingModules);

      var existsModule = this.currentlyDownloadingModules.findIndex(
        vid => vid == this.currentModule.id
      );
      if (existsModule != -1) {
        var inModuleDownloads = this.currentlyDownloadedModules.findIndex(
          did => did == this.currentModule.id
        );
        if (inModuleDownloads != -1) {
          this.currentlyDownloadingModules.splice(existsModule, 1);
          // customStorageService.setVideoDownloading(this.currentlyDownloadingCourses);
        }
      }
    },
    disabledDownload() {
      if (this.toastrShown === 0) {
        toastr.error("This course cannot be downloaded.");
        this.toastrShown = 1;
      }
    },
    disabledModule(module) {
      if (this.toastrShown === 0) {
        let errorMessage = module.downloadMessage;
        errorMessage = errorMessage ? errorMessage : this.downloadErrorMessage;
        toastr.error(
          errorMessage ? errorMessage : "Sorry, you can't download."
        );
        this.toastrShown = 1;
      }
    },
    async handleEvent(message) {
      ///DONOT CHANGE STATES IN THIS FUNCTION
      if (this.reactApp) {
        console.log("DATA");
        console.log(message.data.message);
        if (message.data.message == "downloadCourseStarted") {
          this.reactAppStates();
        } else if (message.data.message == "downloadModuleStarted") {
          ///id to be received by react native
          //filtering id to show status
          // this.reactAppStatesModule();
        } else if (message.data.message == "ProgressRefreshCall") {
          // await this.initialization();
          await this.reactUpdateProgress();
        } else if (message.data.message.includes("ProgressRefreshCallVideo")) {
          var modID = message.data.message.split("ProgressRefreshCallVideo");
          await this.reactUpdateProgress(modID[1]);
        } else if (message.data.message.includes("DeleteRefreshCall")) {
          var moduID = message.data.message.split("DeleteRefreshCall");
          await this.reactUpdateonDelete(moduID[1]);
        } else if (message.data.message.includes("reactOverAllUpdate")) {
          await this.reactOverAllUpdate();
        } else if (message.data.message.includes("downloadingModuleStatus")) {
          ///id to be received by react native
          var moduleTempObj = await message.data.message.split(
            "downloadingModuleStatus"
          );
          console.log(moduleTempObj);
          console.log("INDOWNLOADCOURSE" + moduleTempObj[1]);
          var moduleObj = await JSON.parse(moduleTempObj[1]);
          console.log(JSON.stringify(moduleObj) + "moduleTempObj");
          this.moduleProgressObject = moduleObj;

          this.reactAppStatesModule();
        } else if (message.data.message.includes("downloadingCourseStatus")) {
          var courseTempObj = await message.data.message.split(
            "downloadingCourseStatus"
          );
          console.log(courseTempObj);
          console.log("INDOWNLOADCOURSE" + courseTempObj[1]);
          var courseObj = await JSON.parse(courseTempObj[1]);
          console.log(JSON.stringify(courseObj) + "courseOBJ");
          console.log(
            "Course Obj" +
              JSON.stringify(courseObj.course_id + this.courseStatus.id)
          );
          console.log(
            "Equal or not" + courseObj.course_id == this.courseStatus.id
          );

          // if (courseObj.course_id == this.courseStatus.id) {
          this.courseStatus.downloadedVideos = courseObj.downloadedVideos;
          this.courseStatus.totalVideos = courseObj.totalVideos;
          this.courseStatus.completeStatus = courseObj.completeStatus;
          if (
            this.courseStatus.downloadedVideos ==
              this.courseStatus.totalVideos &&
            this.courseStatus.completeStatus
          ) {
            this.currentlyDownloadedCourse.push([courseObj.course_id]);

            this.removeDownloadedFromDownloading();
          } else if (
            this.courseStatus.downloadedVideos !==
              this.courseStatus.totalVideos &&
            this.courseStatus.completeStatus
          ) {
            this.currentlyDownloadedCourse = [];
            this.currentlyDownloadingCourse = [];
          } else if (
            this.courseStatus.downloadedVideos !==
              this.courseStatus.totalVideos &&
            !this.courseStatus.completeStatus
          ) {
            this.currentlyDownloadingCourse.push([courseObj.course_id]);
          } else if (
            this.courseStatus.downloadedVideos ==
              this.courseStatus.totalVideos &&
            !this.courseStatus.completeStatus
          ) {
            this.currentlyDownloadedCourse = [];
            this.currentlyDownloadingCourse = [];
          }
          this.reactAppStates();
          ///id to be received by react native

          //filtering id to show status
          // this.reactAppStatesModule();
          // }
        } else if (message.data.message.includes("modulePercentage")) {
          var totalPercentage = await message.data.message.split("totalVideos");
          console.log(totalPercentage);
          console.log(totalPercentage[1]);
          this.totalModulePercentage = totalPercentage[1];
        } else if (message.data.message.includes("totalVideos")) {
          var total = await message.data.message.split("totalVideos");
          console.log(total);
          console.log(total[1]);
          this.totalVideos = total[1];
        } else if (message.data.message.includes("downloadedVideos")) {
          var totalV = await message.data.message.split("downloadedVideos");
          console.log(totalV);
          console.log(totalV[1]);
          this.downloadedVideos = totalV[1];
        } else if (message.data.message.includes("device_id")) {
          var token = message.data.message.split("device_id");
          this.device_id = token[1];
          console.log("deviceIdReceived");
          console.log("deviceCheck" + JSON.stringify(token[1]));
          customStorageService.setDeviceId(this.device_id);
          // this.isPageLoading = true;
          await this.initialization();
          courseService.calculateStats(this.courseId);
        } else if (message.data.message == "downloadCompletedCourse") {
          this.removeDownloadedFromDownloading();
          this.reactAppStates();
        } else if (message.data.message.includes("downloadFailedCourse")) {
          var failedId = await message.data.message.split(
            "downloadFailedCourse"
          );
          console.log(failedId);
          console.log(failedId[0]);

          console.log(failedId[1]);
          var idToRemove = this.currentlyDownloadingCourse.findIndex(
            vid => vid == failedId[1]
          );
          console.log(idToRemove);

          this.currentlyDownloadingCourse.splice(idToRemove, 1);
          // customStorageService.setVideoDownloading(this.currentlyDownloadingCourse);
          console.log(this.currentlyDownloadingCourse);
          this.removeDownloadedFromDownloading();
          this.reactAppStates();
        } else if (message.data.message.includes("downloadFailedModule")) {
          var failedModId = await message.data.message.split(
            "downloadFailedModule"
          );
          console.log(failedModId);
          console.log(failedModId[0]);

          console.log(failedModId[1]);

          var moduleIndex = this.moduleObj.moduleInfo.findIndex((mid, i) => {
            if (mid.id == failedModId[1]) {
              Object.keys(
                this.moduleObj.moduleInfo[i].downloadingStatusModules
              ).forEach(element => {
                console.log(element, "ELEMENT");
                if (element == "downloadIcon") {
                  this.moduleObj.moduleInfo[i].downloadingStatusModules[
                    element
                  ] = true;
                } else if (element != "progress") {
                  this.moduleObj.moduleInfo[i].downloadingStatusModules[
                    element
                  ] = false;
                } else if (element == "progress") {
                  this.moduleObj.moduleInfo[i].downloadingStatusModules[
                    element
                  ] = 0;
                }
              });
            }
            // console.log(mid.id, tempObj.module_id, "MID");
          });

          console.log(moduleIndex, "Module INdex", tempObj);

          this.$forceUpdate();
        } else if (Array.isArray(message.data.message)) {
          console.log("Objects From RN");
          console.log(JSON.stringify(message.data.message));
          var downloadedCourses = [...message.data.message];
          this.currentlyDownloadedCourse = [...message.data.message];
          console.log(JSON.stringify(downloadedCourses));
          console.log(this.selectedVideo.id);
          this.removeDownloadedFromDownloading();
          this.reactAppStates();
        } else if (message.data.message.downloading) {
          var downloadingArrayCourses = message.data.message.downloading;
          console.log(
            JSON.stringify(downloadingArrayCourses) + "DOWNLOAD TEST"
          );
        }
      }
    },
    selected(crumb) {
      console.log(crumb);
    }
  },

  async mounted() {
    let userAgent = navigator.userAgent;
    if (userAgent.includes("React-Native-NP")) {
      this.reactApp = true;
      if (userAgent.includes("React-Native-NP-IOS")) {
        this.reactAppIOS = true;
      }
      this.checkCourseAccess();
      console.log("inCourseDetailPage");
      this.toastrShown = 0;
      console.log("DEVICE_ID", customStorageService.getDeviceId());
      if (customStorageService.getDeviceId()) {
        this.device_id = customStorageService.getDeviceId();
      }
    }
    if (
      this.reactAppIOS ||
      !this.reactApp ||
      customStorageService.getDeviceId()
    ) {
      await this.initialization();
      courseService.calculateStats(this.courseId);
    }
    // await this.initialization();
    // courseService.calculateStats(this.courseId);

    // await this.initialization();

    // if (userAgent.includes("React-Native-NP")) {
    //   this.reactApp = true;
    // }
  },
  beforeDestroy() {
    // customStorageService.setVideoDownloading(this.currentlyDownloading);
  },
  destroyed() {
    if (this.reactApp) {
      console.log("exitCourseDetailPage");
    }
  },
  async created() {
    var listener = document.addEventListener("message", this.handleEvent); ///DONOT REMOVE THIS

    if (this.reactApp) {
      document.addEventListener("scroll", function(e) {
        let lastKnownScrollPosition = window.scrollY;
        let ticking;
        if (!ticking) {
          window.requestAnimationFrame(function() {
            console.log(lastKnownScrollPosition, "last scroll");
            if (lastKnownScrollPosition == 0) {
              console.log("scrollTop" + lastKnownScrollPosition);
            }
            ticking = false;
          });

          ticking = true;
        }
      });

      console.log("IN LISTENING EVENT", listener);
      console.log(listener); ///DONOT REMOVE THIS CONSOLE
      this.handleEvent(listener); ///DONOT REMOVE THIS
    }
  }
};
</script>

<style src="./course-detail.css" scoped></style>

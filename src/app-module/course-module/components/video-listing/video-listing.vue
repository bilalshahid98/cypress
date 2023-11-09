<template src="./video-listing.html"></template>

<script>
import customStorageService from "../../../app-services/custom-storage-service";
import courseService from "../../services/course-service";
import ClickOutside from "vue-click-outside";
import _ from "lodash";

var ChaptersVideosListBox = true;
var user = {};

export default {
  name: "app-video-listing",
  props: [
    "allModules",
    "selectedVideo",
    "currentCourse",
    "selectedModule",
    "selectedTrackModule",
    "selectedChapter",
    "coursePurchased",
    "dark",
    "selectedCourseIndex"
  ],
  data: function() {
    return {
      moduleListBox: false,
      ChaptersVideosListBox,
      chapters: [],
      videos: [],
      isPageLoading: true,
      setQuizzOnly: true,
      setVideosOnly: true,
      setNotesOnly: true,
      quizzExists: false,
      isModuleLoading: false
    };
  },
  directives: {
    ClickOutside
  },
  methods: {
    moduleListBoxHandler() {
      this.moduleListBox = !this.moduleListBox;
    },
    moduleListBoxClose() {
      this.moduleListBox = false;
    },
    ChapterListBoxHandler() {
      this.ChaptersVideosListBox = !this.ChaptersVideosListBox;
    },
    color() {
      if (this.dark == "yes") {
        let r = document.querySelector(":root");
        r.style.setProperty("--listing-page-bg", "transparent");
        r.style.setProperty("--listing-page-font-color", "#ffffff");
        r.style.setProperty("--listing-page-active-bg", "#e4e4e4");
        r.style.setProperty("--listing-page-row-hover", "#f5f6fa");
        this.dark = "no";
      } else {
        let r = document.querySelector(":root");
        r.style.setProperty("--listing-page-bg", "transparent");
        r.style.setProperty("--listing-page-font-color", "#000000");
        r.style.setProperty("--listing-page-active-bg", "#e4e4e4");
        r.style.setProperty("--listing-page-row-hover", "#f5f6fa");
      }
    },
    async getSelectedModule(module) {
      this.moduleListBox = !this.moduleListBox;
      if (!module.content) {
        this.isModuleLoading = true;
        let moduleContent = await courseService.getModuleData(
          module.course_id,
          module.id
        );
        this.selectedModule = moduleContent.data.content;
        this.$emit("setModuleVideos", this.selectedModule);
        this.isModuleLoading = false;
      } else {
        this.selectedModule = module;
      }

      this.$store.commit("setCurrentModule", this.selectedModule);

      if ((this.selectedModule || {}).content) {
        if (this.selectedModule.content.content == "chapters") {
          this.chapters = this.selectedModule.content.chapters;
          this.$store.commit("setChapterList", this.chapters);
          this.videos = this.selectedModule.content.chapters[0].videos;
          this.$store.commit("setVideoList", this.videos);

          this.$emit("toVideoMain", this.videos[0]);
          if (this.$route.params.videoId != this.videos[0].id) {
            this.$router.replace({
              name: "app-video-main",
              params: {
                moduleIndexUrl: this.selectedModule.index_url,
                moduleNo: this.selectedModule.id,
                videoId: this.videos[0].id
              },
              query: {
                courseIndexUrl: this.selectedCourseIndex
              }
            });
          }
        } else {
          this.videos = this.selectedModule.content.videos;
          this.getTrackVideosData();
          this.$store.commit("setVideoList", this.videos);

          this.chapters = [];
          this.$store.commit("setChapterList", this.chapters);

          this.$emit("toVideoMain", this.selectedModule.content.videos[0]);
          if (this.$route.params.videoId != this.videos[0]?.id) {
            this.$router.replace({
              name: "app-video-main",
              params: {
                moduleIndexUrl: this.selectedModule.index_url,
                moduleNo: this.selectedModule.id,
                videoId: this.videos[0]?.id
              },
              query: {
                courseIndexUrl: this.selectedCourseIndex
              }
            });
          }
        }

        this.checkQuizExists(this.videos);
      }
      this.$emit("setCurrentModToVideoMain", this.selectedModule);
    },
    filter(id) {
      if (id == 1) {
        this.setQuizzOnly = true;
        this.setVideosOnly = true;
        this.setNotesOnly = true;
        this.ChaptersVideosListBox = true;
      } else if (id == 2) {
        this.setVideosOnly = false;
        this.setQuizzOnly = true;
        this.setNotesOnly = false;
        this.ChaptersVideosListBox = true;
      } else if (id == 3) {
        this.setVideosOnly = true;
        this.setNotesOnly = false;
        this.setQuizzOnly = false;
        this.ChaptersVideosListBox = true;
      } else if (id == 4) {
        this.setVideosOnly = false;
        this.setQuizzOnly = false;
        this.setNotesOnly = true;
        this.ChaptersVideosListBox = true;
      }
    },
    getSelectedChapter(chapter) {
      this.selectedChapter = chapter;
      this.videos = this.selectedChapter.videos;
      this.getTrackVideosData();
      this.$store.commit("setVideoList", this.videos);
      // this.$emit("toVideoMain", this.videos[0]);
      this.$emit("selectedChapterInListing", chapter);
      this.$store.commit("setCurrentChapter", chapter);
      // if (this.$route.params.videoId != this.videos[0].id) {
      //   this.$router.replace({
      //     name: "app-video-main",
      //     params: {
      //       moduleIndexUrl: this.selectedModule.index_url,
      //       moduleNo: this.$route.params.moduleNo,
      //       videoId: this.videos[0].id
      //     }
      //   });
      // }
      this.checkQuizExists(this.videos);
      window.scrollTo(0, 0);
    },
    getCurrentVideo(currentVid) {
      this.selectedVideo = currentVid;
      this.$emit("toVideoMain", currentVid);
      if (this.$route.params.videoId != currentVid.id) {
        this.$router.replace({
          name: "app-video-main",
          params: {
            moduleIndexUrl: this.selectedModule.index_url,
            moduleNo: this.selectedModule.id,
            videoId: currentVid.id
          },
          query: {
            courseIndexUrl: this.selectedCourseIndex
          }
        });
      }
      window.scrollTo(0, 0);
    },
    getCurrentNotes(video, attachment) {
      this.selectedVideo = video;
      this.$emit("selectNotes", attachment);
      // this.$emit("toVideoMain", video);
      this.$router.replace({
        name: "app-video-main",
        params: {
          moduleIndexUrl: this.selectedModule.index_url,
          moduleNo: this.selectedModule.id,
          videoId: video.id
        },
        query: {
          notes: attachment.id,
          courseIndexUrl: this.selectedCourseIndex
        }
      });
      window.scrollTo(0, 0);
    },
    gotoQuiz(quiz) {
      if(quiz && quiz.quiz_type === 'daq') {
        this.$router.replace({
          name: "app-video-main",
          params: {
            moduleIndexUrl: this.selectedModule.index_url,
            moduleNo: this.selectedModule.id,
            videoId: quiz.id
          },
          query: {
            daq_id: quiz.id,
            daq: true,
            courseIndexUrl: this.selectedCourseIndex
          }
        });
        this.$emit("selectDaq", quiz);
        window.scrollTo(0, 0);
      } else {
        this.$router.push("/quiz/standard-quiz-main/" + quiz.id);
      }
      window.scrollTo(0, 0);
    },
    checkQuizExists(videos) {
      if (videos) {
        let quizz = videos.find(v => v.type == "quiz");

        if (quizz) {
          this.quizzExists = true;
        } else {
          this.quizzExists = false;
        }
      }
    },
    getTrackVideosData() {
      if (this.videos) {
        this.videos.forEach(video => {
          this.selectedTrackModule?.videos?.forEach(trackVideo => {
            if (video.id == trackVideo.id) {
              video.trackData = trackVideo;
            }
          });
        });
        this.$store.commit("setVideoList", this.videos);
        this.moduleListBox = !this.moduleListBox;
        this.moduleListBox = !this.moduleListBox;
      }
    },
    videoBodyHandler(id) {
      let element = document.getElementById("videoBody");
      setTimeout(() => {
        element.scrollTo(
          0,
          document.getElementById(id).offsetTop - element.offsetTop
        );
      }, 0.5);
    }
  },
  async mounted() {
    this.color();
    user = customStorageService.getUser();
    if ((this.selectedModule || {}).content) {
      if (this.selectedModule.content.content == "chapters") {
        this.chapters = this.selectedModule.content.chapters;
        this.$store.commit("setChapterList", this.chapters);
        if (this.selectedChapter && this.selectedChapter.videos) {
          this.videos = this.selectedChapter.videos;
        } else {
          this.videos = [];
        }
      } else {
        this.videos = this.selectedModule.content.videos;
        this.$store.commit("setChapterList", []);
      }
    }
    this.getTrackVideosData();
    this.$store.commit("setCurrentModule", this.selectedModule);
    this.$store.commit("setCurrentChapter", this.selectedChapter);
    this.$store.commit("setVideoList", this.videos);
    this.isPageLoading = false;
    this.checkQuizExists(this.videos);
  },
  beforeDestroy() {
    this.color();
  },
  destroyed() {
    this.color();
  },
  watch: {
    selectedTrackModule: async function(newModule, oldModule) {
      await this.getTrackVideosData();
    }
  }
};
</script>

<style src="./video-listing.css" scoped></style>

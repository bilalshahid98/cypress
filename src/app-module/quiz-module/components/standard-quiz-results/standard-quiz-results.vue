<template src="./standard-quiz-results.html"></template>

<script>
import { eventBus } from "../../../../main";
import QuizService from "../../services/quiz-service";
import appHeader from "./../../../shared-module/components/app-header/app-header.vue";
import appsidebar from "./../../../shared-module/components/app-sidebar/app-sidebar.vue";
import Bar from "./../../../course-module/components/charts/bars";
import HorizontalBar from "./../../../course-module/components/charts/horizontal-bars";
import SingleQuestionStat from "./../single-question-stat/single-question-stat.vue";
import _ from "lodash";
import pagination from "../../../shared-module/components/pagination/pagination";
import moment from "moment";
import ClickOutside from "vue-click-outside";
import courseService from "../../../course-module/services/course-service";
import customStorageService from "../../../app-services/custom-storage-service";
import { practiceSocketInit } from "../../services/practice-socket-service";
import MapChart from "vue-map-chart";
import VueHtml2Canvas from "vue-html2canvas";
import quizService from "../../services/quiz-service";
import appService from "../../../app-services/app-service";
import toastr from "toastr";
import breadCrumns from "../../../shared-module/components/bread-crumbs/bread-crumbs.vue";
import VueSpeedometer from "vue-speedometer";
import VueApexCharts from "vue-apexcharts";

// import Taiwan from "@svg-maps/taiwan";
let practiceSocket;
import { LMap, LTileLayer, LMarker, LTooltip, LPopup } from "vue2-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

L.Icon.Default.imagePath = "https://unpkg.com/leaflet@1.3.4/dist/images/";

export default {
  name: "app-standard-quiz-results",
  directives: {
    ClickOutside
  },
  data() {
    return {
      clap1: false,
      clap2: false,
      clap3: false,
      attemptedQuestions: [],
      widthGraph: "100%",
      isAllQuestions: false,
      pageType: "",
      resultId: "",
      result: {},
      resultDelay: "",
      totalAttempts: 0,
      grade: "NA",
      isPass: false,
      green: false,
      yellow: false,
      red: false,
      classQuizAverage: 0,
      question: {},
      questionNo: 1,
      questionsStats: [],
      topStudents: [{}],
      performanceTrendGraphData: [],
      trendGraphLabels: [],
      tagsGraphData: [],
      classTagsGraphLabels: [],
      suggestedVideos: [],
      allOptions: {},
      wireFrames: false,
      wireFramesT: false,
      wireFramesS: false,
      pageLoader: false,
      quizSummary: false,
      listBox: false,
      listBoxR: false,
      moduleIndex: "",
      courseId: "",
      moduleName: "",
      showAnimation: true,
      selectedCircle: "",
      allQuestions: true,
      correctQuestions: false,
      skippedQuestions: false,
      wrongQuestions: false,
      easy: false,
      medium: false,
      difficult: false,
      difficultyAll: true,
      isFilter: false,
      niche: "",
      customDescriptionWA: "",
      customDescription: "",
      currentCourseName: "",
      filteredQuestion: [],
      filters: { difficulty: 0, type: 0 },
      quizPosition: null,
      showTopicWeakness: true,
      showTopicStrength: true,
      studentStats: {
        correct: 0,
        incorrect: 0,
        skipped: 0,
        avgPerQuestion: 0,
        totalTime: 0,
        avgTimePerQuestion: 0
      },
      classAverageStats: {
        correct: 0,
        incorrect: 0,
        skipped: 0,
        avgPerQuestion: 0,
        totalTime: 0,
        avgTimePerQuestion: 0
      },
      bestPerformanceAverageStats: {
        fullname: null,
        correct: 0,
        incorrect: 0,
        skipped: 0,
        avgPerQuestion: 0,
        totalTime: 0,
        avgTimePerQuestion: 0,
        score: 0
      },
      currentUrl: "",
      currentShareUrl: "",
      delayTimeout: {},
      result_remaning_time: 0,
      questionsCurrentPage: [],
      pageNo: 1,
      pageCount: 0,
      scrollToQuestionNo: false,
      buyCoursePop: false,
      user: customStorageService.getUser(),
      loadingRevision: false,
      attemptDropDown: false,
      nationCityDD: false,
      output: null,
      selectedLocations: [],
      colorVarient: {
        fill: "#ef4b24"
      },
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      center: [30.3753, 69.3451],
      zoom: 5,
      markers: [],
      markerObjects: null,
      selectedRegion: "Pakistan",
      cordinatesHelper: {
        World: {
          center: [30.3753, 69.3451],
          zoom: 1
        },
        Pakistan: {
          center: [30.3753, 69.3451],
          zoom: 5
        },
        Punjab: {
          center: [31.1704, 72.7097],
          zoom: 7
        },
        KPK: {
          center: [34.9526, 72.3311],
          zoom: 7
        },
        Gilgit: {
          center: [35.8819, 74.4643],
          zoom: 7
        },
        Blochistan: {
          center: [28.4907, 65.0958],
          zoom: 6
        },
        Sindh: {
          center: [25.8943, 68.5247],
          zoom: 7
        }
      },
      crumbs: [],
      cityWiseStats: [],
      firstAttempt: true,
      firstAttemptTopStudents: [],
      latestAttemptTopStudents: [],
      resultForCertificate: {},
      certificateEligible: false,
      certificateNumber: null,
      tagGraphHeight: 200,
      position: 0,
      timeoutclap: null,
      quizResultShareTitle: "",
      quizResultShareUrl: "",
      currentShareTitleCertificate: "",
      currentShareUrlCertificate: "",
      isCityApiCalled: false,
      isCityLoading: true,
      isPerformanceTrendApiCalled: false,
      isPerformanceTrendLoading: false,
      showTopicGraph: false,
      isTagDataApiCalled: false,
      isTagDataGraphLoading: true,
      windowTop: 0,
      sidebarQuestions: [],
      topicsStats: [],
      courseStats: [70],
      courseStatschartWeakness: {
        chart: {
          // height: 140,
          type: "radialBar"
        },
        colors: [""],
        plotOptions: {
          radialBar: {
            hollow: {
              size: "60%"
            },
            track: {
              show: true,
              background: "#E3E8F1",
              strokeWidth: "100%",
              margin: 0 // margin is in pixels
            },
            dataLabels: {
              showOn: "always",
              name: {
                offsetY: 0,
                show: false,
                color: "#333",
                fontSize: "12px",
                fontWeight: 400
              },
              value: {
                color: "#000",
                fontSize: "14px",
                fontWeight: 700,
                show: true,
                offsetY: 4
              }
            }
          }
        },
        fill: {
          type: "solid",
          colors: [function({ value, seriesIndex, w }) {
            if(value < 1) {
                return 'transparent'
            }else {
                return '#ff4e22'
            }
          }]
        },
        stroke: {
          lineCap: "round"
        }
      },
      courseStatschart: {
        chart: {
          // height: 140,
          type: "radialBar"
        },
        colors: [""],
        plotOptions: {
          radialBar: {
            hollow: {
              size: "60%"
            },
            track: {
              show: true,
              background: "#E3E8F1",
              strokeWidth: "100%",
              margin: 0 // margin is in pixels
            },
            dataLabels: {
              showOn: "always",
              name: {
                offsetY: 0,
                show: false,
                color: "#333",
                fontSize: "12px",
                fontWeight: 400
              },
              value: {
                color: "#000",
                fontSize: "14px",
                fontWeight: 700,
                show: true,
                offsetY: 4
              }
            }
          }
        },
        fill: {
          type: "solid",
          colors: ["#0BD684"]
        },
        stroke: {
          lineCap: "round"
        }
      },
      mdcatScoreDiff: 0,
      tip1: "",
      tip2: "",
      tip3: "",
      scoreTips: {
        "0-20": [
          "Congratulations on starting a beautiful journey! Consistency is key to improvement, so keep working hard.",
          "Watch more video lectures and make notes to understand the concepts better",
          "Take more quizzes to assess your learning and identify your weak areas",
          `Attend teacher's live sessions and participate actively to clear your doubts`,
          `Make a study schedule and stick to it to improve your focus and motivation`,
          `Set small, achievable goals and track your progress regularly`
        ],
        "21-40": [
          `Great start with studies! Patience, consistency, and right methods will boost your performance.`,
          `Keep watching video lectures and take notes to reinforce your learning`,
          `Solve quizzes regularly and pay attention to the questions you get wrong`,
          `Attend live sessions and participate in discussions to clarify your doubts`,
          `Make a study group with classmates and revise together`,
          `Ask questions from Superbot or in the community to get a different perspective`
        ],
        "41-60": [
          `Congratulations on reaching a great milestone! Keep going and shine as a rising star.`,
          `Your learning efforts are commendable, and extra effort will bring improvement.`,
          `Revisit the video lectures and revise your notes to consolidate your understanding`,
          `Take practice quizzes and analyze the questions you got wrong`,
          `Attend live sessions and ask more questions to clear your doubts`,
          `Make flashcards or mind maps to help you memorize key concepts`,
          `Identify your weaker areas and allocate more time to studying those topics`
        ],
        "61-80": [
          `Good work! You have made solid progress and are well on your way to mastering the material.`,
          `Your hard work and dedication are paying off, and you have shown improvement in your results. Keep it up!`,
          `You have a strong foundation and with a bit more focus and practice, you'll reach your full potential.`,
          `Continue revising video lectures and practicing quizzes`,
          `Participate actively in live sessions and ask questions to deepen your understanding`,
          `Make a habit of reviewing your study notes regularly`,
          `Get a study buddy or form a study group to revise and motivate each other`,
          `Focus on applying your learning to real-world scenarios to test your understanding`
        ],
        "81-100": [
          `Excellent job! Your hard work and dedication have paid off. Keep up the good work!`,
          `You have a solid understanding of the material and are doing a fantastic job. Keep striving for excellence!`,
          `Keep revisiting the video lectures and practicing quizzes to maintain your understanding`,
          `Attend live sessions to stay updated and expand your knowledge`,
          `Share your knowledge and help others by answering their questions in the community`,
          `Take up more challenging topics to push your limits and continue learning`,
          `Maintain a healthy study routine and schedule breaks to avoid burnout.`
        ]
      }
    };
  },

  watch: {
    pageNo: function() {
      this.navigatePageNo();
    }
  },
  components: {
    "app-bars": Bar,
    "app-horizontal-bars": HorizontalBar,
    "app-header": appHeader,
    "app-sidebar": appsidebar,
    "app-single-question-stat": SingleQuestionStat,
    "base-pagination": pagination,
    MapChart: MapChart,
    VueHtml2Canvas,
    VueSpeedometer,
    apexchart: VueApexCharts,

    "l-map": LMap,
    "l-tile-layer": LTileLayer,
    "l-marker": LMarker,
    "l-tooltip": LTooltip,
    "l-popup": LPopup,
    "bread-crumbs": breadCrumns
  },
  created() {
    window.addEventListener("scroll", this.handleScroll);
    this.resultId = this.$route.params.id;
    this.getResult();
    // this.currentShareUrl =
    //   process.env.VUE_APP_LMS_HOME + window.location.pathname;
    this.currentUrl = process.env.VUE_APP_LMS_HOME + window.location.pathname;
  },
  mounted() {
    eventBus.$emit("show-phone-popup");
    this.scrollToTop();
    this.print();
    L.Icon.Default.imagePath = "https://unpkg.com/leaflet@1.3.4/dist/images/";
    this.center = this.cordinatesHelper[this.selectedRegion].center;
    this.zoom = this.cordinatesHelper[this.selectedRegion].zoom;
    // this.$nextTick(() => {
    //   this.markerObjects = this.$refs.markersRef.map((ref) => ref.mapObject);
    // });
    this.selectRegion("Pakistan");
    window.addEventListener("scroll", this.onScroll);
    document.body.classList.add("remove-floating-btn", "verify-banner");
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.onScroll);
    // practiceSocket.emit("disconnect-user", {
    //   session_id: this.result.session_id,
    //   quiz_id: this.result.quiz_id,
    //   user_id: this.result.user_id
    // });
  },
  destroyed() {
    console.log("exitQuizResults");
    document.body.classList.remove("remove-floating-btn", "verify-banner");
  },
  methods: {
    updateScore(res, score) {
      this.$store.commit("setMdcatScore", {
        score: score,
        user: res.score.user,
        position: res.position,
        usersPositions: res.usersPositions
      });
    },
    updateScoreAnimation(res, newScore, oldScore) {
      setTimeout(() => {
        if (newScore > oldScore) {
          oldScore = oldScore + 1;
          this.updateScore(res, oldScore);
          this.updateScoreAnimation(res, newScore, oldScore);
        } else if (newScore < oldScore) {
          oldScore = oldScore - 1;
          this.updateScore(res, oldScore);
          this.updateScoreAnimation(res, newScore, oldScore);
        }
      }, 200);
    },
    async getScore() {
      const res = await appService.getUserScore();
      this.mdcatScoreDiff =
        Number(res.score.score_200.toFixed(0)) -
        Number(this.$store.state.mdcatScore);
      const oldScore = Number(this.$store.state.mdcatScore);
      this.updateScoreAnimation(
        res,
        Number(res.score.score_200.toFixed(0)),
        oldScore
      );
      if (this.mdcatScoreDiff > 0) {
        this.mdcatScoreDiff = "+" + this.mdcatScoreDiff;
      }
    },
    async getScoreLink() {
      const res = await appService.getUserScoreLink();
      this.$store.commit("setMdcatScoreLink", {
        link: res.shareableLink
      });
    },

    // map province dropdown
    onScroll(e) {
      this.windowTop = window.top.scrollY;
    },
    practiceAgain() {
      this.$router.push("/practices");
    },
    selectRegion(region) {
      this.selectedRegion = region;
      this.center = this.cordinatesHelper[region].center;
      this.zoom = this.cordinatesHelper[region].zoom;
    },

    mapChangeColor(districId, colorOpacity) {
      var mapId = document.getElementById(districId);
      mapId.classList.add("opacity-" + colorOpacity);
    },
    setTopicWeakness() {
      this.showTopicWeakness = !this.showTopicWeakness;
    },
    setTopicStrength() {
      this.showTopicStrength = !this.showTopicStrength;
    },
    closeBox() {
      this.listBox = false;
      this.listBoxR = false;
    },
    scrollToQuestion(id) {
      this.quizSummary = false;
      const offset = this.pageNo * 10 - 10;
      if (id < offset + 10)
        return document
          .getElementById(id)
          .scrollIntoView({ behavior: "smooth" });

      this.scrollToQuestionNo = id;
      this.pageNo = Math.ceil(id / 10);
    },
    isHTML(str) {
      var a = document.createElement("div");
      a.innerHTML = str;
      for (var c = a.childNodes, i = c.length; i--; ) {
        if (c[i].nodeType == 1) return true;
      }
      return false;
    },
    span(text) {
      return `<span> ${text} </span>`;
    },
    navigatePageNo() {
      if (!this.result?.questions) return;
      this.questionsCurrentPage = [];
      const questionsAll = this.isFilter
        ? [...this.filteredQuestion]
        : [...this.result.questions];
      if (questionsAll.length < 10)
        return (this.questionsCurrentPage = questionsAll
          .splice(0, questionsAll.length)
          .map((q, i) => ({ ...q, questionNo: i + 1 })));
      const offset = this.pageNo * 10 - 10;

      if (questionsAll.length > offset + 10) {
        this.questionsCurrentPage = questionsAll
          .splice(offset, 10)
          .map((q, i) => ({ ...q, questionNo: offset + i + 1 }));
      } else {
        this.questionsCurrentPage = questionsAll
          .splice(offset, questionsAll.length - offset)
          .map((q, i) => ({ ...q, questionNo: offset + i + 1 }));
      }
      this.currentPage;
      if (this.scrollToQuestionNo) {
        this.$forceUpdate();
        this.scrollToQuestionNo = false;
      } else window.scrollTo(0, 0);
      return;
    },
    scrollToTop() {
      try {
        document
          .getElementById("loadingScreen")
          .scrollIntoView({ behavior: "smooth" });
      } catch (err) {
        console.log("scrolling error top");
      }
    },
    reviewAll() {
      this.isAllQuestions = true;
      setTimeout(() => {
        this.clearAll();
        this.$forceUpdate();
      }, 300);
    },
    async clearAll() {
      this.easy = false;
      this.medium = false;
      this.difficult = false;
      this.correctQuestions = false;
      this.wrongQuestions = false;
      this.skippedQuestions = false;
      this.allQuestions = true;
      this.difficultyAll = true;
      this.filters.type = 0;
      this.filters.difficulty = 0;
      this.isFilter = false;
      this.filteredQuestion = [];
      this.pageNo = 1;
      this.pageCount = Math.ceil(this.result.questions.length / 10);
      this.navigatePageNo();
    },
    listboxHandler() {
      this.listBox = !this.listBox;
      this.listBoxR = false;
    },
    sortboxHandler() {
      this.listBoxR = !this.listBoxR;
      this.listBox = false;
    },
    async setFilter(filter) {
      this.allQuestions = false;
      if (filter == 1) {
        this.correctQuestions = true;
        this.wrongQuestions = false;
        this.skippedQuestions = false;
      } else if (filter == 2) {
        this.wrongQuestions = true;
        this.correctQuestions = false;
        this.skippedQuestions = false;
      } else if (filter == 3) {
        this.skippedQuestions = true;
        this.wrongQuestions = false;
        this.correctQuestions = false;
      } else {
        this.allQuestions = true;
        this.correctQuestions = false;
        this.wrongQuestions = false;
        this.skippedQuestions = false;
      }

      if (filter && filter <= 3) {
        this.filters.type = filter;
        this.isFilter = true;
      } else {
        this.filters.type = 0;
        this.isFilter = false;
      }
      this.filterQuestions();
    },
    async sortDifficulty(filter) {
      this.difficultyAll = false;
      if (filter == 1) {
        this.easy = true;
        this.medium = false;
        this.difficult = false;
      } else if (filter == 2) {
        this.medium = true;
        this.easy = false;
        this.difficult = false;
      } else if (filter == 3) {
        this.difficult = true;
        this.easy = false;
        this.medium = false;
      } else {
        this.difficultyAll = true;
        this.easy = false;
        this.medium = false;
        this.difficult = false;
      }

      if (filter && filter <= 3) {
        this.filters.difficulty = filter;
        this.isFilter = true;
      } else {
        this.filters.type = 0;
        this.isFilter = false;
      }
      this.filterQuestions();
    },
    goBack(value) {
      if (this.$store.state.isNewReactNative) {
        console.log("close-webview");
      }
      if (window.history.length > 3) {
        if (
          this.result.quiz.course_id &&
          this.result.quiz.course &&
          this.result.quiz.course.id &&
          this.result.quiz.course.index_url
        ) {
          this.$router.push(
            "/course/course-detail/" +
              this.result.quiz.course.index_url +
              "/" +
              this.result.quiz.course.id
          );
        } else {
          this.$router.push("/course/course-landing");
        }
      } else {
        this.$router.push("/course/course-landing");
      }
    },
    selectQuestion(question, index) {
      this.question = {};
      this.questionNo = -1;
      this.$forceUpdate();
      setTimeout(() => {
        this.question = question;
        this.questionNo = index + 1;
        this.$forceUpdate();
      }, 100);
    },
    scrollDown() {
      document
        .getElementById("incorrect")
        .scrollIntoView({ behavior: "smooth" });
    },
    connectSocket() {
      // practiceSocket = practiceSocketInit(
      //   {
      //     session_id: this.result.session_id,
      //     quiz_id: this.result.quiz_id,
      //     user_id: this.result.user_id
      //   },
      //   result => {},
      //   result => {
      //     // toastr.info("One of your Friend submit Quiz.");
      //     this.getQuizTopStudents();
      //   },
      //   error => {
      //     console.log("error called");
      //   }
      // );
    },
    async getResult() {
      try {
        this.pageLoader = true;
        this.wireFramesS = true;
        let [result, classResult] = await Promise.all([
          QuizService.getResult(this.resultId),
          QuizService.getClassResult(this.resultId)
        ]);

        let sidebarResult = JSON.parse(JSON.stringify(result.data.data.result));
        if (sidebarResult.questions) {
          this.sidebarQuestions = sidebarResult.questions;
        }
        this.result = result.data.data.result;
        this.getRandomTipsFromArray();
        mixpanel.track('VL-Quiz-Result-Page',{
          'Course_Id' : this.result.quiz.course_id,
          'Instructor_Id' : this.result.quiz.instructor_id,
          'Module_Name' : this.result.quiz.module.name,
          'Niche_Name' : this.result.quiz.course_tag,
          'Quiz_Type' : this.result.quiz.quiz_type,
          "Quiz_Name" : this.result.quiz.name,
          "Quiz_ID" : this.result.quiz.pg_quiz_id,
          
        });
        if (this.crumbs.length === 0) {
          this.crumbs.push({
            name: "Nearpeer.org",
            url: "/course/course-landing",
            imageurl: "---"
          });
          if (this.result.quiz.course.name) {
            this.crumbs.push({
              name: this.result.quiz.course.name,
              url:
                "/course/course-detail" +
                "/" +
                this.result.quiz.course.index_url +
                "/" +
                this.result.quiz.course.id
            });
          }
          this.crumbs.push({
            name: this.result.quiz.name,
            url: "/quiz/standard-quiz-main/" + this.result.session_id
          });
          this.crumbs.push({
            name: "Quiz Results",
            url: "/quiz/standard-quiz-results/" + this.result._id
          });
        }
        this.currentShareUrl =
          process.env.VUE_APP_LMS_HOME +
          "/quiz/standard-quiz-main/" +
          result.data.data.result.session_id;

        this.currentShareUrlCertificate =
          process.env.VUE_APP_QUIZ_SERVICE_URL +
          "result/get-certificate-preview/" +
          result.data.data.result.certificate_number +
          "?preview=true";
        this.currentShareTitleCertificate = `Hi, I've scored ${result.data.data.result.correct_percentage}% at Nearpeer's Quiz. Check out my certificate here:`;
        this.quizResultShareTitle = `Hey,
I have scored ${this.result.correct_percentage}% in my quiz at Nearpeer. Would you like to give it a try too?`;
        this.quizResultShareUrl = `/quiz/standard-quiz-results/${this.result._id}`;
        this.position = result.data.data.position;
        this.certificateEligible = result.data.data.elligibleForCertificate;
        if (result.data.data.result.attempt_number != 1)
          this.firstAttempt = false;

        if (this.result.quiz.quiz_type === "practice") this.connectSocket();

        this.niche = this.result.quiz.course.faculty;
        this.currentCourseName = this.result.quiz.course.name;
        this.pageCount = Math.ceil(this.result.questions.length / 10);
        this.navigatePageNo();
        this.result.skipped_questions = [];
        const questionStats = result.data.data.questionStats;
        this.totalAttempts = result.data.data.attemptCount;
        this.getSuggestedVideos();
        this.result.questions.forEach(question => {
          questionStats.questionCorrectCount.forEach(correctQuestion => {
            if (correctQuestion._id == question.question_id._id) {
              question.correctCount = correctQuestion.correct_count;
              question.averageTime = correctQuestion.averageTime;
              question.bestTime = correctQuestion.bestTime;
            }
          });
          questionStats.questionMarkedCount.forEach(markedQuestion => {
            if (markedQuestion._id == question.question_id._id) {
              question.markedCount = markedQuestion.markedCount;
            }
          });
          questionStats.questionSkippedCount.forEach(skipQuestion => {
            if (skipQuestion._id == question.question_id._id) {
              question.skippedCount = skipQuestion.skippedCount;
            }
          });
        });

        // let classResult = await QuizService.getClassResult(this.resultId);
        this.pageLoader = false;
        setTimeout(() => {
          this.getScore();
          this.getScoreLink();
        }, 1000);

        classResult = classResult.data.data;
        this.classQuizAverage = classResult.classQuizAverage
          ? classResult.classQuizAverage.averagePercent
          : 0;

        this.classAverageStats = {
          correct:
            (classResult.questionStats.questionCorrectCount[0]?.correctCount ||
              0) / classResult.attemptCount,
          incorrect:
            (classResult.questionStats.questionIncorrectCount[0]
              ?.incorrectCount || 0) / classResult.attemptCount,
          skipped:
            (classResult.questionStats.questionSkippedCount[0]?.skippedCount ||
              0) / classResult.attemptCount,
          totalTime: this.formatTime(
            classResult.questionStats.averageTimePerQuiz[0]?.averageTime || 0
          ),
          avgTimePerQuestion: classResult.questionStats
            .averageTimePerQuestion[0]?.averageTime
            ? this.formatTime(
                classResult.questionStats.averageTimePerQuestion[0]?.averageTime
              )
            : 0
        };

        this.moduleIndex = this.result.quiz.course.index_url;
        this.courseId = this.result.quiz.course_id;
        this.moduleName = this.result.quiz.module.name;
        this.resultDelay = this.result.quiz.result_delay_in_hours;
        let resultRavelTime = moment(this.result.created_at).add(
          this.resultDelay,
          "hours"
        );
        let current = moment();
        const isAfter = current.isAfter(resultRavelTime);
        if (this.resultDelay == 0 || isAfter) {
          if (this.result.correct_percentage == 100) {
            setTimeout(() => {
              this.showAnimation = false;
            }, 3800);
            this.green = true;
            this.wireFramesS = false;
            this.pageType = 2;
          } else {
            if (this.result.correct_percentage > 70) {
              this.green = true;
            } else if (
              this.result.correct_percentage >= 50 &&
              this.result.correct_percentage < 70
            ) {
              this.yellow = true;
            } else {
              this.red = true;
            }
            this.wireFramesS = false;
            this.pageType = 3;
          }
        } else {
          this.pageType = 1;
          this.timer();
        }

        this.calculateStats("current_student");
        this.grade = QuizService.getGrade(this.result.correct_percentage);
        this.isPass =
          this.result.correct_percentage >= this.result.quiz.passing_percentage;
        // this.question = this.result.questions[0];
        this.questionsStats = this.result.questions;
        //         this.customDescriptionWA = `I have scored ${
        //           this.position == 1
        //             ? "1st"
        //             : this.position == 2
        //             ? "2nd"
        //             : this.position == 3
        //             ? "3rd"
        //             : this.position + "th"
        //         } Position in my recent quiz at Nearpeer.org. Do you want to compete and beat my scores? Here is the quiz link for you`;
        //         this.customDescription = `I have scored ${
        //           this.position == 1
        //             ? "1st"
        //             : this.position == 2
        //             ? "2nd"
        //             : this.position == 3
        //             ? "3rd"
        //             : this.position + "th"
        //         } Position in my recent quiz at Nearpeer.org. Do you want to compete and beat my scores? Here is the quiz link for you

        // ${this.currentShareUrl}

        // Best of luck!`;
        this.customDescriptionWA = `I have scored ${this.result.correct_percentage}%  in my recent quiz at Nearpeer.org. Do you want to compete and beat my scores? Here is the quiz link for you`;
        this.customDescription = `I have scored ${this.result.correct_percentage}% in my recent quiz at Nearpeer.org. Do you want to compete and beat my scores? Here is the quiz link for you

        ${this.currentShareUrl}

        Best of luck!`;
        // if (this.niche === "MDCAT") {
        //   if (this.currentCourseName === "MDCAT PHYSICS") {
        //     this.customDescription =
        //       "Such as gravity pulls everything towards itself, Sir Mansoor Farooqi will teach you the tips and tricks that will help you score maximum marks for yourself and hence, enable you to be the next topper.The visual representations and simulations used in the course will enhance your learning, creativity, and innovation. Eventually, enabling you to think outside of the box.The smart tricks will give you the advantage to tackle the most difficult portion of physics, the numerical, without the use of calculators.";
        //   } else if (this.currentCourseName === "MDCAT BIOLOGY") {
        //     this.customDescription =
        //       " You cannot understand life, without understanding Biology. Learn how life started with a single cell organism in a conceptually effortless way from Sir Shahid Subhani.Sir Shahid, being an expert in the field with 14 years of experiences will teach you the important tips and tricks to help you tackle challenging MCQs of MDCAT, efficiently andtimely.";
        //   } else if (this.currentCourseName === "MDCAT CHEMISTRY") {
        //     this.customDescription =
        //       "Learn complex chemical reactions in a simple conceptual way from Sir Habib Rafique having 23 years of experience and get in the league of MDCAT toppers.Sir Habib Rafiquq will aid you in grasping challenging concepts of organic and inorganic and strengthen your understanding through examples from real life.Most importantly, your habit of cramming would be colored with concepts and sublime pneumonic that will provide you with an effective way to solve MCQs.";
        //   } else if (this.currentCourseName === "MDCAT ENGLISH") {
        //     this.customDescription =
        //       "From subject-verb agreement to parallelism to learning-rich vocabulary, it is now made easy and will ensure you 190+ marks and eventually help you ace MDCAT.Tanveer Ahmed, your English instructor, with 8 years of teaching experience will make learning vocabulary and English grammar trouble-free while building upon your skills through practicing quizzes and past papers. So, to ensure that you not only ace your MDCAT but also develop strong English language skills.";
        //   } else if (this.currentCourseName === "MDCAT ENGLISH") {
        //     this.customDescription =
        //       "Ace your NUMS and FMDC medical entry test with the best faculty and ensure your seat in the top army medical college. ";
        //   } else {
        //     this.customDescription = this.result.quiz.course.description;
        //   }
        // } else if (this.niche === "Fsc") {
        //   this.customDescription =
        //     "Wow! Amazing Lecture Series.Prepare your FSc online with the best faculty in town and be the next topper of the board exams. ";
        // } else if (this.niche === "CSS Online Preparation") {
        //   this.customDescription =
        //     "Best curated lecture series! Literally in awe.Nearpeer is the best platform to crack the CSS exam. If you want to qualify for these exams with the highest marks, choose this institute. Nearpeer is the right choice for those who are new to the CSS world and wish to become a CSP Officer. ";
        // } else if (this.niche === "OA LEVELS") {
        //   this.customDescription =
        //     "Perfectly curated lecture series! Literally in awe. Study from industry leaders and get guaranteed A* in your CAIEs. ";
        // } else if (this.niche === "LUMS") {
        //   this.customDescription =
        //     " Book your seat in the Top Universities of Pakistan by taking SAT from the experienced instructors";
        // } else if (this.niche === "CA Final") {
        //   this.customDescription =
        //     "Meticulously designed lectures!Be it AFC or CFAP, effortlessly learn easy to challenging concepts and pave your way to Chartered Accountancy.";
        // } else {
        //   this.customDescription = this.result.quiz.course.description;
        // }
        if (this.pageType != 1) {
          this.getQuizTopStudents();
          this.calculateStats("class_average");
        }
      } catch (error) {
        // this.pageLoader = false;
        toastr.error(error.message);
        console.log(error.message);
        this.$router.push("/page-not-found");
      }
    },
    modulePage() {
      this.$router.push(
        "/course/course-detail/" + this.moduleIndex + "/" + this.courseId
      );
    },
    getRandomTipsFromArray() {
      // Make sure the array has at least two elements
      let arr = [];
      const perc = this.result.correct_percentage;
      switch (true) {
        case perc >= 0 && perc <= 20:
          arr = this.scoreTips["0-20"];
          break;
        case perc >= 21 && perc <= 40:
          arr = this.scoreTips["21-40"];
          break;
        case perc >= 41 && perc <= 60:
          arr = this.scoreTips["41-60"];
          break;
        case perc >= 61 && perc <= 80:
          arr = this.scoreTips["61-80"];
          break;
        case perc >= 81:
          arr = this.scoreTips["81-100"];
          break;
        default:
          arr = this.scoreTips["61-80"];
      }
      if (arr.length < 2) {
        throw new Error("Array must have at least 2 elements");
      }

      // Generate two random indices
      const index1 = Math.floor(Math.random() * arr.length);
      let index2 = Math.floor(Math.random() * arr.length);
      let index3 = Math.floor(Math.random() * arr.length);

      // Make sure index2 is not the same as index1
      while (index2 === index1) {
        index2 = Math.floor(Math.random() * arr.length);
      }

      while (index3 === index1 || index3 === index2) {
        index3 = Math.floor(Math.random() * arr.length);
      }

      // Return the two randomly selected strings
      this.tip1 = arr[index1];
      this.tip2 = arr[index2];
      this.tip3 = arr[index3];
    },
    async getCityWiseStats() {
      try {
        this.isCityLoading = true;
        const resp = await quizService.getQuizCityWiseStats(
          this.result.quiz_id
        );
        this.isCityLoading = false;
        if (resp.data.status === "success") {
          this.cityWiseStats = resp.data.data.cityWiseStats;
        }
        if (resp.data.data.cordinatesList) {
          const formatedCordinates = resp.data.data.cordinatesList.map(
            (item, index) => {
              return {
                Id: index + 1,
                name: `${item.count}% person have attemped quiz from here`,
                position: { lat: item._id[0], lng: item._id[1] }
              };
            }
          );
          this.markers = formatedCordinates;
          console.log(this.markers);
          this.$nextTick(() => {
            this.markerObjects = this.$refs.markersRef.map(
              ref => ref.mapObject
            );
          });
        }
      } catch (err) {
        this.isCityLoading = false;
        console.log(err);
      }
    },
    async getSuggestedVideos() {
      this.question = this.result.questions[0];
      if(this.result.quiz.quiz_type !== "practice") {
        const modules = await courseService.getAllModulesData(
          "",
          customStorageService.getUser().id,
          this.result.quiz.module_id,
          "",
          this.result.quiz.course_id
        );

        this.result.questions.forEach(question => {
          if (!question.result) {
            if (question.question_id && question.question_id.related_video) {
              console.log("found video");
              console.log(question.question_id.related_video);
              this.suggestedVideos.push(question.question_id.related_video);
              this.suggestedVideos[
                this.suggestedVideos.length - 1
              ].duration = question.question_id.related_video.duration = this.formatTime(
                question.question_id.related_video.duration
              );
              const mod = modules.data.course.courseData.modules.find(mod => {
                return mod.id == question.question_id.related_video.module_id;
              });
              if (mod) {
                question.question_id.related_video.module_index_url =
                  mod.index_url;
                question.question_id.related_video.course_index_url =
                  modules.data.course.courseData.index_url;
              }
            }
          }
        });
        const suggestedVideos = [...this.suggestedVideos].filter(v => v.id);
        this.suggestedVideos = [];
        suggestedVideos.forEach((video, index) => {
          const mod = modules.data.course.courseData.modules.find(
            mod => mod.id == video.module_id
          );
          video.module_index_url = mod.index_url;
          video.course_index_url = modules.data.course.courseData.index_url;

          // if (!modules.data.course?.coursePurchased?.purchased) {
          //   if (mod && !mod.module_type.free && !mod.module_type.purchased) {
          //     suggestedVideos[index].isLocked = true;
          //   }
          // }
        });
        this.suggestedVideos = suggestedVideos;
      }
    },
    async getQuizTopStudents() {
      try {
        this.wireFramesT = true;
        let [responseFirst, responseLatest] = await Promise.all([
          QuizService.getQuizTopStudents(
            this.result.quiz_id,
            this.result._id,
            true
          ),
          QuizService.getQuizTopStudents(
            this.result.quiz_id,
            this.result._id,
            false
          )
        ]);
        if (responseFirst && responseLatest) {
          this.wireFramesT = false;
          this.firstAttemptTopStudents = responseFirst.data.data.quiz;
          this.latestAttemptTopStudents = responseLatest.data.data.quiz;
          this.topStudents = this.firstAttempt
            ? this.firstAttemptTopStudents
            : this.latestAttemptTopStudents;
          this.calculateStats("best_performer");
          this.topStudents.forEach((student, index) => {
            if (student._id === this.resultId) {
              this.quizPosition = student.rank ? student.rank : index + 1;
            }
            student.time_spent = this.formatTime(student.time_spent);
          });
          if (!this.quizPosition) {
            this.quizPosition = this.$store.state.mdcatPosition;
          }
          if (this.quizPosition == 1) {
            this.quizPosition = "1st";
          } else if (this.quizPosition == 2) {
            this.quizPosition = "2nd";
          } else if (this.quizPosition == 3) {
            this.quizPosition = "3rd";
          } else {
            this.quizPosition = this.quizPosition + "th";
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    // async calculateCertificationEligibility(){
    //   try{
    //     const user_id = this.result.user_id
    //     const firstAttempTopThree = [...this.latestAttemptTopStudents].slice(0,3)
    //     const currentUserFirstAttempExist = firstAttempTopThree.find(
    //       item => item.user_id === user_id
    //     );
    //     if (
    //       currentUserFirstAttempExist &&
    //       currentUserFirstAttempExist.certificate
    //     ) {
    //       this.resultForCertificate = currentUserFirstAttempExist;
    //       this.certificateEligible = true;
    //       this.certificateNumber = currentUserFirstAttempExist.certificate;
    //     }
    //     if (currentUserFirstAttempExist && currentUserFirstAttempExist.result) {
    //       this.resultForCertificate = currentUserFirstAttempExist;
    //       this.certificateEligible =  true;
    //     } else {
    //       this.certificateEligible = true;
    //     }
    //     console.log(this.certificateEligible, 'eeeligible')
    //   } catch (err) {
    //     console.log(err);
    //   }
    // },
    async getStudentPerformanceTrend() {
      try {
        this.isPerformanceTrendLoading = true;
        this.wireFrames = true;
        let response = await QuizService.getStudentPerformanceTrend(
          this.result.user_id,
          this.resultId
        );
        this.isPerformanceTrendLoading = false;
        if (response) {
          this.wireFrames = false;
          const stats = response.data.statsData;
          // this.classQuizAverage = stats.classAveragePercentage;
          const classTrendGraphData = [];
          const studentTrendGraphData = [];
          const performanceTrendGraphData = [];
          const trendGraphLabels = [];
          stats.classAverageScore.forEach((classAverage, index) => {
            const isFound = stats.yourAverageScore.find(
              yourAverage =>
                yourAverage.name.trim() === classAverage.name.trim() &&
                yourAverage._id === classAverage._id
            );
            classTrendGraphData.push(classAverage.average);
            if (isFound) {
              studentTrendGraphData.push(isFound.average);
            } else {
              studentTrendGraphData.push(0);
            }
            trendGraphLabels.push(classAverage.name);
          });
          this.trendGraphLabels = trendGraphLabels;

          performanceTrendGraphData.push({
            label: "Class Average",
            // backgroundColor: "#7BC0F7",
            backgroundColor: "#4b72c7",
            data: classTrendGraphData,
            barThickness: 10
          });
          performanceTrendGraphData.push({
            label: "Your Average",
            // backgroundColor: "#5169D5",
            backgroundColor: "#28a745",
            data: studentTrendGraphData,
            barThickness: 10
          });

          this.performanceTrendGraphData = performanceTrendGraphData;
          const screenWidth = window.innerWidth;
          this.widthGraph =
            screenWidth < 400
              ? performanceTrendGraphData[0].data.length <= 5
                ? "100%"
                : (performanceTrendGraphData[0].data.length / 5) * 100 + "%"
              : performanceTrendGraphData[0].data.length <= 20
              ? "100%"
              : (performanceTrendGraphData[0].data.length / 20) * 100 + "%";
        }
      } catch (error) {
        this.isPerformanceTrendLoading = false;
        console.log(error);
      }
    },
    async getQuizGraphData() {
      this.calculateStats("class_average");
    },
    calculateStats(type) {
      //Current Studate Average
      if (type === "current_student") {
        this.studentStats.skipped = this.result.skipped_count;
        this.studentStats.totalTime = this.formatTime(this.result.time_spent);
        this.studentStats.avgTimePerQuestion = this.result.questions.length
          ? this.formatTime(
              this.result.time_spent / this.result.questions.length
            )
          : "0s";
        this.studentStats.avgTimePerQuestion = this.studentStats
          .avgTimePerQuestion
          ? this.studentStats.avgTimePerQuestion
          : "0s";
        this.studentStats.correct = this.result.correct_count;
        this.studentStats.incorrect = this.result.incorrect_count;
      } else if (type === "best_performer") {
        //Best Performance Average
        this.bestPerformanceAverageStats.skipped = this.topStudents[0].skipped_count;
        this.bestPerformanceAverageStats.totalTime = this.formatTime(
          this.topStudents[0].time_spent
        );
        this.bestPerformanceAverageStats.avgTimePerQuestion = this.formatTime(
          this.topStudents[0].time_spent / this.result.questions.length
        );
        this.bestPerformanceAverageStats.correct = this.topStudents[0].correct_count;
        this.bestPerformanceAverageStats.incorrect = this.topStudents[0].incorrect_count;
      }
    },
    async calculateTagsGraphData() {
      try {
        this.isTagDataGraphLoading = true;
        const res = await QuizService.getTopicWiseStrength(
          this.result.session_id,
          this.result._id
        );
        this.isTagDataGraphLoading = false;
        if (res.data && res.data.status === "success") {
          this.topicsStats = res.data.resultStats;
          let tagsGraphData = [];
          const youAverageGraphData = res.data.classAverageStats.map(
            a =>
              res.data.resultStats.find(b => a.name === b.name)
                ?.score_percentage || 0
          );
          tagsGraphData.push({
            label: "Class Average",
            backgroundColor: "#5169D5",
            data: res.data.classAverageStats.map(a => a.score_percentage),
            barThickness: 10
          });
          tagsGraphData.push({
            label: "Your Average",
            backgroundColor: "#28a745",
            data: youAverageGraphData,
            barThickness: 10
          });
          this.classTagsGraphLabels = res.data.classAverageStats.map(
            a => a.name
          );
          this.tagsGraphData = tagsGraphData;
          this.tagGraphHeight = tagsGraphData[0].data.length * 100;
        }
      } catch (err) {
        this.isTagDataGraphLoading = false;
        console.log(err);
      }
    },
    formatTime(sec) {
      try {
        let avgTime = "";
        sec = parseInt(sec);
        sec = sec.toFixed(0);
        sec = parseInt(sec);
        let time = new Date(sec * 1000).toISOString().substr(11, 8);
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
      } catch (error) {
        console.log(error);
        return "0m";
      }
    },
    reviewIndividualQuestions() {
      this.isAllQuestions = false;
    },
    filterQuestions() {
      let filtered_arr = [
        ...this.result.questions.map((q, i) => ({ ...q, q_no: i }))
      ];
      if (this.isFilter) {
        if (this.filters.type) {
          filtered_arr = filtered_arr.filter((question, i) => {
            if (this.filters.type === 1) return question.result;
            if (this.filters.type === 2) return !question.result;
            if (this.filters.type === 3) return question.skipped;
          });
        }
        if (this.filters.difficulty) {
          filtered_arr = filtered_arr.filter(question => {
            let level = question.tags.filter(tag => tag.tag_type === "level");
            level = level.length ? level[0].tag_name : null;
            if (!level) return false;
            if (this.filters.difficulty === 1) return level === "Easy";
            if (this.filters.difficulty === 2) return level === "Medium";
            if (this.filters.difficulty === 3) return level === "Difficult";
          });
        }
        this.filteredQuestion = [...filtered_arr];
        this.pageCount = Math.ceil(this.filteredQuestion.length / 10);
        if (this.pageNo === 1) this.navigatePageNo();
        else this.pageNo = 1;
      }
    },
    mathCreator: function(question, id, data) {
      setTimeout(function() {
        let mathFieldSpan = document.getElementById(id);
        let MQ = MathQuill.getInterface(2);
        let mathField = MQ.StaticMath(mathFieldSpan);
        if (!data.match(/\\\s/g)) {
          data = data.replace(/\s+/g, "\\ ");
        }
        if (data !== "" && data !== "null") {
          mathField.latex(data);
        }
      }, 500);
    },
    retakeQuiz() {
      if (this.$store.state.isNewReactNative) {
        console.log("retake-quiz");
        console.log("close-webview");
      }
      this.$router.push("/quiz/standard-quiz-main/" + this.result.session_id);
    },
    timer() {
      this.delayTimeout = setInterval(() => {
        this.resultDelay = this.result.quiz.result_delay_in_hours;
        let resultRavelTime = moment(this.result.created_at).add(
          this.resultDelay,
          "hours"
        );
        let current = moment();
        const isAfter = current.isAfter(resultRavelTime);
        if (isAfter) {
          clearInterval(this.delayTimeout);
          if (this.result.correct_percentage == 100) {
            setTimeout(() => {
              this.showAnimation = false;
            }, 3800);
            this.green = true;
            this.wireFramesS = false;
            this.pageType = 2;
          } else {
            if (this.result.correct_percentage > 70) {
              this.green = true;
            } else if (
              this.result.correct_percentage >= 50 &&
              this.result.correct_percentage < 70
            ) {
              this.yellow = true;
            } else {
              this.red = true;
            }
            this.wireFramesS = false;
            this.pageType = 3;
          }
        } else {
          let remaningTime = new Date(resultRavelTime.toString()) - new Date();
          this.result_remaning_time = this.formatTime(remaningTime / 1000);
          this.pageType = 1;
        }
      }, 1000);
    },
    watchVideo(video) {
      if (!video.isLocked) {
        window.location.href =
          window.location.origin +
          "/course/" +
          video.module_index_url +
          "/" +
          video.module_id +
          "/" +
          video.id +
          "?courseIndexUrl=" +
          video.course_index_url;
      }

      // this.buyCoursePop = true;
    },
    redirectPage() {
      this.buyCoursePop = false;
      window.location.href =
        process.env.VUE_APP_REDIRCT_URL +
        "/" +
        this.result.quiz.course.index_url +
        "?uid=" +
        this.user.id +
        "&token=" +
        this.user.token;
    },
    attempField(e) {
      e.preventDefault();
      e.stopPropagation();
      this.attemptDropDown = !this.attemptDropDown;
    },
    nationalCity() {
      this.nationCityDD = !this.nationCityDD;
    },
    async print() {
      try {
        const el = this.$refs.printMe;
        // add option type to get the image version
        // if not provided the promise will return
        // the canvas.
        const options = {
          type: "dataURL"
        };
        this.output = await this.$html2canvas(el, options);
      } catch (err) {
        console.log(err);
      }
    },
    displayTooltip(selectedIndex) {
      for (let markeOrbject of this.markerObjects) {
        markerObject.closeTooltip();
      }
      this.markerObjects[selectedIndex].toggleTooltip();
    },

    async userAttempts(filter) {
      if (filter == "first") {
        this.firstAttempt = true;
        this.topStudents = this.firstAttemptTopStudents;
      } else {
        this.firstAttempt = false;
        this.topStudents = this.latestAttemptTopStudents;
      }
    },
    closepopupsOutsideClick(e) {
      this.attemptDropDown = false;
    },
    async getCertificate(download) {
      try {
        if (this.result.certificate_url) {
          if (download) window.open(this.result.certificate_url);
          else
            window.open(
              "https://" +
                window.location.host +
                "/quiz/certificate/" +
                this.result.certificate_number,
              "_blank"
            );
          // this.$router.push(
          //   "/quiz/certificate/" + this.result.certificate_number
          // );
        } else {
          const certificateResponse = await quizService.getBuildCertificate(
            this.resultId
          );
          const certificate_url = certificateResponse.data.certificate_url;
          if (download) window.open(certificate_url);
          else
            window.open(
              "https://" +
                window.location.host +
                "/quiz/certificate/" +
                certificateResponse.data.certificate_number,
              "_blank"
            );
          // this.$router.push(
          //   "/quiz/certificate/" + certificateResponse.data.certificate_number
          // );
        }
      } catch (err) {
        console.log(err);
        if (err.response && err.response.data && err.response.data.message)
          toastr.error(err.response.data.message);
        else toastr.error("Certificate could not be generated");
      }
    },
    async clapClick(index) {
      try {
        clearTimeout(this.timeoutclap);
      } catch (err) {
        console.log("cldearing timeout err", err);
      }
      this[`clap${index}`] = true;
      const vthisRef = this;
      this.timeoutclap = setTimeout(
        () => (vthisRef[`clap${index}`] = false),
        1000
      );
      this.topStudents[index - 1].claps = this.topStudents[index - 1].claps
        ? this.topStudents[index - 1].claps
        : 0;
      this.topStudents[index - 1].claps += 1;
      const response = await quizService.clapOnResult(
        this.topStudents[index - 1]._id
      );
      // console.log('00000------------' , this.clap);
      // this.clap = true;
    },
    isScrolledIntoView(el) {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const elemTop = rect.top;
      const elemBottom = rect.bottom;

      // Only completely visible elements return true:
      // const isVisible = elemTop >= 0 && elemBottom <= window.innerHeight;

      // Partially visible elements return true:
      // return isVisible = elemTop < window.innerHeight && elemBottom >= 0;

      const isVisible = elemTop - 500 <= window.innerHeight;
      return isVisible;
    },
    handleScroll(e) {
      const cityMapDiv = document.getElementById("city_and_map_div");
      const isCityMapMounted = this.isScrolledIntoView(cityMapDiv);
      if (!this.isCityApiCalled && isCityMapMounted) {
        this.isCityApiCalled = true;
        if (this.pageType != 1) {
          this.getCityWiseStats();
          this.calculateTagsGraphData();
        }
      }

      const performanceTrendDiv = document.getElementById(
        "performance-trend-graph"
      );
      const isPerformanceTrendMounted = this.isScrolledIntoView(
        performanceTrendDiv
      );
      if (
        !this.isPerformanceTrendApiCalled &&
        isPerformanceTrendMounted &&
        this.pageType != 1
      ) {
        this.isPerformanceTrendApiCalled = true;
        // this.getStudentPerformanceTrend();
      }

      const tagDataGraphDiv = document.getElementById("tag-graph");
      const isTagDataGraphMounted = this.isScrolledIntoView(tagDataGraphDiv);
      if (
        !this.isTagDataApiCalled &&
        isTagDataGraphMounted &&
        this.pageType != 1
      ) {
        this.isTagDataApiCalled = true;
        // this.calculateTagsGraphData();
      }
    },
    selected(crumb) {
      console.log(crumb);
    }
  },
  beforeRouteLeave(to, from, next) {
    if (
      from.name === "app-standard-quiz-results" &&
      (to.name === "app-standard-quiz" ||
        to.name === "app-standard-quiz-result-position")
    ) {
      next("/quiz/standard-quiz-main/" + to.query.sessionId);
    } else {
      window.location.href = "http://" + window.location.host + to.path;
    }
  },
  afterRouteEnter(to, from, next) {
    window.scroll(0, 0);
  }
};
</script>

<style src="./standard-quiz-results.css" scoped></style>
<style src="vue-svg-map/dist/index.css"></style>

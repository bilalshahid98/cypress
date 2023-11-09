<template src="./standard-quiz.html"></template>

<script>
import Vue from "vue";
import CustomStorageService from "../../../app-services/custom-storage-service";
import quizService from "../../services/quiz-service";
import pagination from "../../../shared-module/components/pagination/pagination";
import AppLogin from "../../../shared-module/components/app-login/app-login";
import appService from "../../../app-services/app-service";
import practiceLiveUsers from "../practice-users/practice-users.vue";
import {
  submitQuestionSocketInit,
  tracker
} from "../../services/submit-question-service";
import { practiceSocketInit } from "../../services/practice-socket-service";
import VueEllipseProgress from "vue-ellipse-progress";
Vue.use(VueEllipseProgress);
import toastr from "toastr";
let practiceSocket;
export default {
  name: "app-standard-quiz",
  components: {
    "base-pagination": pagination,
    "practice-live-users": practiceLiveUsers,
    "app-login": AppLogin,
  },
  data() {
    return {
      steps: [
        {
          target: ".mark-btn",
          content:
            "If you are unsure about the answer of a question, you can mark It for review and recheck it later.",
          params: {
            placement: "bottom"
          }
        },
        {
          target: ".c-3",
          content:
            "Questions marked for review will be compiled in a list here. <br><br>You can use the arrow buttons to go to the previous or next marked question.",
          params: {
            placement: "bottom"
          }
        },
        {
          target: ".c-2",
          content:
            "All skipped questions will be compiled in a list here. <br><br>You can use the arrow buttons to go to the previous or next skipped question.",
          params: {
            placement: "bottom"
          }
        },
        {
          target: ".c-4",
          content:
            "Click the list icon to view a summary list of all the questions in the quiz.",
          params: {
            placement: "bottom"
          }
        }
      ],
      alphabets: ["A", "B", "C", "D", "E", "F", "G", "H"],
      skipKey: 0,
      timeCheck: true,
      quizSummary: false,
      interval: "",
      timeSpent: 0,
      timeConsumed: 0,
      storageId: "",
      attemptedQuestions: [],
      skippedQuestions: [],
      markedQuestions: [],
      attemptedPercentage: 0,
      isPageLoading: true,
      proWalkThrough: false,
      walkThrough: false,
      questions: [],
      question: {},
      index: 0,
      reportQuestionIndex: 0,
      loader: false,
      resultId: "",
      currentPage: 1,
      submitQuizBox: false,
      leaveQuiz: false,
      quizLoaderPercentage: 100,
      myCallbacks: {
        onFinish: this.finishWalkThrough,
        onSkip: this.finishWalkThrough,
        onPreviousStep: this.scrollTop
      },
      reportQuiz: false,
      reportQuizDescArr: [],
      reportQuizDesc: "",
      reportField: false,
      submitProgress: 0,
      loaderSize: 200,
      submitQuizBoxTest: false,
      liveUsers: [],
      practiceResult: false,
      rank: undefined,
      result_attempt_number: 0,
      timerPopupProceed: false,
    };
  },
  watch: {
    question: function() {
      this.question = this.questions[this.index];
    },
    currentPage: function() {
      if (this.index != this.currentPage - 1) {
        const skipBox = document.getElementById("selectSkipped");
        const markedbox = document.getElementById("selectMarked");
        if (skipBox && this.currentPage - 1 !== skipBox.value) {
          skipBox.value = -1;
        }
        if (markedbox && this.currentPage - 1 !== markedbox.value) {
          markedbox.value = -1;
        }
        this.goToQuestion(this.currentPage - 1);
      }
    }
  },
  props: {
    uid: {
      type: String
    },
    sessionId: {
      type: String
    },
    quiz: {
      type: Object
    },
    user: {
      type: Object
    }
  },
  created() {
    this.user = CustomStorageService.getUser();
    this.quiz_id = this.$route.params.id;
  },
  mounted() {
    console.log("quizPage");
    this.checkUserVisitedFirstTime();
    this.uid = this.$route.query.uid;
    this.sessionId = this.$route.query.sessionId;
    this.updateLocalStorage(true);
    this.checkSkippedQuestions();
    this.checkMarkedQuestions();
    this.checkCompletionPercentage();
    this.loaderSize = window.innerWidth < 500 ? 130 : 200;
    this.timer();
    if (!this.quiz) {
      this.$router.push("/quiz/standard-quiz-main/" + this.sessionId);
    } else if (this.quiz.quiz_type === "practice") {
      practiceSocket = practiceSocketInit(
        {
          session_id: this.sessionId,
          quiz_id: this.quiz._id,
          user_id: this.uid
        },
        result => {
          this.usersListUpdated(result);
        },
        submit => {
          if (this.practiceResult && submit.submitBy !== this.user.id) {
            this.practiceResultPage();
          }
          console.log("submit called");
        },
        progress => {
          console.log("progress called");
        }
      );
    }
  },
  beforeRouteLeave (to, from, next) {
    if(practiceSocket) {
      practiceSocket.emit("disconnect-user", {
        session_id: this.sessionId,
        quiz_id: this.quiz._id,
        user_id: this.uid
      });
    }
    
    next();
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  destroyed() {
    console.log("exitQuizPage");
  },
  methods: {
    usersListUpdated(result) {
      const users = result.userConnected.filter(
        user =>
        (user.status === "ROOM_JOINED" || user.status === "ROOM_CREATED") &&
        (this.uid !== user.id && this.randUserId !== user.id)
      );
      const quizSubmitedUsers = result.userConnected.filter(
        user => user.status === "QUIZ_SUBMITTED"
      );
      const activeUsers = result.userConnected.filter(
        user => user.status !== "DISCONNECTED"
      );
      
      if (quizSubmitedUsers.length === activeUsers.length) {
        this.practiceResultPage();
      }
      this.liveUsers = users;
    },
    async checkUserVisitedFirstTime() {
      if (this.user?.user_visits) {
        if (
          this.user?.user_visits?.visited_quiz_page == null ||
          !this.user.user_visits.visited_quiz_page
        ) {
          let obj = {
            uid: this.user.id,
            visited_quiz_page: true
          };
          try {
            if (this.user?.user_visits === null || !this.user?.user_visits) {
              this.user.user_visits = {
                visited_quiz_page: true
              };
            } else {
              this.user.user_visits.visited_quiz_page = true;
            }
          } catch (error) {
            console.log(error);
          }
          await appService.postUserVisited(obj);
        } else {
          this.finishWalkThrough();
        }
      }
    },
    nextSkipped() {
      const e = document.getElementById("selectSkipped");
      const to = Number(e.options[e.selectedIndex].nextSibling.value);
      this.skippedQuestions.forEach((q, i) => {
        if (q.index === to) {
          document.getElementById("selectSkipped").value = `${q.index}`;
          this.goToQuestion(q.index);
        }
      });
    },
    prevSkipped() {
      const e = document.getElementById("selectSkipped");
      const to = Number(e.options[e.selectedIndex].previousSibling.value);
      this.skippedQuestions.forEach((q, i) => {
        if (q.index === to) {
          document.getElementById("selectSkipped").value = `${q.index}`;
          this.goToQuestion(q.index);
        }
      });
    },
    nextMarked() {
      const e = document.getElementById("selectMarked");
      const to = Number(e.options[e.selectedIndex].text) - 1;
      this.markedQuestions.forEach((q, i) => {
        if (q.index === to) {
          document.getElementById("selectMarked").value = `${
            this.markedQuestions[i + 1].index
          }`;
          this.goToQuestion(q.index);
        }
      });
    },
    prevMarked() {
      const e = document.getElementById("selectMarked");
      const to = Number(e.options[e.selectedIndex].text) - 1;
      this.markedQuestions.forEach((q, i) => {
        if (q.index === to) {
          if (this.markedQuestions[i - 1]) {
            document.getElementById("selectMarked").value = `${
              this.markedQuestions[i - 1].index
            }`;
            this.goToQuestion(this.markedQuestions[i - 1].index);
          }
        }
      });
    },
    imgPlaceholder(e) {
      e.target.src = "../../../img/icons/Icon - Add Photo.svg";
    },
    startWalkThrough() {
      this.proWalkThrough = false;
      this.walkThrough = true;
      this.$tours["myTour"].start();
      this.scrollTop();
    },
    scrollTop() {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0.5);
    },
    finishWalkThrough() {
      this.walkThrough = false;
      this.proWalkThrough = false;
      if (this.quiz) this.timer();
    },
    checkSkippedQuestions() {
      this.skippedQuestions = [];
      this.questions.forEach((question, index) => {
        if (question.is_opened) {
          let skipped = true;
          question.options.forEach((option, indx) => {
            if (option.is_selected) {
              skipped = false;
            }
          });
          if (skipped) {
            question.is_skipped = true;
            this.skippedQuestions.push({ index: index, question: question });
          } else {
            question.is_skipped = false;
          }
        } else {
          question.is_skipped = false;
        }
      });
      this.skippedQuestions.sort((a, b) => a.index - b.index);
      if (this.index !== 0) {
        this.updateLocalStorage();
      }
    },
    markTrue(selected) {
      this.questions[this.index].is_solved = true;
      this.question.options.forEach((option, index) => {
        if (index === selected) {
          this.question.options[index].is_selected = true;
        } else {
          this.question.options[index].is_selected = false;
        }
        this.questions[this.index] = this.question;
      });
      this.checkCompletionPercentage();
      this.updateLocalStorage();
      this.checkSkippedQuestions();
    },
    checkCompletionPercentage() {
      this.attemptedQuestions = [];
      this.questions.forEach((question, index) => {
        if (question.is_solved) {
          this.attemptedQuestions.push({ index: index, question: question });
        } else {
          question.is_solved = false;
        }
      });
      // if (this.attemptedQuestions.length) {
      //   const found = this.attemptedQuestions.find(
      //     (element) => element._id === this.question._id
      //   );
      //   if (!found) {
      //     this.attemptedQuestions.push(this.questions[this.index]);
      //   }
      // } else {
      //   this.attemptedQuestions.push(this.questions[this.index]);
      // }
      this.attemptedPercentage =
        (this.attemptedQuestions.length / this.questions.length) * 100;
      this.attemptedPercentage = parseInt(this.attemptedPercentage, 10);
      if (document.getElementById("progress-bar")) {
        document.getElementById("progress-bar").style.width =
          this.attemptedPercentage + "%";
      }
      this.updateLocalStorage();
    },
    goToQuestion(to, type) {
      if (to === "" || to === -1 || to === "-1") return;
      this.quizSummary = false;
      this.index = to;
      if (type === "next") {
        this.$refs.paginationss.nextPage();
      } else if (type === "prev") {
        this.$refs.paginationss.prevPage();
      } else {
        this.$refs.paginationss.changePage(to + 1);
      }
      this.question = this.questions[to];
      this.question.is_opened = true;
      document.getElementById("test").scrollIntoView({ behavior: "smooth" });
      this.checkSkippedQuestions();
      this.checkMarkedQuestions();
      this.updateLocalStorage();
    },
    markQuestion() {
      this.question.is_marked = !this.question.is_marked;
      this.checkMarkedQuestions();
    },
    checkMarkedQuestions() {
      this.markedQuestions = [];
      this.questions.forEach((question, index) => {
        if (question.is_marked) {
          this.markedQuestions.push({ index: index, question: question });
        } else {
          question.is_marked = false;
        }
      });
      this.updateLocalStorage();
    },
    reportProblem() {
      console.log("popup-open");
      this.reportQuiz = true;
      this.reportQuizDescArr = [];
      this.reportQuizDesc = "";
    },
    cancelReport() {
      console.log("popup-close");
      this.reportQuiz = false;
      this.reportField = false;
      this.reportQuizDescArr = [];
      this.reportQuizDesc = "";
    },
    cancelReportQuiz() {
      console.log("popup-close");

      this.reportQuiz = false;
    },
    async postReportQuiz() {
      if (
        this.reportQuizDesc.length == 0 &&
        this.reportQuizDescArr.length == 0
      ) {
        return toastr.info("Please Specify The Problem.");
      }
      console.log("popup-close");
      this.reportQuiz = false;
      this.reportField = false;
      if (this.reportQuizDesc.length > 0) {
        this.reportQuizDescArr.push(this.reportQuizDesc);
      }
      let reportDesc = {
        report_des_arr: this.reportQuizDescArr
      };
      let reportDescAr;
      reportDescAr = this.reportQuizDescArr;

      let obj = {
        report_type: "quiz",
        quiz_id: this.quiz._id,
        user_id: this.user.id,
        report_desc: reportDesc
      };
      this.reportQuestionIndex = this.index + 1;

      let obj2 = {
        report_type: "quiz",
        quiz_id: this.quiz._id,
        user_id: this.user.id,
        report_desc: reportDescAr,
        question_no: this.reportQuestionIndex,
        question_id: this.question._id
      };
      let [reportSent, reportSent2] = await Promise.all([
        // quizService.createReport(obj),
        quizService.createReportInQuizBackend(obj2)
      ]);
      if (reportSent.data.status == "success") {
        toastr.info("Successfully reported");
        this.reportQuizDescArr = [];
        this.reportQuizDesc = "";
      } else {
        toastr.error("Something went wrong!");
      }
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
    updateLocalStorage(first) {
      if (first) {
        // check if(any other quiz data existed in localstorage and remove if any)
        const LocalStorageKeys = Object.keys(localStorage);
        for (let i = 0; LocalStorageKeys.length > i; i += 1) {
          if (
            LocalStorageKeys[i].startsWith("Quiz") &&
            LocalStorageKeys[i] !== `Quiz-${this.sessionId}-${this.uid}`
          ) {
            localStorage.removeItem(LocalStorageKeys[i]);
          }
        }
      }
      this.storageId = `Quiz-${this.sessionId}-${this.uid}`;
      if (this.quiz) {
        this.questions = this.quiz.questions;
        this.question = this.questions[0];
        this.question.is_opened = true;
      }
      if (this.questions && this.questions.length) {
        const data = {
          user: this.user,
          quiz: this.quiz,
          questions: this.questions,
          index: this.index,
          timeConsumed: this.timeConsumed
        };
        CustomStorageService.set(this.storageId, data);
      } else {
        let data = CustomStorageService.get(this.storageId);
        if (data) {
          this.index = data.index;
          this.currentPage = data.index + 1;
          this.quiz = data.quiz;
          this.user = data.user;
          this.questions = data.questions;
          this.timeConsumed = data.timeConsumed;
          this.timeSpent = data.timeConsumed;
          this.question = this.questions[0];
          this.question.is_opened = true;
        }
      }
      this.isPageLoading = false;
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
    timer() {
      if (this.quiz.duration != 0) {
        const seconds = this.quiz.duration - this.timeConsumed;
        let timeInMinutes = seconds / 60;
        this.startTimer(seconds);
      }
    },
    startTimer(sec) {
      let timer = sec,
        minutes,
        seconds;
      this.interval = setInterval(() => {
        //update question time
        if (!this.question.time_spent) {
          this.question.time_spent = 1;
        } else {
          this.question.time_spent += 1;
        }

        //update quiz time
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        document.querySelector("#timer").textContent = this.formatTime(
          timer * 1000
        );
        this.timeSpent += 1;
        if (--timer < 0 && !this.timerPopupProceed) {
          timer = 0;
          this.timeCheck = false;
          this.timeUpBox = true;
          this.$forceUpdate();
          clearInterval(this.interval);
        }
        this.timeConsumed = this.timeConsumed + 1;
        // this.checkSkippedQuestions();
        this.updateLocalStorage();
      }, 1000);
    },
    mainlogoClick() {
      mixpanel.track('VL-Standard-Quiz-Leave',{
        'Course_Id' : this.quiz.course_id,
        'Instructor_Id' : this.quiz.instructor_id,
        'Niche_Name' : this.quiz.course_tag,
        'Quiz_Type' : this.quiz.quiz_type,
        "Quiz_Name" : this.quiz.name,
        "Quiz_ID" : this.quiz.pg_quiz_id,
      });
      if (this.$store.state.isNewReactNative) {
        console.log("close-webview");
      } else {
        this.$router.push("/course/course-landing");
      }
    },
    async submitQuiz() {
      this.timerPopupProceed = true;
      const user = CustomStorageService.getUser();
      if(user && user.id) {
        this.user = CustomStorageService.getUser();
        this.$refs.loginModal.closeLoginPage();
        mixpanel.track('VL-Quiz-Submit',{
          'Course_Id' : this.quiz.course_id,
          'Instructor_Id' : this.quiz.instructor_id,
          'Niche_Name' : this.quiz.course_tag,
          'Quiz_Type' : this.quiz.quiz_type,
          "Quiz_Name" : this.quiz.name,
          "Quiz_ID" : this.quiz.pg_quiz_id,
        });
        try {
          this.submitProgress = 0;
          this.skippedQuestions = [];
          let attemptedQuestions = [];
          this.questions.forEach((question, index) => {
            question.options.forEach((option, indexOption) => {
              if (option.is_selected) {
                attemptedQuestions.push(index);
              }
            });
            if (!attemptedQuestions.includes(index)) {
              this.skippedQuestions.push({ index, question });
            }
          });
          const body = {
            time_spent: Number(this.timeSpent),
            skipped_questions: this.skippedQuestions,
            marked_questions: this.markedQuestions,
            user: this.user,
            quiz: this.quiz,
            questions: this.questions,
            session_id: this.sessionId,
            prediction: sessionStorage.getItem(`prediction-${this.quiz._id}`)
          };
          this.loader = true;
          this.submitQuizBox = false;
          this.submitQuizBoxTest = false;
          this.timeUpBox = false;
          clearInterval(this.interval);
          const user_details = await tracker();
          this.submitProgress = 20;
          if(typeof this.uid === 'string' && this.uid.includes('__') && practiceSocket) {
            practiceSocket.emit("disconnect-user", {
              session_id: this.sessionId,
              quiz_id: this.quiz._id,
              user_id: this.uid
            });
          }
          submitQuestionSocketInit(
            body,
            user_details,
            result => {
              let rank = result.rank;
              this.rank = result.rank;
              result = result.result;
              this.loader = false;
              this.resultId = result._id;
              toastr.success("Quiz Submitted");
              sessionStorage.removeItem(`prediction-${this.quiz._id}`);
              if (this.quiz.quiz_type === "practice") {
                this.result_attempt_number = result.attempt_number;
                this.submitPracticeQuiz();
              } else {
                if (result.attempt_number == 1 && rank && rank > -1 && rank <= 50)
                  this.$router.push("/quiz/result-position/" + this.resultId);
                else
                  this.$router.push(
                    "/quiz/standard-quiz-results/" + this.resultId
                  );
              }
            },
            error => {
              // throw new Error(error);result.rank
              toastr.error(error);
              this.loader = false;
              this.submitProgress = 0;
              this.submitQuizBoxTest = true;
            },
            progress => (this.submitProgress = 20 + progress)
          );
          console.log("PROGRESS", this.submitProgress);
          return false;
        } catch (error) {
          this.loader = false;
          this.submitProgress = 0;
          this.submitQuizBoxTest = true;
          if (error.response) {
            toastr.error(error.response.data.errors[0].messages[0]);
          } else if (error.message) {
            toastr.error(error.message);
          } else {
            toastr.error(error);
          }
        }
      } else {
        this.submitQuizBox = false;
        this.submitQuizBoxTest = false;
        this.timeUpBox = false;
        this.$forceUpdate();
        this.$refs.loginModal.openSignupPopup();
      }
      
    },
    submitPracticeQuiz() {
      practiceSocket.emit("quiz-submitted", {
        session_id: this.sessionId,
        quiz_id: this.quiz._id,
        user_id: this.user.id,
        result_id: this.resultId
      });
      if (this.liveUsers && this.liveUsers.length > 0) {
        this.practiceResult = true;
      } else {
        if (
          this.result_attempt_number == 1 &&
          this.rank &&
          this.rank > -1 &&
          this.rank <= 50
        )
          this.$router.push("/quiz/result-position/" + this.resultId);
        else this.$router.push("/quiz/standard-quiz-results/" + this.resultId);

      }
    },
    practiceResultPage() {
      if(this.resultId) {
        if (
          this.result_attempt_number == 1 &&
          this.rank &&
          this.rank > -1 &&
          this.rank <= 50
        )
          this.$router.push("/quiz/result-position/" + this.resultId);
        else this.$router.push("/quiz/standard-quiz-results/" + this.resultId);
      }
      
    },
    formatTime(msec) {
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
    showSubmitBox() {
      mixpanel.track('VL-Quiz-Finsh',{
        "Quiz_Name" : this.quiz.name,
        "Quiz_ID" : this.quiz.pg_quiz_id
      });
      const attemptedQuestions = [];
      this.skippedQuestions = [];
      this.questions.forEach((question, index) => {
        question.options.forEach((option, indexOption) => {
          if (option.is_selected) {
            attemptedQuestions.push(index);
          }
        });
        if (!attemptedQuestions.includes(index)) {
          this.skippedQuestions.push({ index, question });
        }
      });
      this.submitQuizBox = true;
    }
  }
};
</script>
<style src="./standard-quiz.css" scoped></style>

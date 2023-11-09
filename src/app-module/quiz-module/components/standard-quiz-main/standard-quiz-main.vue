<template src="./standard-quiz-main.html"></template>

<script>
import Bar from "./../../../course-module/components/charts/bars";
import QuizService from "../../services/quiz-service";
import appHeader from "./../../../shared-module/components/app-header/app-header.vue";
import customStorageService from "../../../app-services/custom-storage-service";
import appsidebar from "./../../../shared-module/components/app-sidebar/app-sidebar.vue";
import appService from "../../../app-services/app-service";
import toastr from "toastr";
import quizService from "../../services/quiz-service";
import practiceLiveUsers from "../practice-users/practice-users.vue";
import { practiceSocketInit } from "../../services/practice-socket-service";
import breadCrumns from "./../../../shared-module/components/bread-crumbs/bread-crumbs.vue";
import btnMdcatResult from "./../../../shared-module/components/btn-mdcat-result/btn-mdcat-result.vue";
let practiceSocket;
export default {
  name: "app-standard-quiz-main",
  components: {
    "app-bars": Bar,
    "app-header": appHeader,
    "app-sidebar": appsidebar,
    "practice-live-users": practiceLiveUsers,
    "bread-crumbs": breadCrumns,
    "btn-mdcat-result": btnMdcatResult,
  },
  data() {
    return {
      responseSession: '',
      randUserId: customStorageService.getBrowserId(),
      coppied: false,
      clap1: false,
      clap2: false,
      clap3: false,
      quiz: {},
      topStudents: [],
      studentPerformance: [{}],
      studentAttempts: [],
      sessionId: this.$route.params.id,
      totalAttempts: 0,
      guidelines: false,
      guideline: 1,
      loader: false,
      wireFrames: false,
      wireFramesT: false,
      delayedResult: false,
      resultDelayTime: "",
      immediateResult: false,
      isSessionValid: false,
      inValidSessionMessage: "",
      averageScore: 0,
      studentPositions: [],
      previousResult: {
        correct_percentage: 0
      },
      user: {
        type: Object
      },
      visited_quiz_page: false,
      predictionBtn: true,
      userPredictionPopup: false,
      userPredictionScore: false,
      message: "Analyzing your data",
      position: "",
      predictedScore: "Not Calculated",
      predictedScoreFalse: "",
      startWithOutFriend: true,
      practicePopup: false,
      quizLink: window.location.href,
      liveUsers: [],
      showLiveUsers: [],
      notShowingLiveUsers: [],
      showLiveUsersCount: 10,

      sharing: {
        url: window.location.href,
        title: "Challenging! Quiz at Nearpeer.org",
        description: `Hey,
I am challenging you to compete with me on the following quiz at Nearpeer.org. 
 
${window.location.href}

Let's see if you can beat me.`,
        quote: `Hey,
I am challenging you to compete with me on the following quiz at Nearpeer.org. 

${window.location.href}

Let's see if you can beat me.`,
        hashtags: "nearpeer,nearpeer.org"
      },
      attemptDropDown: false,
      firstAttempt: true,
      firstAttemptTopStudents: [],
      latestAttemptTopStudents: [],
      timeoutclap: null,
      graphShown: false,

      crumbs: []
    };
  },
  created() {
    if (customStorageService.getUser()) {
      this.user = customStorageService.getUser();
      this.position = this.user.name;
    }
  },
  mounted() {
    if (customStorageService.getUser()) {
      this.checkUserVisitedFirstTime();
      this.getQuiz();
    } else {
      this.getQuiz();
    }
    // this.$refs.myvideo.play();
    document.body.classList.add("verify-banner");
  },
  beforeRouteLeave (to, from, next) {
    if(to.name !== 'app-standard-quiz' && practiceSocket) {
      practiceSocket.emit("disconnect-user", {
        session_id: this.responseSession,
        quiz_id: this.quiz._id,
        user_id: this.user.id ? this.user.id : this.randUserId,
      });
    }
    next();
  },
  beforeDestroy() {
    if(practiceSocket) {
      practiceSocket.emit("disconnect-user", {
        session_id: response.data.data.session._id,
        quiz_id: this.quiz._id,
        user_id: this.user.id ? this.user.id : this.randUserId,
      });
    }
    
  },
  destroyed() {
    document.body.classList.remove("verify-banner");
  },
  methods: {
    gotoQuiz() {
      mixpanel.track('VL-Quiz-Start-Page',{
        'Course_Id' : this.quiz.course_id,
        'Instructor_Id' : this.quiz.instructor_id,
        'Niche_Name' : this.quiz.course_tag,
        'Quiz_Type' : this.quiz.quiz_type,
        "Quiz_Name" : this.quiz.name,
        "Quiz_ID" : this.quiz.pg_quiz_id,
        
      });
      this.guidelines = false;
      this.$router.push({
        name: "app-standard-quiz",
        query: { uid: this.user.id ? this.user.id : this.randUserId, sessionId: this.sessionId },
        params: { user: this.user, quiz: this.quiz }
      });
    },
    async checkUserVisitedFirstTime() {
      if (this.user?.user_visits) {
        if (
          this.user?.user_visits?.visited_quiz_page == null ||
          !this.user.user_visits.visited_quiz_page
        ) {
          this.visited_quiz_page = false;
          let obj = {
            uid: this.user.id,
            visited_quiz_page: true
          };
          await appService.postUserVisited(obj);
        } else {
          this.visited_quiz_page = true;
        }
      }
    },
    viewPreviousResult() {
      this.$router.push(
        "/quiz/standard-quiz-results/" + this.previousResult._id
      );
    },
    calculateQuizTime(seconds) {
      seconds = Number(seconds);
      console.log("ROUTE DATA==", this.$route);
      let h = Math.floor(seconds / 3600) || "";
      let m = Math.floor((seconds % 3600) / 60) || "";
      let s = Math.floor((seconds % 3600) % 60) || "";
      if (h < 10 && h > 0) {
        h = "0" + h;
      }
      if (m < 10 && m > 0) {
        m = "0" + m;
      }
      if (s < 10 && s > 0) {
        s = "0" + s;
      }
      h = h != 0 ? h + "h" : h;
      m = m != 0 ? m + "m" : m;
      s = s != 0 ? s + "s" : s;
      const time = `${h} ${m} ${s}`;
      return time;
    },
    setSessionTimer(startDate) {
      const interval = setInterval(() => {
        if (startDate > new Date()) {
          this.inValidSessionMessage =
            "Session not started yet, try back after <b>" +
            this.formatTime((startDate - new Date()) / 1000) +
            "</b>";
        } else {
          this.isSessionValid = true;
          clearInterval(interval);
        }
      }, 1000);
    },
    redirectToModule(data) {
      if(this.user && this.user.id) {
        window.location.href =
        process.env.VUE_APP_REDIRCT_URL +
        "/" +
        data.index_url +
        "/" +
        data.module_no +
        "?uid=" +
        this.user.id +
        "&token=" +
        this.user.token;
      } else {
        window.location.href =
        process.env.VUE_APP_REDIRCT_URL +
        "/" +
        data.index_url +
        "/" +
        data.module_no;
      }
      
    },
    async getQuiz() {
      try {
        this.loader = true;
        let response = await QuizService.getQuiz(this.sessionId);
        if (response) {
          this.loader = false;
          if (response.data.code === "NO_ACCESS") {
            this.redirectToModule(response.data.module);
          } else {
            this.responseSession = response.data.data.session._id;
            if (response.data.data.session.type !== "general") {
              const startDate = new Date(response.data.data.session.start_time);
              const endDate = new Date(response.data.data.session.end_time);
              if (startDate <= new Date() && endDate >= new Date()) {
                this.isSessionValid = true;
              } else if (startDate > new Date()) {
                this.isSessionValid = false;
                this.inValidSessionMessage =
                  "Session not started yet, try back after <b>" +
                  this.formatTime((startDate - new Date()) / 1000) +
                  "</b>";
                this.setSessionTimer(startDate);
              } else {
                this.isSessionValid = false;
                this.inValidSessionMessage = "Session is Invalid or expired";
              }
            } else this.isSessionValid = true;

            this.quiz = response.data.data.session.quiz;

            if (this.crumbs.length === 0) {
              this.crumbs.push({
                name: "Nearpeer.org",
                url: "/course/course-landing",
                imageurl: "---"
              });

              if (this.quiz.course.name) {
                this.crumbs.push({
                  name: this.quiz.course.name,
                  url:
                    "/course/course-detail" +
                    "/" +
                    this.quiz.course.index_url +
                    "/" +
                    this.quiz.course?.id
                });
              }
              this.crumbs.push({
                name: this.quiz.name,
                url:
                  "/quiz/standard-quiz-main/" + response.data.data.session._id
              });
            }
            if (this.quiz.quiz_type === "practice") {
              if (this.user.id === this.quiz.user_id) {
                this.practicePopup = true;
                this.startWithOutFriend = true;
              }

              practiceSocket = practiceSocketInit(
                {
                  session_id: response.data.data.session._id,
                  quiz_id: this.quiz._id,
                  user_id: this.user.id ? this.user.id : this.randUserId,
                  isNotification: true
                },
                result => {
                  this.usersListUpdated(result);
                },
                result => {
                  console.log("on Quiz Submit");
                },
                error => {
                  console.log("error called");
                }
              );
            }
            if (this.quiz.result_delay_in_hours == 0) {
              this.immediateResult = true;
            } else {
              this.delayedResult = true;
              this.resultDelayTime = this.quiz.result_delay_in_hours;
            }
            if (this.quiz.duration)
              this.quiz.durationString = this.quiz.duration
                ? this.formatTime(this.quiz.duration)
                : "0 min";
            this.quiz.resultTime =
              this.quiz.result_delay_in_hours > 0
                ? `in ${this.quiz.result_delay_in_hours} Hours`
                : `immediately`;
            this.previousResult = response.data?.data?.session?.result;
            this.getQuizAttempts();
            this.getQuizTopStudents();
            this.getStudentQuizPerformance();
            this.quiz.questions.forEach((question, index) => {
              this.quiz.questions[index].is_skipped = false;
              this.quiz.questions[index].is_marked = false;
              this.quiz.questions[index].is_solved = false;
              question.options.forEach((opt, indx) => {
                this.quiz.questions[index].options[indx].is_selected = false;
              });
            });
          }
        }
      } catch (error) {
        toastr.error(error.message);
      }
    },
    usersListUpdated(result) {
      const users = result.userConnected.filter(
        user =>
          (user.status === "ROOM_JOINED" || user.status === "ROOM_CREATED") &&
          (this.user.id !== user.id && this.randUserId !== user.id)
      );
      if (users.length > 0) {
        this.startWithOutFriend = false;
      } else {
        this.startWithOutFriend = true;
      }
      this.liveUsers = users;

      this.showLiveUsers = this.liveUsers.slice(0, this.showLiveUsersCount);
      this.notShowingLiveUsers = this.liveUsers.slice(this.showLiveUsersCount);
    },
    async getQuizAttempts() {
      try {
        let response = await QuizService.getQuizAttempts(this.quiz._id);
        if (response) {
          this.totalAttempts = response.data.data.attempts;
        }
      } catch (error) {
        // console.log(error);
      }
    },
    async getQuizTopStudents() {
      try {
        this.wireFramesT = true;
        let [responseFirst, responseLatest] = await Promise.all([
          QuizService.getQuizTopStudents(this.quiz._id, undefined, true),
          QuizService.getQuizTopStudents(this.quiz._id, undefined, false)
        ]);
        if (responseFirst && responseLatest) {
          this.wireFramesT = false;
          this.firstAttemptTopStudents = responseFirst.data.data.quiz;
          this.latestAttemptTopStudents = responseLatest.data.data.quiz;
          this.firstAttemptTopStudents.forEach((student, index) => {
            student.time_spent = this.formatTime(student.time_spent);
          });
          this.latestAttemptTopStudents.forEach((student, index) => {
            student.time_spent = this.formatTime(student.time_spent);
          });
          this.topStudents = this.firstAttempt
            ? this.firstAttemptTopStudents
            : this.latestAttemptTopStudents;
          this.topStudents.forEach((student, index) => {
            if (index < 3) {
              this.studentPositions.push(student);
            }
          });
        }
      } catch (error) {
        console.log(error);
      }
    },
    async getStudentQuizPerformance() {
      try {
        this.wireFrames = true;
        let response = await QuizService.getStudentQuizPerformance(
          this.quiz._id
        );
        if (response) {
          this.wireFrames = false;
          const results = response.data.data.results;
          this.averageScore = results.length
            ? results.length > 1
              ? results.reduce((t, r) =>
                  typeof t === "object"
                    ? t.correct_percentage + r.correct_percentage
                    : t + r.correct_percentage
                ) / results.length
              : results[0].correct_percentage
            : 0;

          const graphData = results.map((result, index) => {
            this.studentAttempts.push(index + 1);
            return result.correct_percentage;
          });
          if (graphData.length) this.graphShown = true;
          this.studentPerformance = [
            {
              // label: "Your Performance",
              backgroundColor: "#5169D5",
              data: graphData,
              barThickness: 10
            }
          ];
        }
      } catch (error) {
        // console.log(error);
      }
    },
    formatTime(sec) {
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
    },
    async userPrediction() {
      this.predictionBtn = false;

      this.userPredictionPopup = true;
      const scopedThis = this;

      if (this.userPredictionPopup === true) {
        setTimeout(function() {
          scopedThis.message = "Analyzing you data...";
        }, 1000);
        setTimeout(function() {
          scopedThis.message = "Analyzing trends...";
        }, 1500);
        setTimeout(function() {
          scopedThis.message = "Calculating you score...";
        }, 2000);
        const predictionResponse = await quizService.getQuizPrediction(
          this.quiz.course_id,
          this.quiz._id
        );
        if (predictionResponse.data.status == "success") {
          this.predictedScore = predictionResponse.data.data.predictedScore;
          sessionStorage.setItem(
            `prediction-${this.quiz._id}`,
            predictionResponse.data.data.predictedScore
          );
          window.addEventListener("beforeunload", () => {
            sessionStorage.removeItem(`prediction-${this.quiz._id}`);
            return true
          });
        } else {
          this.predictedScoreFalse =
            predictionResponse.data.data.predictedScore;
        }
        setTimeout(function() {
          scopedThis.userPredictionPopup = false;
          scopedThis.userPredictionScore = true;
        }, 4000);
      }
    },
    beforeRouteLeave(to, from, next) {
      console.log(to);
      if (to.path != "/quiz/standard-quiz")
        sessionStorage.removeItem(`prediction-${this.quiz._id}`);
      next();
    },
    copyURL() {
      const el = document.createElement("textarea");
      el.value = window.location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      this.coppied = true;
      setTimeout(() => {
        this.coppied = false;
      }, 3000);
    },
    attempField(e) {
      e.preventDefault();
      e.stopPropagation();
      this.attemptDropDown = !this.attemptDropDown;
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
    selected(crumb) {
      console.log(crumb);
    }
  }
};
</script>

<style src="./standard-quiz-main.css" scoped></style>

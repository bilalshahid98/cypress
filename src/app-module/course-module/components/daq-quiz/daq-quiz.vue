<template src="./daq-quiz.html"></template>

<script>
import Vue from "vue";
import QuizService from "../../../quiz-module/services/quiz-service";
import customStorageService from "../../../app-services/custom-storage-service";
import toastr from "toastr";
import ClickOutside from "vue-click-outside";
import VueApexCharts from "vue-apexcharts";
import { isMobile } from "mobile-device-detect";
/* eslint-disable no-useless-escape */
let user, result_id, prevResult;
export default {
  name: "app-pdf-viewer",
  props: [
    "quiz_id",
    "daqLeaveConfirmationPopup"
  ],
  components: {
    apexchart: VueApexCharts,
  },
  directives: {
    ClickOutside
  },
  data() {
    return {
      session: {},
      quiz: {},
      quizIntro: false,
      questions: [],
      selectedQuestion: {},
      selectedQuestionIndex: 0,
      currentStep: 1,
      daqQuestionResult: false,
      daqFinalResult: false,
      daqChartValue: [0],
      daqOverallScore: [0],
      daqChartOptions: {
        chart: {
          height: 40,
          type: 'radialBar',
        },
        plotOptions: {
          radialBar: {
            hollow: {
              size: '60%',
            },
            track: {
              show: true,
              background: "#ffffff",
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
            },
          },
        },
        fill: {
          colors: '#007A7B',
          opacity: 0.9,
          type: 'solid',
        },
        stroke: {
          lineCap: "round",
        },
      },
      daqTC: false,
      selectionTypeWrite: false,
      selectionTypeUpload: false,
      selectOption: true,
      preview_list: [],
      image_list: [],
      daqLikePopUp: false,
      daqLike: false,
      daqDisLike: false,
      timer: 0,
      intervalId: null,
      skeletonLoader: true,
      resultLoader: false,
      showShortText: true,
      resumePopup: false,
      notifyLaterPopup: false,
      notifyClicked: false,
    };
  },
  methods: {
    showLoader() {
      this.skeletonLoader = true;
    },
    stopLoader() {
      this.skeletonLoader = false;
    },
    showResultLoader() {
      this.resultLoader = true;
    },
    stopResultLoader() {
      this.resultLoader = false;
    },
    startQuiz(force) {
      if (prevResult && !force) {
        this.resumePopup = true;
      } else {
        this.$emit("sendDaqEvent", {type: 'assignment-started'});
        this.quizIntro = false;
        this.startTimer();
        this.resumePopup = false;
        if(isMobile) {
          window.scrollTo(0, 0);
        }
      }

    },
    async startQuizResult() {
      this.daqFinalResult = true;
      this.daqQuestionResult = false;
      const res = await QuizService.getDaqResult({ result_id: result_id, quiz_id: this.quiz.id });
      if (res.data && res.data.success) {
        const result = res.data.result;
        this.daqOverallScore = [result.correct_percentage];
        this.daqChartValue = [result.correct_percentage];
      }
    },
    nextQuestion() {
      if (this.daqQuestionResult && this.selectedQuestionIndex < this.questions.length) {
        this.preview_list = [];
        this.image_list = [];
        this.selectedQuestion = this.questions[this.selectedQuestionIndex];
        this.setOcrSelectionCheck();
        this.daqQuestionResult = false;
        this.startTimer();
        if(isMobile) {
          window.scrollTo(0, 0);
        }
      } else if (this.daqQuestionResult && this.selectedQuestionIndex === this.questions.length) {
        this.startQuizResult();
        this.$emit("toggleVideoListing", true);
        this.$emit("sendDaqEvent", {type: 'assignment-completed'});
      } else {
        if (this.selectionTypeWrite) {
          if(this.selectedQuestion.answer && this.selectedQuestion.answer.length < 25) {
            toastr.error("Please enter valid answer");
            return;
          }
          if (this.selectedQuestion.answer) {
            this.stopTimer();
            this.selectedQuestionIndex = this.selectedQuestionIndex + 1;
            this.submitQuestion(this.selectedQuestion);
          } else {
            toastr.error("Please enter answer");
          }

        } else {
          if (this.image_list && this.image_list.length > 0) {
            this.submitImageQuestion(this.selectedQuestion);
          } else {
            toastr.error("Please select image first");

          }
        }
      }
    },
    goToSpecificQuestion(index) {
      this.selectedQuestionIndex = index;
      this.selectedQuestion = this.questions[index];
    },
    tryNewResponse() {
      this.selectedQuestionIndex = this.selectedQuestionIndex - 1;
      this.nextQuestion();
    },
    async submitImageQuestion(question) {
      let answersArray = [];
      let promises = [];
      this.selectedQuestion.result = {};
      this.showResultLoader();
      
      this.image_list.forEach(async (image, index) => {
        let fd = new FormData();
        fd.append("files", image, image.name);
      
        const jsonData = { question, session: this.session, user, result_id };
        fd.append('json', JSON.stringify(jsonData));
        let promise =  QuizService.getDaqResultFromImage(fd).then(res => {
            if (res.data && res.data.success) {
                answersArray[index] = res.data.answer;
            }
        })
        .catch(error => {
            // Handle errors if necessary
            console.error(error);
        });
        promises.push(promise);
      })
      
      await Promise.all(promises);
      this.selectionTypeWrite = true;
      this.preview_list = [];
      this.selectedQuestion.answer = '';
      answersArray.forEach(ans => {
        this.selectedQuestion.answer = this.selectedQuestion.answer + ans;
      })

      this.stopResultLoader();
      // this.daqQuestionResult = true;
      this.$forceUpdate();
    },

    async submitQuestion(question) {
      this.selectedQuestion.result = {};
      this.showResultLoader();
      let res = await QuizService.checkdaqQuestion({ question, session: this.session, user, result_id });
      if (res.data && res.data.success) {
        this.selectedQuestion.shortAnswer = this.selectedQuestion.answer.substring(0, 300);
        this.selectedQuestion.result = res.data.result;
        result_id = res.data.result.result_id;
        const result = res.data.result;
        this.daqChartValue = [result.content_marks];
        this.daqOverallScore = [result.marks_obtained];
        this.daqQuestionResult = true;
        this.stopResultLoader();
      } else {
        this.notifyLaterPopup = true;
      }
      this.$forceUpdate();

    },
    setOcrSelectionCheck() {
      if(this.selectedQuestion.allow_ocr) {
        this.selectionTypeUpload = false;
        this.selectionTypeWrite = false;
        this.selectOption = true;
      } else {
        this.selectionTypeUpload = false;
        this.selectionTypeWrite = true;
        this.selectOption = false;
      }
    },
    async getQuiz() {
      this.showLoader();
      this.$emit("toggleVideoListing", false);
      const quiz = await QuizService.getQuiz(this.$route.query.daq_id);
      if (quiz.data && quiz.data.status === "success") {
        this.session = quiz.data.data.session;
        this.quiz = this.session.quiz;
        this.questions = this.quiz.questions;
        this.selectedQuestion = this.questions[this.selectedQuestionIndex];
        this.setOcrSelectionCheck();
        this.timer = this.quiz.duration;
        this.quizIntro = true;
        this.getDaqLastResult()
        this.$emit("daqQuizLoaded", this.quiz);
        this.stopLoader();
      }
    },
    async getDaqLastResult() {
      const quizResult = await QuizService.getDaqLastResult({ quiz_id: this.quiz._id });
      if (quizResult.data && quizResult.data.success && quizResult.data.questions.length > 0 && quizResult.data.questions.length < this.questions.length) {
        prevResult = quizResult.data;
      }
    },
    formattedEvaluationResult() {
      if(this.selectedQuestion.result && this.selectedQuestion.result.evaluation_result)
        return this.selectedQuestion.result.evaluation_result.replace(/\n/g, '<br>');
      else 
        return '';
    },
    resumeQuiz() {
      this.goToSpecificQuestion(prevResult.questions.length);
      result_id = prevResult.result._id;
      this.questions.forEach(que => {
        const found = prevResult.questions.find(item => item._id === que._id);
        if (found) {
          que.answer = found.answer;
          que.result = found.result;
        }
      })
      this.startQuiz(true);
    },
    async saveFeedback(question, index, status, text) {
      this.daqLikePopUp = true;
      if (status === 'like') {
        this.daqLike = true;
        this.daqDisLike = false;
      } else {
        this.daqLike = false;
        this.daqDisLike = true;
      }
      this.questions[index].feedback = status;
      const quiz = await QuizService.saveAnswerFeedback({
        "result_id": result_id,
        "question_id": question._id,
        "feedback_status": status,
        "feedback_text": text
      });
    },
    openDaqTC() {
      this.daqTC = true
    },
    closeDaqTC() {
      this.daqTC = false
    },
    selectionType(type) {
      this.selectOption = false
      if (type === 'write') {
        this.selectionTypeWrite = true;
      }
      if (type === 'upload') {
        this.selectionTypeUpload = true;
      }
    },
    opneLikePopUp(popup, type) {
      this.daqLikePopUp = true;
      if (popup === 'open' && type == 'like') {
        this.daqLike = true;
        this.daqDisLike = false;
      } else if (popup === 'open' && type == 'disLike') {
        this.daqLike = false;
        this.daqDisLike = true;
      } else if (popup === 'close') {
        this.daqLikePopUp = false;
      }
    },
    onDrop(event) {
      event.preventDefault();
      const files = event.dataTransfer.files;
      this.imageSelectFromSystem(files);
    },
    previewMultiImage(event) {
      var input = event.target;
      this.imageSelectFromSystem(input.files);
    },
    imageSelectFromSystem(files) {
      this.selectionTypeUpload = false;
      var count = files.length;
      var index = 0;
      if (files) {
        while (count--) {
          var reader = new FileReader();
          reader.onload = (e) => {
            this.preview_list.push(e.target.result);
          }
          this.image_list.push(files[index]);
          reader.readAsDataURL(files[index]);
          index++;
        }
      }
    },
    removeImage(index) {
      this.preview_list = [];
      this.image_list = [];
      this.selectionTypeUpload = true;
    },
    calculateQuizTime(seconds) {
      seconds = Number(seconds);
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
    startTimer: function () {
      // Start the countdown
      this.intervalId = setInterval(() => {
        if (this.timer > 0) {
          this.timer--;
        } else {
          // Timer reached 0, stop the interval
          clearInterval(this.intervalId);
        }
      }, 1000); // Update every second
    },
    stopTimer: function () {
      clearInterval(this.intervalId);
    },
    timerDisplay: function () {
      const minutes = Math.floor(this.timer / 60);
      const seconds = this.timer % 60;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    },
    tryQuestionAgain() {
      this.selectedQuestionIndex = this.selectedQuestionIndex - 1;
      this.notifyLaterPopup = false;
      this.stopResultLoader();
    },
    tryAgain() {
      this.$emit("toggleVideoListing", false);
      this.quizIntro = true;
      this.selectedQuestionIndex = 0;
      this.questions.forEach(question => {
        delete question.answer;
        delete question.result
      })
      this.selectedQuestion = this.questions[this.selectedQuestionIndex];
      this.daqFinalResult = false;
      this.daqQuestionResult = false;
      this.timer = this.quiz.duration;
      this.selectionTypeUpload = false;
      this.selectionTypeWrite = false;
      this.selectOption = true;
      this.stopResultLoader();
      result_id = null;
      this.resumePopup = false;
      this.notifyClicked = false;
      prevResult = null;
    },
    toggleReadMore() {
      this.showShortText = !this.showShortText;
    },
    async notifyOnceChecked() {
      await QuizService.notifyOnceChecked({ question: this.selectedQuestion, session: this.session, user, result_id });
      this.notifyClicked = true;
    },
    gotoNext(save) {
      this.$emit("gotoNext");
    }
  },
  computed: {
    showReadMoreButton() {
      return this.selectedQuestion.answer && this.selectedQuestion.answer.length > 300;
    },
    buttonLabel() {
      return this.showShortText ? '...Read More' : ' Read Less';
    },
  },
  created() { },
  mounted() {
    this.getQuiz()
    user = customStorageService.getUser();
  },
  watch: {
    '$route.query.daq_id': function (newVal, oldVal) {
      this.stopResultLoader();
      result_id = null;
      this.resumePopup = false;
      this.notifyClicked = false;
      this.getQuiz();
    }
  },
};
</script>

<style src="./daq-quiz.css" scoped></style>

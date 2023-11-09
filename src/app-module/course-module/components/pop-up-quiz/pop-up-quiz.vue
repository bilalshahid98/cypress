<template src="./pop-up-quiz.html"></template>

<script>
import quizService from "../../../quiz-module/services/quiz-service";
import pagination from "../../../shared-module/components/pagination/pagination";
import SingleQuestionStat from "../../../quiz-module/components/single-question-stat/single-question-stat";
import toastr from "toastr";

export default {
  name: "app-pop-up-quiz",
  components: {
    "base-pagination": pagination,
    "app-single-question-stat": SingleQuestionStat
  },
  data() {
    return {
      alphabets: ["A", "B", "C", "D", "E", "F", "G", "H"],
      screenNo: 1,
      index: 0,
      currentPage: null,
      loader: false,
      result: {
        passedQuestions: 0,
        failedQuestions: 0,
        totalQuestions: 0,
        totalAttempts: 0
      },
      quiz: {},
      question: {},
      storageId: "",
      sessionid: "",
      questions: [],
      mustPass: false,
      greenColor: false,
      redColor: false
    };
  },
  props: {
    session: {
      type: Object
    },
    user: {
      type: Object
    },
    isPopQuizSkippable: {
      type: Boolean
    }
  },
  watch: {
    question: function() {
      this.question = this.questions[this.index];
    },
    currentPage: function() {
      if (this.index != this.currentPage - 1) {
        this.goToQuestion(this.currentPage - 1);
      }
    }
  },
  mounted() {
    if (this.session && this.session.quiz) {
      this.quiz = Object.assign({}, this.session.quiz);
      this.mustPass = !this.quiz.is_skippable;
      this.sessionId = this.session._id;
      this.questions = this.quiz.questions;
      this.question = this.quiz.questions[0];
      this.currentPage = 1;
    }
  },
  methods: {
    closeHandler(isPassed = false) {
      this.$emit("closeClick", {
        isPassed,
        session: this.session,
        isSkipable: this.quiz.is_skippable
      });
    },
    imgPlaceholder(e) {
      e.target.src = "../../../img/icons/Icon - Add Photo.svg";
    },
    isHTML(str) {
      var a = document.createElement("div");
      a.innerHTML = str;
      for (var c = a.childNodes, i = c.length; i--; ) {
        if (c[i].nodeType == 1) return true;
      }
      return false;
    },
    markTrue(selected) {
      this.question.options.forEach((option, index) => {
        if (index === selected) {
          this.question.options[index].is_selected = true;
          this.question = Object.assign({}, this.question, {
            is_selected: true
          });
        } else {
          this.question.options[index].is_selected = false;
        }
      });
      this.question.checked = true;
      this.questions[this.index] = this.question;
    },
    goToQuestion(to, type) {
      if (type === "next") {
        this.$refs.paginationss.nextPage();
      } else if (type === "prev") {
        this.$refs.paginationss.prevPage();
      }
      this.index = to;
      this.currentPage = to + 1;
      this.question = this.questions[to];
    },
    mathCreator: function(question, id, data) {
      setTimeout(function() {
        let mathFieldSpan = document.getElementById(id);
        let MQ = MathQuill.getInterface(2);
        let mathField = MQ.StaticMath(mathFieldSpan);
        if (mathField) {
          if (!data.match(/\\\s/g)) {
            data = data.replace(/\s+/g, "\\ ");
          }
          if (data !== "" && data !== "null") {
            mathField.latex(data);
          }
        }
      }, 10);
    },
    isSubmitable() {
      let return_ = true;
      this.questions.forEach(element => {
        if (!element.checked) {
          return_ = false;
        }
      });
      return return_;
    },

    async submitQuiz() {
      if (this.isSubmitable()) {
        try {
          this.loader = true;
          const body = {
            session_id: this.sessionId,
            time_spent: 0,
            skipped_questions: [],
            marked_questions: [],
            user: this.user,
            quiz: this.quiz,
            questions: this.questions
          };
          const response = await quizService.submitQuiz(body);
          if (response) {
            toastr.success("Quiz Submitted");
            this.loader = false;
            if (
              response.data.data.result.correct_percentage <
              response.data.data.result.quiz.passing_percentage
            ) {
              this.loader = false;
              this.redColor = true;
              this.greenColor = false;
              this.screenNo = 4;
              this.result = response.data.data.result;
            } else {
              this.loader = false;
              this.greenColor = true;
              this.redColor = false;
              this.reviewQuestions(response.data.data.result);
            }
          }
        } catch (error) {
          this.loader = false;
          if (error.response) {
            toastr.error(error.response.data.errors[0].messages[0]);
            this.$emit("closeClick");
          } else if (error.message) {
            toastr.error(error.message);
          } else {
            toastr.error(error);
          }
          this.screenNo = 5;
        }
      }
    },
    rewatchVideo() {
      this.$emit("closeClick", { rewatch: true });
    },
    reattempt() {
      this.$parent.reatteptQuiz();
      this.screenNo = 1;
      this.goToQuestion(0);
      this.resetQuestions();
    },
    reviewQuestions(result) {
      this.result.totalQuestions = result.questions.length;
      this.result.passedQuestions = 0;
      this.result.failedQuestions = 0;
      result.questions.forEach(element => {
        if (element.result) {
          this.result.passedQuestions++;
        } else {
          this.result.failedQuestions++;
        }
      });
      this.questions = Object.assign({}, result.questions);
      this.goToQuestion(0);
      this.result.totalAttempts = result.attempt_number;
      // console.log("RESULT", result);
      this.screenNo = 3;
    },
    resetQuestions() {
      this.questions.forEach((question, index) => {
        delete question.checked;
        question.options.forEach((option, index) => {
          delete option.is_selected;
        });
      });
    }
  }
};
</script>

<style src="./pop-up-quiz.css" scoped></style>

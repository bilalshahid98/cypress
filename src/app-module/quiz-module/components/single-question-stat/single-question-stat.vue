<template src="./single-question-stat.html"></template>
<script>
import Doughnut from "../../../course-module/components/charts/Doughnut.vue";

export default {
  name: "app-single-question-stat",
  props: ["questionNo", "question", "totalAttempts", "toThePoint"],
  components: {
    "app-Doughnut": Doughnut
  },
  data: function() {
    return {
      correctPercentage: 0,
      difficultyLevel: "",
      alphabets: ["A", "B", "C", "D", "E", "F", "G", "H"],
    };
  },
  methods: {
    close() {
      // this.$emit("buttonClick");
    },
    reviewAll: function () {
      this.$emit("reviewAll", {});
    },
    mathCreator: function(id, data) {
      setTimeout(() => {
        let mathFieldSpan = document.getElementById(id);
        let MQ = MathQuill.getInterface(2);
        let mathField = MQ.MathField(mathFieldSpan, {
          spaceBehavesLikeTab: false // configurable
        });
        if (!data.match(/\\\s/g)) {
          data = data.replace(/\s+/g, "\\ ");
        }
        if (data !== "" && data !== "null") {
          mathField.latex(data);
        }
      }, 500);
    },
    calculatePercentage: function() {
      (this.question.tags || []).forEach(element => {
        if (element.tag_type === "level") {
          this.difficultyLevel = element.tag_name;
        }
      });
      if (
        this.question.correctCount &&
        this.totalAttempts &&
        this.totalAttempts > 0
      ) {
        this.correctPercentage = (
          (this.question.correctCount / this.totalAttempts) *
          100
        ).toFixed(0);
        this.correctPercentage = parseInt(this.correctPercentage);
      } else {
        this.correctPercentage = 0;
      }
    }
  },
  watch: {
    totalAttempts: function(val) {
      this.calculatePercentage();
    },
    question: function(val) {
      this.calculatePercentage();
      if (this.question.question_id) {
        this.question = _.merge(this.question, this.question.question_id);
        delete this.question.question_id;
      }
    },
    questionNo: function() {
      this.calculatePercentage();
    }
  },
  mounted() {
    this.calculatePercentage();
    if (this.question.question_id) {
      this.question = _.merge(this.question, this.question.question_id);
      delete this.question.question_id;
      this.$forceUpdate();
    }
  }
};
</script>
<style src="./single-question-stat.css" scoped></style>

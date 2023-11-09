<template src="./bread-crumbs.html"> </template>

<script>
export default {
  name: "bread-crumbs",
  props: {
    crumbs: {
      type: Array,
      required: true
    }
  },
  data() {
    return {};
  },
  methods: {
    homePage() {
      console.log("redirection working");
      this.$router.push("/course/course-landing");
    },
    isLast(index) {
      return index === this.crumbs.length - 1;
    },
    selected(url) {
      window.location.href = url;
    }
  },
  mounted() {}
};
</script>

<style src="./bread-crumbs.css"></style>

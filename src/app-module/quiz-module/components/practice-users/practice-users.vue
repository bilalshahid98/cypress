<template src="./practice-users.html"></template>

<script>
export default {
  name: "practice-live-users",
  props: ["liveUsers", "page"],
  data() {
    return {
      windowWidth: window.innerWidth,
      showUsersCount: 3,
      firstThreeUsers: [],
      notShowingLiveUsers: []
    };
  },
  components: {},
  mounted() {},
  methods: {},
  watch: {
    liveUsers: function(newVal, oldVal) {
      if (this.page === "quiz-attempt" && this.windowWidth < 768) {
        this.showUsersCount = 1;
      }
      this.firstThreeUsers = newVal.slice(0, this.showUsersCount);

      if (this.windowWidth < 768) {
        this.firstThreeUsers = newVal.slice(0, this.showUsersCount);
        this.notShowingLiveUsers = newVal.slice(this.showUsersCount);
      }
    }
  }
};
</script>

<style src="./practice-users.css"></style>

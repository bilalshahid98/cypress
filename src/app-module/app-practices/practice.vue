<template src="./practice.html"></template>

<script>
// import customStorageService from "../app-services/custom-storage-service";
// import appService from "../app-services/app-service";
import appHeader from "../shared-module/components/app-header/app-header";
import appFooter from "../shared-module/components/app-footer/app-footer.vue";
import appsidebar from "../shared-module/components/app-sidebar/app-sidebar.vue";
import AppVerification from "./../shared-module/components/app-verification/app-verification";
import PracticeService from "./../app-services/practice-service";
import customStorageService from "./../app-services/custom-storage-service";
import toastr from "toastr";

export default {
  name: "practices",
  data() {
    return {
      isPlaying: true,
      isWrongAttempts: false,
      practiceMain: this.$route.name === "AppPracticesNew" ? false : true,
      practiceStart: this.$route.name === "AppPracticesNew" ? true : false,
      practicePrevious: false,
      step: 1,
      readMore: false,
      practiceSearchDD: false,
      practiceSteps: true,
      practiceWeakSteps: false,
      practiceLoader: false,
      isError: false,
      isLoader: false,
      marketKey: "",
      markets: [],
      featuredMarkets: [],
      selectedMarkets: [],
      courseKey: "",
      courses: [],
      featuredCourses: [],
      selectedCourses: [],
      moduleKey: "",
      modules: [],
      featuredModules: [],
      selectedModules: [],
      topicKey: "",
      topics: [],
      featuredTopics: [],
      selectedTopics: [],
      difficulties: [],
      selectedDifficulties: [],
      practiceQuestionCounter: 10,
      maxQuestions: 0,
      buttonsColor: {
        first: [1, 2, 3, 10, 11, 12, 19, 20, 21],
        second: [4, 5, 6, 13, 14, 15, 22, 23, 24],
        third: [7, 8, 9, 16, 17, 18, 25, 26, 27]
      },
      width: window.innerWidth,
      stotrageData: {
        markets: [],
        courses: [],
        modules: [],
        difficulties: []
      },
      // steps: [
      //     {
      //       target: '.practice-search-input',  // We're using document.querySelector() under the hood
      //       header: {
      //         title: 'Get Started',
      //       },
      //       content: `Discover <strong>Vue Tour</strong>!`
      //     },
      //     {
      //       target: '.practice-search-clear',
      //       content: 'An awesome plugin made with Vue.js!'
      //     },
      //     {
      //       target: '[data-v-step="2"]',
      //       content: 'Try it, you\'ll love it!<br>You can put HTML in the steps and completely customize the DOM to suit your needs.',
      //       params: {
      //         placement: 'top' // Any valid Popper.js placement. See https://popper.js.org/popper-documentation.html#Popper.placements
      //       }
      //     }
      //   ]

      muteBtn: true,
      unMuteBtn: false,
      mute: true
    };
  },
  components: {
    "app-header": appHeader,
    "app-footer": appFooter,
    "app-sidebar": appsidebar,
    "app-verification": AppVerification
  },
  mounted() {
    this.getAllMarkets();
    this.$refs.myvideo.play();
    window.addEventListener("resize", () => {
      this.width = window.innerWidth;
      this.isPlaying = false;
      this.$refs.myvideo.play();
    });
    document.body.classList.add("remove-floating-btn");
  },
  destroyed() {
    document.body.classList.remove("remove-floating-btn");
  },
  methods: {
    setPraticeFromLocalStorage(step) {
      if (step === 1) {
        this.stotrageData.markets = this.selectedMarkets;
      } else if (step === 2) {
        this.stotrageData.courses = this.selectedCourses;
      } else if (step === 3) {
        this.stotrageData.modules = this.selectedModules;
      } else if (step === 4) {
        this.stotrageData.difficulties = this.selectedDifficulties;
      } else if (step === "clean-sotrgae") {
        this.stotrageData = {
          markets: [],
          courses: [],
          modules: [],
          difficulties: []
        };
      }
      customStorageService.setPracticeData(this.stotrageData);
    },
    getPraticeFromLocalStorage() {
      this.stotrageData = customStorageService.getPracticeData();
    },
    scrollTop(ref) {
      this.$nextTick(() => {
        this.$refs[ref].scrollTop = 0;
      });
    },
    filterData(array, value, field) {
      return array.filter(function(ele) {
        return ele[field].toLowerCase().includes(value.toLowerCase());
      });
    },
    setSelectedFromStorage(storageData, sourseData) {
      const selectedData = [];
      storageData.forEach(data => {
        const isFound = sourseData.find(source => source.id === data.id);
        if (isFound) {
          selectedData.push(data);
        }
      });
      return selectedData;
    },
    addSelectedOnStart(featuredList, selectedItem) {
      let newList = featuredList.filter(function(ele) {
        return ele.id != selectedItem.id;
      });
      if (selectedItem) {
        newList = [selectedItem, ...newList];
      } else {
        newList = [...newList, selectedItem];
      }
      return newList;
    },
    removeItemFromArray(arr, value, field) {
      return arr.filter(function(ele) {
        return ele[field] != value[field];
      });
    },
    async getAllMarkets() {
      const markets = await PracticeService.getMarkets();
      if (markets.success) {
        this.markets = markets.tags;
        this.featuredMarkets = this.markets;
        this.getPraticeFromLocalStorage();
        console.log("this.stotrageData");
        console.log(this.stotrageData);
        this.selectedMarkets = this.stotrageData.markets;
      }
    },
    selectMarket(market, type) {
      this.isError = false;
      const isFound = this.selectedMarkets.find(
        selected => selected.id === market.id
      );
      if (!isFound) {
        this.selectedMarkets.push(market);
        if (type === "dropdown") {
          this.featuredMarkets = this.addSelectedOnStart(
            this.featuredMarkets,
            market
          );
        }
      } else if (type !== "dropdown") {
        this.selectedMarkets = this.removeItemFromArray(
          this.selectedMarkets,
          market,
          "id"
        );
        this.featuredMarkets = this.addSelectedOnStart(this.featuredMarkets);
      }
      this.closeSearch();
    },
    clearSelectedMarkets() {
      this.selectedMarkets = [];
    },
    checkIsSelectedMarket(market) {
      const isFound = this.selectedMarkets.find(
        selected => selected.id === market.id
      );
      return isFound ? true : false;
    },

    // Courses Step
    async getTagsCourses() {
      this.isLoader = true;
      const tags = this.selectedMarkets.map(market => market.id);
      const courses = await PracticeService.getTagCourses({ tags });
      if (courses.success) {
        this.courses = courses.courses;
        this.featuredCourses = this.courses;
        this.selectedCourses = this.setSelectedFromStorage(
          this.stotrageData.courses,
          this.courses
        );
      }
      this.isLoader = false;
      this.verifySelected("course");
    },
    selectCourse(course, type) {
      this.isError = false;
      const isFound = this.selectedCourses.find(
        selected => selected.id === course.id
      );
      if (!isFound) {
        this.selectedCourses.push(course);
        if (type === "dropdown") {
          this.featuredCourses = this.addSelectedOnStart(
            this.featuredCourses,
            course
          );
        }
      } else if (type !== "dropdown") {
        this.selectedCourses = this.removeItemFromArray(
          this.selectedCourses,
          course,
          "id"
        );
        this.featuredCourses = this.addSelectedOnStart(this.featuredCourses);
      }
      this.closeSearch();
    },
    clearSelectedCourses() {
      this.selectedCourses = [];
    },
    checkIsSelectedCourse(course) {
      const isFound = this.selectedCourses.find(
        selected => selected.id === course.id
      );
      return isFound ? true : false;
    },

    // Modules Step
    async getCoursesModules() {
      this.isLoader = true;
      const courses = this.selectedCourses.map(market => market.id);
      const modules = await PracticeService.getCourseModules({ courses });
      if (modules.success) {
        this.modules = modules.modules;
        this.featuredModules = this.modules;
        this.selectedModules = this.setSelectedFromStorage(
          this.stotrageData.modules,
          this.modules
        );
      }
      this.isLoader = false;
      this.verifySelected("module");
    },
    async checkWrongAttempts() {
      const courseIds = this.selectedCourses.map(market => market.id);
      const res = await PracticeService.checkWrongAttempts({ courseIds });
      if (res.success) {
        this.isWrongAttempts = res.isWrongAttempts;
      }
    },
    selectModule(module, type) {
      this.isError = false;
      const isFound = this.selectedModules.find(
        selected => selected.id === module.id
      );
      if (!isFound) {
        this.selectedModules.push(module);
        if (type === "dropdown") {
          this.featuredModules = this.addSelectedOnStart(
            this.featuredModules,
            module
          );
        }
      } else if (type !== "dropdown") {
        this.selectedModules = this.removeItemFromArray(
          this.selectedModules,
          module,
          "id"
        );
        this.featuredModules = this.addSelectedOnStart(this.featuredModules);
      }
      this.closeSearch();
    },
    clearSelectedModules() {
      this.selectedModules = [];
    },
    checkIsSelectedModule(module) {
      const isFound = this.selectedModules.find(
        selected => selected.id === module.id
      );
      return isFound ? true : false;
    },

    // Topic Step
    async getTopics() {
      this.isLoader = true;
      const courseIds = this.selectedCourses.map(course => course.id);
      const moduleIds = this.selectedModules.map(module => module.id);
      const topics = await PracticeService.getTopics({
        courseIds,
        moduleIds,
        isWrong: this.practiceWeakSteps
      });
      if (topics.success) {
        this.topics = topics.topics;
        this.featuredTopics = this.topics.slice(0, 11);
      }
      this.isLoader = false;
      this.verifySelected("topic");
    },
    selectTopic(topic, type) {
      this.isError = false;
      const isFound = this.selectedTopics.find(
        selected => selected.id === topic.id
      );
      if (!isFound) {
        this.selectedTopics.push(topic);
        if (type === "dropdown") {
          this.featuredTopics = this.addSelectedOnStart(
            this.featuredTopics,
            topic
          );
        }
      } else if (type !== "dropdown") {
        this.selectedTopics = this.removeItemFromArray(
          this.selectedTopics,
          topic,
          "id"
        );
        this.featuredTopics = this.addSelectedOnStart(this.featuredTopics);
      }
      this.closeSearch();
    },
    clearSelectedTopics() {
      this.selectedTopics = [];
    },
    checkIsSelectedTopic(topic) {
      const isFound = this.selectedTopics.find(
        selected => selected.id === topic.id
      );
      return isFound ? true : false;
    },
    findIndex(arr, q) {
      return arr.findIndex(
        item => q.toString().toLowerCase() === item.toString().toLowerCase()
      );
    },
    sortDifficulties(difficulties) {
      const sortOrder = ["easy", "medium", "hard", "difficult"];
      difficulties = difficulties.sort(
        (a, b) =>
          this.findIndex(sortOrder, a.name) - this.findIndex(sortOrder, b.name)
      );
      return difficulties;
    },
    // Difficulty Step
    async getDifficulties() {
      this.isLoader = true;
      const courseIds = this.selectedCourses.map(course => course.id);
      const moduleIds = this.selectedModules.map(module => module.id);
      const topics = this.selectedTopics.map(topic => topic.id);
      const difficulties = await PracticeService.getDifficulties({
        courseIds,
        moduleIds,
        topics,
        isWrong: this.practiceWeakSteps
      });
      if (difficulties.success) {
        this.difficulties = this.sortDifficulties(difficulties.difficulties);
        // this.difficulties = difficulties.difficulties;
        this.selectedDifficulties = this.setSelectedFromStorage(
          this.stotrageData.difficulties,
          this.difficulties
        );
      }
      this.isLoader = false;
      this.verifySelected("difficulty");
    },

    selectDifficulty(difficulty) {
      this.isError = false;
      const isFound = this.selectedDifficulties.find(
        selected => selected.id === difficulty.id
      );
      if (!isFound) {
        this.selectedDifficulties.push(difficulty);
      } else {
        this.selectedDifficulties = this.removeItemFromArray(
          this.selectedDifficulties,
          difficulty,
          "id"
        );
      }
      this.closeSearch();
    },

    checkIsSelectedDifficulty(difficulty) {
      const isFound = this.selectedDifficulties.find(
        selected => selected.id === difficulty.id
      );
      return isFound ? true : false;
    },

    verifySelected(type) {
      switch (type) {
        case "course":
          this.selectedCourses = this.filterSelectedItems(
            this.selectedCourses,
            this.courses
          );
          break;
        case "module":
          this.selectedModules = this.filterSelectedItems(
            this.selectedModules,
            this.modules
          );
          break;
        case "topic":
          this.selectedTopics = this.filterSelectedItems(
            this.selectedTopics,
            this.topics
          );
          break;
        case "difficulty":
          this.selectedDifficulties = this.filterSelectedItems(
            this.selectedDifficulties,
            this.difficulties
          );
          break;
        default:
          return;
      }
    },

    filterSelectedItems(selectedList, fullList) {
      if (fullList.length > 0 && selectedList.length > 0) {
        return selectedList.filter(function(selected) {
          const isFound = fullList.find(item => item.id === selected.id);
          return isFound ? true : false;
        });
      }
      return [];
    },

    getRandomButton(index) {
      index = index + 1;
      if (this.buttonsColor.first.includes(index)) {
        return 1;
      } else if (this.buttonsColor.second.includes(index)) {
        return 2;
      } else {
        return 3;
      }
      // return 2;
    },

    //  eeee
    openStartPractice() {
      this.$router.push("/practices/new");
    },
    openPreviousPractice() {
      this.$router.push("/practices-list");
    },
    backToMainPractice() {
      this.step -= 1;
    },
    closeSearch() {
      setTimeout(() => {
        this.practiceSearchDD = false;
      }, 200);
    },
    openpracticeSearchDD() {
      this.practiceSearchDD = true;
    },
    practiceWeakAttempt() {
      this.readMore = false;
      this.practiceSteps = false;
      this.practiceWeakSteps = true;
      this.getDifficulties();
      this.getTopics();
      this.step = 4;
    },
    practiceLastAttempt() {
      this.readMore = false;
      this.step = 7;
      this.practiceWeakSteps = false;
    },
    randomSelection() {
      if (this.modules.length > 0) {
        const half = this.modules.length / 2;
        const randomArray = this.getRandom(this.modules, Math.ceil(half));
        this.selectedModules = randomArray;
        this.selectedModules.forEach(module => {
          this.featuredModules = this.addSelectedOnStart(
            this.featuredModules,
            module
          );
        });
      }
    },
    getRandom(arr, n) {
      var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
      if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
      while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
      }
      return result;
    },
    questionCountChange() {
      if (this.practiceQuestionCounter > this.maxQuestions) {
        this.practiceQuestionCounter = this.maxQuestions;
      } else if (this.practiceQuestionCounter < 0) {
        this.practiceQuestionCounter = 0;
      }
    },
    async getQuestionsCount() {
      this.isLoader = true;
      const courseIds = [];
      const coursesData = [];
      const moduleIds = [];
      const modulesData = [];
      this.selectedCourses.forEach(course => {
        courseIds.push(course.id);
        coursesData.push({ id: course.id, name: course.name });
      });
      this.selectedModules.forEach(module => {
        moduleIds.push(module.id);
        modulesData.push({ id: module.id, name: module.name });
      });
      const topics = this.selectedTopics.map(topic => topic.id);
      const difficulties = this.selectedDifficulties.map(
        difficulties => difficulties.id
      );
      const res = await PracticeService.createPracticeQuestioncCount({
        courseIds,
        coursesData,
        moduleIds,
        modulesData,
        topics,
        difficulties,
        questionCount: 100,
        isWrong: this.practiceWeakSteps,
        isWrongAnswers:
          !this.practiceWeakSteps && !this.practiceSteps && this.step === 7
      });
      if (res.success) {
        this.maxQuestions = res.questionsCount;
        this.practiceQuestionCounter = res.questionsCount;
      }
      this.isLoader = false;
    },
    async createPracticeQuiz() {
      if (this.practiceQuestionCounter < 1) {
        this.isError = true;
        if (this.isError) toastr.error("Questions count should be at-least 1");
        return;
      }
      this.practiceLoader = true;
      this.practiceSteps = false;
      const courseIds = [];
      const coursesData = [];
      const moduleIds = [];
      const modulesData = [];
      this.selectedCourses.forEach(course => {
        courseIds.push(course.id);
        coursesData.push({ id: course.id, name: course.name });
      });
      this.selectedModules.forEach(module => {
        moduleIds.push(module.id);
        modulesData.push({ id: module.id, name: module.name });
      });
      const topics = this.selectedTopics.map(topic => topic.id);
      const difficulties = this.selectedDifficulties.map(
        difficulties => difficulties.id
      );
      const res = await PracticeService.createPracticeQuiz({
        courseIds,
        coursesData,
        moduleIds,
        modulesData,
        topics,
        difficulties,
        questionCount: this.practiceQuestionCounter,
        isWrong: this.practiceWeakSteps,
        isWrongAnswers:
          !this.practiceWeakSteps && !this.practiceSteps && this.step === 7
      });
      if (res.success) {
        this.setPraticeFromLocalStorage("clean-sotrgae");
        this.$router.push("/quiz/standard-quiz-main/" + res.session._id);
      } else {
        toastr.error(error.response);
      }
      this.practiceLoader = false;
      this.practiceSteps = true;
    },
    prev() {
      this.readMore = false;
      this.isError = false;
      if (this.step == 4) {
        this.practiceWeakSteps = false;
        this.practiceSteps = true;
      }

      // if (this.step == 8) {
      //   this.step = 7;
      //   this.practiceSteps = true;
      // }
      if (this.step == 7) {
        this.step = 4;
        this.practiceSteps = false;
        this.practiceWeakSteps = true;
      } else {
        this.step--;
      }

      console.log("------steps-----------", this.step);
    },
    next() {
      this.readMore = false;
      this.isError = false;
      let isCorrect = true;
      switch (this.step) {
        case 1:
          isCorrect = this.checkError(this.selectedMarkets);
          this.isError = !isCorrect;
          if (isCorrect) this.getTagsCourses();
          break;
        case 2:
          isCorrect = this.checkError(this.selectedCourses);
          this.isError = !isCorrect;
          if (isCorrect) {
            this.getCoursesModules();
            // this.checkWrongAttempts();
          }
          break;
        case 3:
          isCorrect = this.checkError(this.selectedModules);
          this.isError = !isCorrect;
          if (isCorrect) this.getDifficulties();
          break;
        case 4:
          isCorrect = this.checkError(this.selectedDifficulties);
          this.isError = !isCorrect;
          if (this.isError) toastr.error("Please select difficulty levels");
          if (isCorrect) this.getQuestionsCount();
          break;
        case 5:
        case 6:
          this.createPracticeQuiz();
          break;
        default:
      }

      this.setPraticeFromLocalStorage(this.step);

      if (!this.isError && this.step !== 6)
        //6 step condition is to last step
        this.step++;

      console.log("------steps-----------", this.step);
    },
    checkError(list) {
      return list.length > 0;
    },
    direct(s) {
      this.step = s;
    },
    quizPage() {
      console.log("redirection working");
      this.$router.push("/course/course-landing");
    },
    decrement() {
      if (this.practiceQuestionCounter && this.practiceQuestionCounter > 0) {
        this.practiceQuestionCounter = Number(this.practiceQuestionCounter) - 1;
      }
    },
    increment() {
      if (this.practiceQuestionCounter < this.maxQuestions) {
        this.practiceQuestionCounter = Number(this.practiceQuestionCounter) + 1;
      }
    },
    play() {
      this.$refs.myvideo.play();
      this.isPlaying = true;
    },
    stop() {
      this.$refs.myvideo.pause();
      this.isPlaying = false;
    },
    volume() {
      var vid = this.$refs.myvideo;
      this.mute = !this.mute;
      vid.muted = this.mute;
      console.log("vidoeoooo muted", vid.muted);

      if (vid.muted === true) {
        this.muteBtn = true;
        this.unMuteBtn = false;
      }
      if (vid.muted === false) {
        this.unMuteBtn = true;
        this.muteBtn = false;
      }
    }
  },
  watch: {
    $route(to, from) {
      if (to.path === "/practices/new") {
        this.practiceMain = false;
        this.practiceStart = true;
        this.step = 1;
        this.practiceSteps = true;
        this.practiceWeakSteps = false;
        this.practiceLoader = false;
      } else {
        this.practiceMain = true;
        this.practiceStart = false;
        this.step = 1;
        this.practiceSteps = true;
        this.practiceWeakSteps = false;
        this.practiceLoader = false;
      }
    },
    practiceQuestionCounter(to, from) {
      if (Number(from) !== 10 && this.maxQuestions < 10) {
        if (Number(to) > this.maxQuestions) {
          this.practiceQuestionCounter = Number(from);
        } else {
          this.practiceQuestionCounter = Number(to);
        }
      }
    }
  }
};
</script>

<style src="./practice.css" scoped></style>

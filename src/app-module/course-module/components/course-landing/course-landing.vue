<template src="./course-landing.html"></template>
<script>
import courseService from "../../services/course-service";
import appService from "../../../app-services/app-service";
import customStorageService from "../../../app-services/custom-storage-service";
import toastr from "toastr";
import { MultiSelect, ModelSelect } from "vue-search-select";
import ClickOutside from "vue-click-outside";
import _ from "lodash";
import practiceWT from "../../../shared-module/components/practice-tour/practice-tour.vue";
import btnMdcatResult from "../../../shared-module/components/btn-mdcat-result/btn-mdcat-result.vue";

export default {
  name: "app-course-landing",
  components: {
    MultiSelect,
    ModelSelect,
    "practice-tour": practiceWT,
    "btn-mdcat-result": btnMdcatResult
  },
  data: function() {
    return {
      courses: new Set(),
      prevRoute: "",
      courseArr: new Set(),
      avatars: [
        "Courses-Card-Type-1",
        "Courses-Card-Type-2",
        "Courses-Card-Type-3",
        "Courses-Card-Type-4"
      ],
      isPageLoading: true,
      courseService: courseService,
      currentUrl: "",
      currentShareUrl: "",
      walkThrough: false,
      pageNum: 1,
      screenWidth: null,
      user: customStorageService.getUser(),
      parallelRes: [],
      dataFetched: false,
      loadMore: true,
      noCourses: false,
      total_enrolled_courses_count: 0,
      redirect: false,
      listBox: false,
      sortBox: false,
      listBoxR: false,
      currentFrontendUrl: process.env.VUE_APP_REDIRCT_URL,
      courseLink: "",
      searchParams: "",
      isToLoadMore: true,
      options: [],
      tagOptions: [],
      courseSearches: [],
      items: [],
      currentCourseId: undefined,
      currentTagId: undefined,
      purchasedOnly: true,
      lastPurchased: false,
      selectedFilter: true,
      checkRand: 22,
      isFromFilter: false,
      reactApp: false,
      isGuest: false,
      customDescription: "Nearpeer.org",
      selectedTag: {
        value: "",
        text: ""
      },
      selectedCourse: {
        value: "",
        text: ""
      },
      device_id: "",
      // crumbs: ["Home"]
      searchFixed: false,
    };
  },
  directives: {
    ClickOutside
  },
  methods: {
    async initialization() {
      await this.getCoursesList();
      customStorageService.setPageName("courses");
      if (window.innerWidth < 600) {
        this.screenWidth = true;
      }
      this.currentShareUrl =
        process.env.VUE_APP_LMS_HOME + window.location.pathname;
      this.currentUrl =
        "https://velocity.nearpeer.org" + window.location.pathname;
      this.user = customStorageService.getUser();
      if (!this.isFromFilter) {
        if (
          this.user?.user_visits?.visited_course_landing == null ||
          !this.user?.user_visits?.visited_course_landing
        ) {
          this.walkThrough = true;
          try {
            if (this.user?.user_visits === null || !this.user?.user_visits) {
              this.user.user_visits = {
                visited_course_landing: true
              };
            } else {
              this.user.user_visits.visited_course_landing = true;
            }
          } catch (error) {
            console.log(error);
          }
          customStorageService.setUser(this.user);
        }
      }
      this.pageNum = 1;

      this.currentCourseId = undefined;
      (this.currentCourseId = undefined), (this.courses = new Set());
      this.courseArr = new Set();

      await this.getPaginated();

      // await this.onScroll();
      this.isPageLoading = false;
      let obj = {
        uid: this.user.id,
        course_landing_page: true
      };
      await appService.postUserVisited(obj);
    },

    buyCourse() {
      window.location.href =
        this.currentFrontendUrl +
        "/" +
        "landing?uid=" +
        this.user.id +
        "&token" +
        this.user.token;
    },
    closeBox() {
      this.listBox = false;
      this.sortBox = false;
    },
    async clearAll() {
      this.selectedCourse = {
        value: "",
        text: ""
      };
      this.selectedTag = {
        value: "",
        text: ""
      };
      this.lastPurchased = false;
      this.purchasedOnly = false;
      this.isToLoadMore = true;
      this.isFromFilter = false;
      this.currentTagId = undefined;
      this.currentCourseId = undefined;
      this.selectedFilter = true;
      this.initialization();
    },
    async setFilter(filter) {
      this.isFromFilter = true;
      if (filter == 1) {
        this.purchasedOnly = true;
      } else {
        this.purchasedOnly = false;
      }
      this.isToLoadMore = true;
      await this.initialization();
    },
    async sortCourse(filter) {
      this.checkRand = Math.floor(Math.random() * 1001);
      if (filter == 1) {
        this.lastPurchased = true;
      } else {
        this.lastPurchased = false;
        this.selectedFilter = false;
      }
      await this.initialization();
    },
    async onSelect() {
      this.selectedTag = {
        value: "",
        text: ""
      };
      this.isToLoadMore = true;
      this.courses = new Set();
      this.pageNum = 1;
      this.currentTagId = undefined;
      if (this.selectedCourse.value) {
        this.currentCourseId = this.selectedCourse.value;
        await this.processCourses();
        this.isToLoadMore = false;
        this.loadMore = false;
      } else {
        this.currentCourseId = undefined;
        // await this.getPaginated();
        await this.initialization();
        this.isToLoadMore = true;
        this.loadMore = true;
      }

      //  this.courseArr.delete(this.courseArr[0]);

      // this.lastSelectItem = lastSelectItem
    },
    async onSelectTag() {
      this.selectedCourse = {
        value: "",
        text: ""
      };
      this.currentCourseId = undefined;
      this.isToLoadMore = true;
      this.isFromFilter = false;
      this.courses = new Set();
      this.pageNum = 1;
      if (this.selectedTag.value) {
        this.currentTagId = this.selectedTag.value;
        await this.processCourses();
      } else {
        this.selectedTag = undefined;
        await this.initialization();
        this.isToLoadMore = true;
        this.loadMore = true;
      }
    },

    async getCoursesList() {
      this.courseSearches = await courseService.getCoursesList(this.user.id);
      let options = this.courseSearches?.courses?.map(option => {
        return {
          text: option.name,
          value: option.id
        };
      });
      this.options = options;

      if (!this.user.totalEnrolledCourses) {
        this.user.totalEnrolledCourses = this.options.length;
        customStorageService.setUser(this.user);
        this.$store.commit("setTotalEnrolledCoursesCount", {
          totalEnrolledCourses: this.user.totalEnrolledCourses
        });
      }
      if (this.user.user_type === "guest") {
        this.isGuest = true;
      } else {
        this.isGuest = false;
      }

      let tagOptions = this.courseSearches?.tags?.map(option => {
        return {
          text: option.name,
          value: option.id
        };
      });
      this.tagOptions = tagOptions;
      return options;
    },
    getCourseIndex(index_url, course) {
      customStorageService.setCourseIndexUrl(index_url);
      let courseVistedObj = {
        course_id: course.id,
        user: this.user
      };
      courseService.addCourseVisit(courseVistedObj).then(
        visit => {
          return visit;
        },
        err => {
          toastr.error("Oops! It seems service is down.", err);
        }
      );

      mixpanel.track("VL-Course-Page", {
        Course_Name: course.name,
        Course_ID: course.id,
        index_url: course.index_url
      });
    },
    async redirectPage() {
      if (this.courseLink) {
        var link = this.courseLink;
        this.redirect = false;
        window.location.href =
          this.currentFrontendUrl + "/" + link + "?token=" + this.user.token;
      } else if (!this.courseLink) {
        this.redirect = false;
        window.location.href =
          this.currentFrontendUrl + "/courses?token=" + user.token;
      }
    },
    avatar(course) {
      if (!course.image) {
        course.image = this.avatars[Math.floor(Math.random() * 3) + 0];
      }
      return course.image;
    },
    async processCourses() {
      const courseType = this.purchasedOnly;
      const courseSort = this.lastPurchased;
      const courseTag = this.currentTagId;
      const rand = this.checkRand;
      this.parallelRes = await Promise.all([
        courseService.getStudentEnrolledCourses(
          this.user.id,
          this.pageNum,
          this.currentCourseId,
          this.purchasedOnly,
          this.lastPurchased,
          this.currentTagId
        ),
        courseService.getEnrolledCoursesProgress(
          this.user.id,
          this.pageNum,
          this.purchasedOnly,
          this.lastPurchased,
          this.currentCourseId,
          this.currentTagId
        )
      ]);
      if (
        courseType === this.purchasedOnly &&
        courseSort === this.lastPurchased &&
        courseTag === this.currentTagId &&
        rand === this.checkRand
      ) {
        if (this.parallelRes[0].length > 0) {
          let courseRes = this.parallelRes[0];
          let trackRes = this.parallelRes[1];
          this.courseArr = courseRes;
          this.courseArr.forEach(course => {
            let found = Array.isArray((trackRes || {}).enrolledCourses)
              ? trackRes.enrolledCourses.find(
                  element => element.id == course.id
                )
              : undefined;
            if (found) {
              course.courseProgress = found;
            }
          });
          this.courseArr.forEach(obj => {
            let courseFound = false;
            this.courses.forEach(cour => {
              if (cour.id == obj.id) {
                courseFound = true;
              }
            });
            if (!courseFound) {
              this.courses.add(obj);
            }
          });
          this.dataFetched = true;
          this.loadMore = true;
        } else {
          this.loadMore = false;
          this.noCourses = true;
        }
      }
    },
    async getPaginated() {
      if (this.isToLoadMore) {
        await this.processCourses();
      }
    },

    formattedDisplay(result) {
      return result.name + " [" + result.groupId + "]";
    },
    redirection(course) {
      this.redirect = true;
      this.courseLink = course.index_url;
    },
    async onScroll() {
      let vm = this;
      if (this.isToLoadMore) {
        // window.onscroll = async function(ev) {
        if (
          window.innerHeight + window.pageYOffset >=
            document.body.offsetHeight &&
          vm.parallelRes[0].length > 0 &&
          vm.dataFetched
        ) {
          vm.pageNum++;
          vm.dataFetched = false;
          await vm.getPaginated();
        } else {
          vm.loadMore = false;
        }
        // };
      }
    },
    // selected(crumb) {
    //   console.log(crumb);
    // }
    async getUserStats() {
      console.log("user gender", this.user);
      this.UserStats = await courseService.getUserStats();
      this.UserWatchedTime = await courseService.getUserWatchedTime(
        this.user.id
      );
      if(this.UserStats.stats.paid < 1) {
        this.setFilter(0);
      }
      mixpanel.reset();
      mixpanel.register({
        User_Name: this.user.name ? this.user.name : null,
        User_ID: this.user.id ? this.user.id : null,
        User_City: this.user.city ? this.user.city : null,
        User_Email: this.user.email ? this.user.email : null,
        User_Mobile: this.user.uid_phone ? this.user.uid_phone : null,
        User_Gender: this.user.gender ? this.user.gender : null,
        Order_Paid: this.UserStats.stats.paid > 0 ? "YES" : "NO",
        Order_Outdated: this.UserStats.stats["out dated"] > 0 ? "YES" : "NO",
        Order_Amount_Total: this.UserStats.stats.total_amount
          ? this.UserStats.stats.total_amount
          : 0,
        Promo_Paid: this.UserStats.stats.coupon_active > 0 ? "YES" : "NO",
        Promo_Outdated: this.UserStats.stats.coupon_outdated > 0 ? "YES" : "NO",
        Watch_Cumulative: this.UserWatchedTime.watchedTime
          ? parseInt(this.UserWatchedTime.watchedTime)
          : 0
      });
      mixpanel.track("VL-Course-Landing");
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {});
  },
  afterRouteEnter(to, from, next) {
    window.scroll(0, 0);
  },
  watch: {
    selectedCourse: function(newv, old) {
      if (newv.value) {
        this.onSelect();
      }
    },
    selectedTag: function(newv, old) {
      if (newv.value) {
        this.onSelectTag();
      }
    },
    async handleEvent(message) {
      ///DONOT CHANGE STATES IN THIS FUNCTION
      if (this.reactApp) {
        console.log("LANDING LMS DATA");
        console.log(message.data.message);
        if (message.data.message.includes("device_id")) {
          var token = message.data.message.split("device_id");
          this.device_id = token[1];
          customStorageService.setDeviceId(this.device_id);
        }
      }
    }
  },
  async mounted() {
    this.getUserStats();
    this.isPageLoading = true;
    let userAgent = navigator.userAgent;
    if (userAgent.includes("React-Native-NP")) {
      this.reactApp = true;
      console.log("onCourseLanding");
    }
    await this.initialization();
  },
  destroyed() {
    if (this.reactApp) {
      console.log("exitCourseLanding");
    }
  },
  async created() {
    var listener = document.addEventListener("message", this.handleEvent); ///DONOT REMOVE THIS

    if (this.reactApp) {
      console.log("IN LANDINGGGG EVENT", listener);
      console.log(listener); ///DONOT REMOVE THIS CONSOLE
      this.handleEvent(listener); ///DONOT REMOVE THIS
      document.addEventListener("scroll", function(e) {
        let lastKnownScrollPosition = window.scrollY;
        let ticking;
        if (!ticking) {
          window.requestAnimationFrame(function() {
            console.log(lastKnownScrollPosition, "last scroll");
            if (lastKnownScrollPosition == 0) {
              console.log("scrollTop" + lastKnownScrollPosition);
            }
            ticking = false;
          });

          ticking = true;
        }
      });
    }
    let PaidStatus = await appService.checkUserPaidStatus("landing");
    if (!PaidStatus.isPaidUser) {
      this.setFilter(0);
    }

    const mediaQuery = window.matchMedia('(min-width: 1320px)')
    if (mediaQuery.matches) {
      window.addEventListener("scroll", function() {
        if (window.scrollY >= 30) {
          if (this.document.getElementById("courseSearchFixed")) {
            this.document
              .getElementById("courseSearchFixed")
              .classList.add("courseSearchFixed");
          }
        }
        else {
          this.searchFixed = false;
          if (this.document.getElementById("courseSearchFixed")) {
            this.document
              .getElementById("courseSearchFixed")
              .classList.remove("courseSearchFixed");
          }
        }
      });
    }
  }
};
</script>

<style src="./course-landing.css" scoped></style>

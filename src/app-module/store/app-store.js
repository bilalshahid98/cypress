import Vue from "vue";
import Vuex from "vuex";
import VueSocialSharing from "vue-social-sharing";
import VueInstagram from "vue-instagram";
import customStorageService from "../app-services/custom-storage-service";

Vue.use(Vuex);
Vue.use(VueSocialSharing);
Vue.use(VueInstagram);

import courseStore from "./../course-module/course-state";

const store = new Vuex.Store({
  modules: {
    courseModule: courseStore
  },
  state: () => ({
    customForms: [],
    showCustomForm: false,
    isNewReactNative: false,
    errorCode: {},
    notesIOSFullscreen: false,
    tooManyReqError: false,
    isPaidVideo: false,
    isAllowWebServing: false,
    showSecurityError: false,
    currentPage: "",
    npExtensionFound: "PENDING",
    unauthorizedBrowser: false,
    devToolOpened: false,
    unauthExtensionFound: false,
    mdcatScoreUser: {},
    mdcatScore: 0,
    mdcatPosition: 0,
    mdcatPositionUsers: [],
    mdcatScoreLink: "",
    mdcatScoreImageGenerated: false,
    currentUid: customStorageService.getUid(),
    totalEnrolledCourses: customStorageService.getUser()
      ? customStorageService.getUser().totalEnrolledCourses
      : 0
  }),
  getters: {
    getUid() {
      return state.currentUid;
    },
    getTotalEnrolledCoursesCount: state => {
      return state.totalEnrolledCourses;
    }
  },
  mutations: {
    setCustomForms(state, payload) {
      state.customForms = payload;
    },
    setShowCustomForms(state, payload) {
      state.showCustomForm = payload;
    },
    setNewReactNative(state, payload) {
      state.isNewReactNative = payload;
    },
    setNotesIOSFullscreen(state, payload) {
      state.notesIOSFullscreen = payload;
    },
    setErrorCode(state, payload) {
      state.errorCode = payload;
    },
    setTooManyReqError(state, payload) {
      state.tooManyReqError = payload;
    },
    setMdcatScore(state, payload) {
      state.mdcatScore = payload.score.toFixed(0);
      state.mdcatPosition = payload.position;
      state.mdcatPositionUsers = payload.usersPositions;
      state.mdcatScoreUser = payload.user;
    },
    setMdcatScoreLink(state, payload) {
      state.mdcatScoreLink = payload.link;
    },
    setMdcatScoreImageGenerated(state, payload) {
      state.mdcatScoreImageGenerated = payload;
    },
    setUid(state, payload) {
      state.currentUid = payload.uid;
    },
    setTotalEnrolledCoursesCount(state, payload) {
      state.totalEnrolledCourses = payload.totalEnrolledCourses;
    },
    setIsPaidVideo(state, payload) {
      state.isPaidVideo = payload;
      this.commit("setShowSecurityError", {});
    },
    setAllowWebServing(state, payload) {
      state.isAllowWebServing = payload;
      this.commit("setShowSecurityError", {});
    },
    setNpExtensionFound(state, payload) {
      state.npExtensionFound = payload;
      this.commit("setShowSecurityError", {});
    },
    setUnauthorizedBrowser(state, payload) {
      state.unauthorizedBrowser = payload;
      this.commit("setShowSecurityError", {});
    },
    setDevToolOpened(state, payload) {
      state.devToolOpened = payload;
      this.commit("setShowSecurityError", {});
    },
    setUnauthExtensionFound(state, payload) {
      state.unauthExtensionFound = payload;
      this.commit("setShowSecurityError", {});
    },
    setCurrentPage(state, payload) {
      state.currentPage = payload;
      state.isPaidVideo = false;
      this.commit("setShowSecurityError", {});
    },
    setShowSecurityError(state, payload) {
      if (
        state.currentPage === "app-video-main" &&
        (state.devToolOpened ||
          state.unauthorizedBrowser ||
          (state.isAllowWebServing &&
            state.npExtensionFound === "NOT_INSTALLED" &&
            state.isPaidVideo) ||
          (state.isAllowWebServing &&
            state.unauthExtensionFound &&
            state.isPaidVideo))
      ) {
        state.showSecurityError = true;
      } else {
        state.showSecurityError = false;
      }
    }
  },
  actions: {}
});

store.state.courseModule;

export default store;

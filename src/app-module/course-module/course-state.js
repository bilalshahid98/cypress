const courseStore = {
  state: () => ({
    selectedModule: {},
    selectedChapter: {},
    videoArr: [],
    chapterArr: [],
    isTyping: true
  }),
  getters: {
    getSelectedModule: state => {
      return state.selectedModule;
    },
    getSelectedChapter: state => {
      return state.selectedChapter;
    },
    getVideos: state => {
      return state.videoArr;
    },
    getChapters: state => {
      return state.chapterArr;
    },
    checkIfTyping: state => {
      return state.isTyping;
    }
  },
  mutations: {
    setCurrentModule(state, payload) {
      state.selectedModule = payload;
    },
    setCurrentChapter(state, payload) {
      state.selectedChapter = payload;
    },
    setVideoList(state, payload) {
      state.videoArr = payload;
    },
    setChapterList(state, payload) {
      state.chapterArr = payload;
    },
    setTyping(state, payload) {
      state.isTyping = payload;
    }
  },
  actions: {},
  modules: {}
};

export default courseStore;

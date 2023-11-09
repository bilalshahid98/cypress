const quizStore = {
  state: () => ({
    selectedModule: {},
    selectedChapter: {},
    videoArr: [],
    chapterArr: []
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
    }
  },
  actions: {},
  modules: {}
};

export default quizStore;

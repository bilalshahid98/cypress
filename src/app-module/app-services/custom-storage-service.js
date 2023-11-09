class CustomStorageService {
  set(id, data) {
    data = JSON.stringify(data);
    window.localStorage.setItem(id, data);
  }
  get(id) {
    var data = window.localStorage.getItem(id);
    if (data === "true") {
      return true;
    } else if (data === "false") {
      return false;
    } else {
      data = JSON.parse(data);
      return data;
    }
  }
  setCourseIndexUrl(indexUrl) {
    localStorage.removeItem("indexUrl");
    localStorage.setItem("indexUrl", JSON.stringify(indexUrl));
  }
  setUser(user) {
    localStorage.removeItem("user");
    localStorage.setItem("user", JSON.stringify(user));
  }
  setBrowserId(browser_id) {
    let app = localStorage.getItem("browser_id");
    if(!app) {
      localStorage.removeItem("browser_id");
      localStorage.setItem("browser_id", browser_id);
    }
  }
  getBrowserId() {
    let app = localStorage.getItem("browser_id");
    return app;
  }
  setVideoDownloading(user) {
    localStorage.removeItem("downloadingVideos");
    localStorage.setItem("downloadingVideos", JSON.stringify(user));
  }
  removeUser() {
    localStorage.removeItem("user");
  }
  removeUid() {
    localStorage.removeItem("uid");
  }
  removeVideoDownloading() {
    localStorage.removeItem("downloadingVideos");
  }
  setUid(uid) {
    localStorage.removeItem("uid");
    if (uid) {
      localStorage.setItem("uid", JSON.stringify(uid));
    }
  }
  setDeviceId(id) {
    localStorage.removeItem("device_id");
    if (id) {
      localStorage.setItem("device_id", JSON.stringify(id));
    }
  }

  getDeviceId() {
    let device_id = JSON.parse(localStorage.getItem("device_id"));
    return device_id;
  }
  setApp(app) {
    if (app) {
      localStorage.setItem("app", JSON.stringify(app));
    }
  }
  getApp() {
    let app = JSON.parse(localStorage.getItem("app"));
    return app;
  }
  getUid() {
    let uid = JSON.parse(localStorage.getItem("uid"));
    return uid;
  }
  setPageName(pageName) {
    localStorage.removeItem("pageName");
    if (pageName) {
      localStorage.setItem("pageName", JSON.stringify(pageName));
    }
  }
  getPageName() {
    let pageName = JSON.parse(localStorage.getItem("pageName"));
    return pageName;
  }
  getUser() {
    let user = localStorage.getItem("user");
    if (user && user !== "undefined") {
      return JSON.parse(user);
    } else {
      return null;
    }
  }
  setBreadcrumbFlag(flag) {
    localStorage.setItem("crumbFlag", flag);
  }
  getBreadcrumbFlag() {
    const flag = localStorage.getItem("crumbFlag");

    return flag;
  }

  getVideoDownloading() {
    let data = localStorage.getItem("downloadingVideos");

    return JSON.parse(data);
  }
  getCourseIndexUrl() {
    let indexUrl = JSON.parse(localStorage.getItem("indexUrl"));
    return indexUrl;
  }

  setPracticePopUpFirstTime(val) {
    localStorage.setItem("PracticePopUpFirstTime", JSON.stringify(val));
  }

  getPracticePopUpFirstTime() {
    let data = localStorage.getItem("PracticePopUpFirstTime");

    return data;
  }

  setPracticeData(val) {
    localStorage.setItem("PracticeData", JSON.stringify(val));
  }

  getPracticeData() {
    let data = localStorage.getItem("PracticeData");
    if (data && data !== "undefined") {
      return JSON.parse(data);
    } else {
      return {
        markets: [],
        courses: [],
        modules: [],
        difficulties: []
      };
    }
  }
}
export default new CustomStorageService();

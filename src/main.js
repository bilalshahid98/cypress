import Vue from "vue";
import App from "./app-module/App.vue";
import "./registerServiceWorker";
import router from "./app-module/router/app-routes";
import store from "./app-module/store/app-store";
import {
  mainBackend as api,
  lmsBackend,
  quizBackendService
} from "./environment/environment";
import authAxious from "./environment/auth-axios";
import trackingAxious from "./environment/tracking-axios";
import toastr from "toastr";
import VueToastr from "vue-toastr";
import customStorageService from "./../src/app-module/app-services/custom-storage-service";
import VueTour from "vue-tour";
import ScrollLoader from "vue-scroll-loader";
import "./../src/styles/vue-search-select.css";
import "./registerServiceWorker";
var moment = require("moment");
import Vue2TouchEvents from "vue2-touch-events";

Vue.use(Vue2TouchEvents);

Vue.use(ScrollLoader);
require("./styles/vue-tour.css");

Vue.use(VueTour);

Vue.use(VueToastr, {
  /* OverWrite Plugin Options if you need */
});

Vue.filter("formatDate", function(value) {
  if (value) {
    return moment(String(value)).format("MM/DD/YYYY hh:mm");
  }
});

Vue.config.productionTip = false;

Vue.prototype.$http = api;
Vue.prototype.$http = lmsBackend;
// api.defaults.timeout = 30000;
authAxious.interceptors.request.use(
  config => {
    const token = customStorageService.getUser();
    if (token) {
      config.headers.common["Authorization"] = JSON.parse(
        localStorage.getItem("user")
      ).token;
      config.headers.common["uid"] = token.id;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
trackingAxious.interceptors.request.use(
  config => {
    const token = customStorageService.getUser();
    if (token) {
      config.headers.common["Authorization"] = JSON.parse(
        localStorage.getItem("user")
      ).token;
      config.headers.common["uid"] = token.id;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
quizBackendService.interceptors.request.use(
  config => {
    const token = customStorageService.getUser();
    if (token) {
      config.headers.common["Authorization"] = JSON.parse(
        localStorage.getItem("user")
      ).token;
      config.headers.common["uid"] = token.id;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
authAxious.interceptors.request.use(
  config => {
    const token = customStorageService.getUser();
    if (token) {
      config.headers.common["Authorization"] = JSON.parse(
        localStorage.getItem("user")
      ).token;
      config.headers.common["uid"] = token.id;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
api.interceptors.request.use(
  config => {
    const token = customStorageService.getUser();
    if (token) {
      config.headers.common["Authorization"] = JSON.parse(
        localStorage.getItem("user")
      ).token;
      config.headers.common["uid"] = token.id;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
lmsBackend.interceptors.request.use(
  config => {
    const token = customStorageService.getUser();
    if (token) {
      config.headers.common["Authorization"] = JSON.parse(
        localStorage.getItem("user")
      ).token;
      config.headers.common["uid"] = token.id;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  response => {
    return Promise.resolve(response);
  },
  error => {
    if (((error || {}).response || {}).status) {
      switch (((error || {}).response || {}).status) {
        case ((error || {}).response || {}).status >= 400 &&
          ((error || {}).response || {}).status <= 451:
          toastr.error(error.response);
          break;
        case ((error || {}).response || {}).status >= 500 &&
          ((error || {}).response || {}).status <= 511:
          toastr.error("Oops! Something went wrong!");
          break;
      }
      return Promise.reject(error.response);
    } else {
      toastr.error(error);
    }
  }
);
authAxious.interceptors.response.use(
  response => {
    return Promise.resolve(response);
  },
  error => {
    if (((error || {}).response || {}).status) {
      switch (((error || {}).response || {}).status) {
        case ((error || {}).response || {}).status >= 400 &&
          ((error || {}).response || {}).status <= 451:
          toastr.error(error.response);
          break;
        case ((error || {}).response || {}).status >= 500 &&
          ((error || {}).response || {}).status <= 511:
          toastr.error("Oops! Something went wrong!");
          break;
      }
      return Promise.reject(error.response);
    } else {
      toastr.error(error);
    }
  }
);
trackingAxious.interceptors.response.use(
  response => {
    return Promise.resolve(response);
  },
  error => {
    if (((error || {}).response || {}).status) {
      switch (((error || {}).response || {}).status) {
        case ((error || {}).response || {}).status >= 400 &&
          ((error || {}).response || {}).status <= 451:
          break;
        case ((error || {}).response || {}).status >= 500 &&
          ((error || {}).response || {}).status <= 511:
          break;
      }
      return Promise.reject(error.response);
    }
  }
);

lmsBackend.interceptors.response.use(
  response => {
    return Promise.resolve(response);
  },
  error => {
    if (((error || {}).response || {}).status) {
      switch (((error || {}).response || {}).status) {
        case 429:
          store.commit(
            "setErrorCode",
            (((error || {}).response || {}).data || {}).error
          );
          store.commit("setTooManyReqError", true);
          break;
        case ((error || {}).response || {}).status >= 400 &&
          ((error || {}).response || {}).status <= 451:
          toastr.error(error.response);
          break;
        case ((error || {}).response || {}).status >= 500 &&
          ((error || {}).response || {}).status <= 511:
          toastr.error("Oops! Something went wrong!");
          break;
      }
      return Promise.reject(error.response);
    } else {
      toastr.error(error);
    }
  }
);

export const eventBus = new Vue(); // creating an event bus.

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");

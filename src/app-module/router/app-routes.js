import Vue from "vue";
import VueRouter from "vue-router";
import authService from "../app-services/auth-service";
import storageService from "../app-services/custom-storage-service";
import {
  AppPageNotFound,
  UnAuthorizedPage
} from "../shared-module/components/";
import { courseRoutes } from "../course-module/components";
import LiveChatInstructor from "./../app-live-chat-instructor/app-live-chat-instructor";
import LiveChatUnregistered from "./../app-live-chat-unregistered/app-live-chat-unregistered";
import LiveChat from "./../app-live-chat/app-live-chat";
import { quizRoutes } from "../quiz-module/components";
import $ from "jquery";
// import AppWelcomePage from "./../app-welcome/app-welcome";
// import AppLoginPage from "./../app-login-page/login-page";
// import AppResetPage from "./../app-reset-password/reset-password";
// import AppScheduler from "./../app-schedule/schedule";
// import AppAssignments from "./../app-assignments/assignments";
import AppPractices from "./../app-practices/practice";
import AppPracticesList from "./../app-practices/practice-list/practice-list";
import AppScorePredictor from "./../app-score-predictor/score-predictor";
import AppLivesession from "./../app-livesession/livesession";
import AppLivesessionDetail from "./../app-livesession-detail/livesession-detail";
import AppNotification from "./../app-notification/notification";
import AppSingleNotification from "./../app-notification-single/singleNotification";
Vue.use(VueRouter);
let isVideoJsLoaded = false;
async function guard(to, from, next) {
  let loggedIn = storageService.getUser();
  if (loggedIn) {
    next(); // allow to enter route
  } else {
    next("/login"); // go to '/login';
  }
}

function loadjscssfile(filename) {
  var fileref = document.createElement("script");
  fileref.setAttribute("type", "text/javascript");
  fileref.setAttribute("src", filename);
  if (typeof fileref != "undefined")
    document.getElementsByTagName("head")[0].appendChild(fileref);
}

const appRoutes = [
  {
    path: "",
    redirect: { name: "landing" }
  },
  {
    path: "/landing",
    name: "landing",
    component: () =>
      import(/* webpackChunkName: "course" */ "./../app-welcome/app-welcome"),
    meta: { title: "Landing-Page" }
  },
  {
    path: "/login",
    name: "AppLoginPage",
    component: () =>
      import(/* webpackChunkName: "course" */ "./../app-login-page/login-page"),
    meta: { title: "Login-Page" }
  },
  {
    path: "/resetPassword/:email/:token",
    name: "AppResetPage",
    component: () =>
      import(
        /* webpackChunkName: "course" */ "./../app-reset-password/reset-password"
      ),
    meta: { title: "App-Reset-Password-Page" }
  },
  {
    path: "/confirmAccount/:email/:token",
    name: "AppConfirmPage",
    component: () =>
      import(
        /* webpackChunkName: "course" */ "./../app-reset-password/reset-password"
      ),
    meta: { title: "App-Confirm-Account-Page" }
  },
  {
    path: "/schedule",
    name: "AppSchedule",
    component: () =>
      import(/* webpackChunkName: "course" */ "./../app-schedule/schedule"),
    meta: { title: "Course-Schedule" }
  },
  {
    path: "/assignments",
    name: "AppAssignments",
    component: AppNotification,
    meta: { title: "Assignment-Notification" }
  },
  {
    path: "/live-chat/instructor/:session_id/:meta",
    name: "liveChatInstructor",
    component: LiveChatInstructor,
    meta: { title: "live-chat-instructor" }
  },
  {
    path: "/live-chat/unregistered/:session_id",
    name: "liveChatUnregistered",
    component: LiveChatUnregistered,
    meta: { title: "live-chat-unregistered" }
  },
  {
    path: "/live-chat/:session_id",
    name: "liveChat",
    component: LiveChat,
    meta: { title: "live-chat" }
  },
  {
    path: "/practices",
    name: "AppPractices",
    component: AppPractices,
    meta: { title: "Course-Practices" }
  },
  {
    path: "/live-session",
    name: "AppLivesession",
    component: AppLivesession,
    meta: { title: "Course-Livesession" }
  },
  {
    path: "/live-session/:session_id",
    name: "AppLivesessionDetail",
    component: AppLivesessionDetail,
    meta: { title: "Course-Livesession-detail" }
  },
  {
    path: "/practices/:state",
    name: "AppPracticesNew",
    component: AppPractices,
    meta: { title: "Course-Practices" }
  },
  {
    path: "/practices-list",
    name: "AppPracticesList",
    component: AppPracticesList,
    meta: { title: "Practices List" }
  },
  {
    path: "/score-predictor",
    name: "AppScorePredictor",
    component: AppScorePredictor
  },
  {
    path: "/notifications",
    name: "AppNotification",
    component: AppNotification,
    meta: { title: "Course-Notification" }
  },
  {
    path: "/single-notification",
    name: "AppSingleNotification",
    component: AppSingleNotification,
    meta: { title: "Course-Single-Notification" }
  },
  {
    path: "/course",
    name: "app-course",
    beforeEnter: guard,
    component: () =>
      import(/* webpackChunkName: "course" */ "../course-module/course.vue")
  },
  {
    path: "/quiz",
    name: "app-quiz",
    beforeEnter: guard,
    component: () =>
      import(/* webpackChunkName: "course" */ "../quiz-module/quiz.vue")
  },
  {
    path: "/page-not-found",
    name: "page-not-found",
    component: AppPageNotFound
  },
  {
    path: "/unauthorized-page",
    name: "unauthorized-page",
    component: UnAuthorizedPage
  },
  {
    path: "*",
    name: "page-not-found",
    component: AppPageNotFound
  }
];
const routes = [...courseRoutes, ...quizRoutes, ...appRoutes];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

function getScript(arr, i) {
  i = i || 0;
  $.getScript(arr[i], function() {
    i++;
    arr.length > i && getScript(arr, i);
  });
}

function loadCSS(href) {
  var cssLink = $("<link>");
  $("head").append(cssLink); //IE hack: append before setting href

  cssLink.attr({
    rel: "stylesheet",
    type: "text/css",
    href: href
  });
}

router.beforeEach(async (to, from, next) => {
  let toPath = to;
  gtag("set", "page_path", toPath.path);
  gtag("event", "page_view");
  // $.getScript("https://www.googleoptimize.com/optimize.js?id=GTM-NHZH63N");
  // Logs for React Native APP
  if (
    !isVideoJsLoaded &&
    toPath.path !== "/landing" &&
    toPath.path !== "/login" &&
    toPath.path !== "/course/course-landing"
  ) {
    isVideoJsLoaded = true;
    loadCSS("https://vjs.zencdn.net/7.8.3/video-js.css");
    loadCSS("../../../../../../mathquill-0.10.1/mathquill.css");
    loadCSS(
      "https://cdnjs.cloudflare.com/ajax/libs/videojs-markers/0.7.0/videojs.markers.min.css"
    );
    loadCSS(
      "https://unpkg.com/videojs-max-quality-selector/dist/videojs-max-quality-selector.css"
    );
    loadCSS(
      "https://cdn.jsdelivr.net/npm/videojs-seek-buttons/dist/videojs-seek-buttons.css"
    );
    loadCSS(
      "https://cdn.jsdelivr.net/npm/videojs-hls-quality-selector@1.1.1/dist/videojs-hls-quality-selector.css"
    );

    $.getScript("../../../../../../mathquill-0.10.1/mathquill.js");
    getScript([
      "https://cdn.jsdelivr.net/npm/videojs-seek-buttons/dist/videojs-seek-buttons.min.js",
      "https://cdn.jsdelivr.net/npm/videojs-hls-quality-selector@1.1.1/dist/videojs-hls-quality-selector.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/videojs-contrib-quality-levels/2.0.8/videojs-contrib-quality-levels.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/videojs-markers/0.7.0/videojs-markers.min.js"
    ]);
  }
  if (toPath.path === "/landing" || toPath.path === "/course/course-landing") {
    console.log("initial-lms-screen");
  } else {
    console.log("initial-lms-screen-change");
  }
  const paramKeys = Object.keys(to.params);
  if (paramKeys && paramKeys.length > 0) {
    toPath = toPath.path.split("/");
    paramKeys.forEach(key => {
      toPath = toPath.map(path => {
        if (path == to.params[key]) {
          return ":" + key;
        }
        return path;
      });
    });
    toPath = toPath.join("/");
  } else {
    toPath = toPath.path;
  }
  next();
  try {
    let user = await storageService.getUser();
    if (user) {
      const res = await authService.authenticate({
        path: toPath,
        user_id: user.id
      });
      if (res && res.status === 401) {
        // next("unauthorized-page");
        next();
        if (
          res.data.code !== "EXCEPTION" &&
          res.data.code !== "ROUTE_NOT_FOUND"
        ) {
          storageService.removeUser();
          storageService.removeUid();
          next("/login");
        }
      }
    }
  } catch (error) {
    // next("unauthorized-page");
    next();
    // storageService.removeUser();
    // storageService.removeUid();
    /// next("/login");
  }
});

export default router;

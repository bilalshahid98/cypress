import AppCourse from "./course.vue";
import customStorageService from "../app-services/custom-storage-service";
import CourseDetail from "./components/course-detail/course-detail.vue";
import CourseLanding from "./components/course-landing/course-landing.vue";
import CourseVideo from "./components/video-main/video-main.vue";

function authGuard(to, from, next) {
  if (customStorageService.getUser()) {
    next();
  } else {
    next("/login");
  }
}

const courseRoutes = [
  {
    path: "/course/video-player/:courseId/:moduleId/:videoId",
    name: "app-video-player",
    component: () =>
      import(
        /* webpackChunkName: ":moduleIndexUrl/:moduleNo/:videoId" */ "./components/video-player/video-player.vue"
      )
  },
  {
    path: "/course",
    component: AppCourse,
    beforeEnter: authGuard,
    children: [
      {
        path: "course-landing",
        name: "app-course-landing",
        component: CourseLanding,
      },
      {
        path: "course-detail/:faculty/:facultyDetails/:course/:course_id",
        name: "app-course-detail",
        component: CourseDetail,
      },
      {
        path: ":moduleIndexUrl/:moduleNo/:videoId",
        name: "app-video-main",
        component: CourseVideo,
      },
      // {
      //   path: "standard-quiz",
      //   name: "app-standard-quiz",
      //   component: () =>
      //     import(
      //       /* webpackChunkName: "standard-quiz" */ "./components/standard-quiz/standard-quiz"
      //     ),
      // },
      {
        path: "",
        redirect: { name: "app-course-landing" }
      }
    ]
  }
];

export default courseRoutes;

import AppQuiz from "./quiz.vue";
import customStorageService from "../app-services/custom-storage-service";
import QuizMain from "./components/standard-quiz-main/standard-quiz-main";

function authGuard(to, from, next) {
  if (customStorageService.getUser()) {
    next();
  } else {
    next("/page-not-found");
  }
}

const quizRoutes = [
  {
    path: "/quiz",
    component: AppQuiz,
    // beforeEnter: authGuard,
    children: [
      {
        path: "standard-quiz-main/:id",
        name: "app-standard-quiz-main",
        component: QuizMain
      },
      {
        path: "standard-quiz-results/:id",
        props: true,
        name: "app-standard-quiz-results",
        component: () =>
          import(
            /* webpackChunkName: "standard-quiz" */ "./components/standard-quiz-results/standard-quiz-results"
          )
      },
      {
        path: "",
        redirect: { name: "app-standard-quiz-main" }
      }
    ]
  },
  {
    path: "/quiz/standard-quiz",
    props: true,
    name: "app-standard-quiz",
    component: () =>
      import(
        /* webpackChunkName: "standard-quiz" */ "./components/standard-quiz/standard-quiz"
      )
  },
  {
    path: "/quiz/result-position/:id",
    props: true,
    name: "app-standard-quiz-result-position",
    component: () =>
      import(
        /* webpackChunkName: "standard-quiz" */ "./components/user-position/userPosition.vue"
      )
  },
  {
    path: "/quiz/certificate/:id",
    props: true,
    name: "app-standard-quiz-result-certificate",
    component: () =>
      import(
        /* webpackChunkName: "standard-quiz" */ "./components/certificate/certificate.vue"
      )
  }
];

export default quizRoutes;

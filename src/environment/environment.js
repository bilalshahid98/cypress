const axios = require("axios");

export const quizBackendService = axios.create({
  baseURL: process.env.VUE_APP_QUIZ_SERVICE_URL
});

export const mainBackend = axios.create({
  baseURL: process.env.VUE_APP_BACKEND_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

export const lmsBackend = axios.create({
  baseURL: process.env.VUE_APP_BACKEND_LMS_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

export const notificationBackend = axios.create({
  baseURL: process.env.VUE_APP_BACKEND_NOTIFICATION_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

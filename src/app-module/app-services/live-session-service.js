import {
  mainBackend,
  lmsBackend,
  quizBackendService
} from "../../environment/environment";
import trackingAxios from "../../environment/tracking-axios";
import customStorageService from "./custom-storage-service";

const width = window.screen.width * window.devicePixelRatio;
const height = window.screen.height * window.devicePixelRatio;

const dimensions = {
  width,
  height,
  dimensions: height + "x" + width
};

class LiveSessionService {
  checkUserVisited(uid) {
    const axios = require("axios");
    let baseURL = process.env.VUE_APP_BACKEND_LMS_BASE_URL;
    return axios
      .get(baseURL + "/user/check-user-visited-lms?uid=" + uid)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  postUserVisited(obj) {
    return lmsBackend
      .post("user/post-user-visited-lms", obj)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  addFeedback(obj) {
    return lmsBackend
      .post("feedback/create", obj)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  appleLogin(obj) {
    obj.dimensions = dimensions;
    return lmsBackend
      .post("auth/app-apple-login", obj)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  googleLogin(obj) {
    obj.dimensions = dimensions;
    return lmsBackend
      .post("auth/google-login", obj)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  facebookLogin(obj) {
    obj.dimensions = dimensions;
    return lmsBackend
      .post("auth/lms-facebook-login", obj)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  changeUserImg(obj) {
    return lmsBackend
      .post("users/change-user-pic", obj)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  saveSuspiciousUser(obj) {
    return mainBackend
      .post("suspicious-user/send-request", obj)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  getEmailAccounts(obj) {
    return mainBackend
      .post("user/get-accounts-with-email", obj)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  mergeAccounts(obj) {
    return mainBackend
      .post("user/merge-accounts", obj)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  checkVerification(user_id) {
    return lmsBackend
      .get("user/check-verification-status/" + user_id, {})
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  postUserVisitTracking(obj) {
    let user = customStorageService.getUser();
    const data = {
      websiteName: "velocity-portal",
      websiteEvent: "N/A",
      userEmail: user?.email,
      userContactNo: user?.phone,
      userId: user?.id
    };
    if (user) {
      data.userContactNo = user.phone || "N/A";
      data.userId = user.id || "N/A";
      data.userEmail = user.email
        ? user.email
        : user.fb_email
        ? user.fb_email
        : user.apple_email
        ? ser.apple_email
        : "N/A";
    } else {
      data.userContactNo = "N/A";
      data.userEmail = "N/A";
      data.userId = "N/A";
    }
    return trackingAxios
      .post("/v1/websites-tracking/save-websites-stats", data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  postVideoView(video_id) {
    let user = customStorageService.getUser();
    const data = {
      video_id: video_id
    };
    if (user) {
      data.user = {
        id: user.id,
        phone: user.uid_phone || user.phone,
        email: user.email || user.fb_email || user.apple_email
      };
    }
    return trackingAxios
      .post("/v1/video-tracking/save-viewed-video", data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  eraseCookie(name) {
    document.cookie =
      name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  }

  getBrowserId() {
    return (
      Math.random()
        .toString(36)
        .substring(2, 15) +
      Math.random()
        .toString(36)
        .substring(2, 15)
    );
  }

  checkUserPaidStatus(page = "video") {
    return lmsBackend
      .get("user/check-user-paid-status?page=" + page, {})
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  getCustomForms() {
    return lmsBackend
      .get("custom-form/get-custom-form-user", {})
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  saveCustomFormsData(data) {
    return mainBackend
      .post("custom-form/submit-data", data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  saveRecommendation(data) {
    return lmsBackend
      .post("user/add-recommendation", data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  getUserScore(user_id) {
    let uid = user_id ? `?user_id=${user_id}` : "";
    return quizBackendService
      .get("result/get-user-score" + uid)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  getUserScoreLink(user_id) {
    let uid = user_id ? `?user_id=${user_id}` : "";
    return lmsBackend
      .get("/user/get-create-score-link" + uid)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  getLastVideoData() {
    let user = customStorageService.getUser();
    return trackingAxios
      .get(`/v1/tracking/get-last-video/${user.id}`, {})
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  getFilteredUpComingSessions(filter, include = [], page = 1, limit = 10) {
    let url = "/live-session/upcoming";
    if(include.length) url += `?with=${include.join(',')}&page=${page}&limit=${limit}`
    else url += `?page=${page}&limit=${limit}`
    return lmsBackend
      .post(url, { filter })
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  getUpComingSessions(include = [], page = 1, limit = 10) {
    let url = "/live-session/upcoming";
    if(include.length) url += `?with=${include.join(',')}&page=${page}&limit=${limit}`
    else url += `?page=${page}&limit=${limit}`
    return lmsBackend
      .get(url)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  submitReportFeedback(session_id, feedback) {
    return lmsBackend
      .post(`/live-session/${session_id}/report/feedback`, { feedback })
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  markInterested(session_id, is_interested) {
    return lmsBackend
      .post(`/live-session/${session_id}/interested`, { is_interested })
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  getOngoingSessions(include = [], page = 1, limit = 10) {
    let url = "/live-session/ongoing";
    if(include.length) url += `?with=${include.join(',')}&page=${page}&limit=${limit}`
    else url += `?page=${page}&limit=${limit}`
    return lmsBackend
      .get(url)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  getPreviousSessions(include = [], page = 1, limit = 10) {
    let url = "/live-session/previous";
    if(include.length) url += `?with=${include.join(',')}&page=${page}&limit=${limit}`
    else url += `?page=${page}&limit=${limit}`
    return lmsBackend
      .get(url)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  getUpcommingMonthSessions(include = [], page = 1, limit = 10) {
    let url = "/live-session/upcoming_month";
    if(include.length) url += `?with=${include.join(',')}&page=${page}&limit=${limit}`
    else url += `?page=${page}&limit=${limit}`
    return lmsBackend
      .get(url)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  getSessionById(id, isInstructor = false, include = []) {
    let url = `/live-session/${id}`;
    if (isInstructor) url += `/instructor`;
    if(include.length) url += `?with=${include.join(',')}`
    return lmsBackend
        .get(url)
        .then(res => {
          return res.data;
        })
        .catch(err => {
          return err;
        });
  }

  getSessionChatsBySessionId(id, include = []) {
    let url = `/live-session/chats/${id}`;
    if(include.length) url += `?with=${include.join(',')}`
    return lmsBackend
      .get(url)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  generateZoomSignature(data) {
    return lmsBackend
      .post(`/live-session/generate-zoom-signature`, data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  saveSessionEvent(data) {
    return lmsBackend
      .post(`/live-session/save-event`, data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  trackSessionTime(data) {
    return trackingAxios
      .post(`/v1/live-session/save-session-stat`, data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  enrolInCourse(data) {
    return mainBackend
        .post("enrolledstudents/enrollCourse", data)
        .then(res => {
          return res.data;
        })
        .catch(err => {
          return err;
        });
  }
}
export default new LiveSessionService();

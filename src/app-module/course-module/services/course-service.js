import {
  mainBackend,
  lmsBackend,
  quizBackendServiceu
} from "../../../environment/environment";
import trackingAxios from "../../../environment/tracking-axios";

class CourseService {
  getStudentEnrolledCourses(
    studentId,
    pageNo,
    courseId,
    purchasedOnly,
    lastPurchased,
    currentTagId
  ) {
    return lmsBackend
      .get("courses/getStudentEnrolledCourses", {
        params: {
          studentId: studentId,
          page_no: pageNo,
          courseId: courseId,
          purchasedOnly,
          lastPurchased,
          tagId: currentTagId
        }
      })
      .then(res => {
        return res.data.data;
      })
      .catch(err => {
        return err;
      });
  }
  searchStudentEnrolledCourses(studentId, searchParams) {
    return lmsBackend
      .post("courses/searchStudentEnrolledCourses", {
        params: {
          studentId: studentId,
          searchParams: searchParams
        }
      })
      .then(res => {
        return res.data.courses;
      })
      .catch(err => {
        return err;
      });
  }
  getCourseByIndexUrl(indexUrl) {
    return lmsBackend
      .get("courses/get-course-by-index-url-for-lms", {
        params: {
          index_url: indexUrl
        }
      })
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  getCourseVisit(courseId) {
    return trackingAxios
      .get("/v1/tracking/get-course-visits-count/" + courseId)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  calculateStats(courseId) {
    return trackingAxios
      .get("/v1/tracking/calculate-course-progres/" + courseId)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  getVideoData(data) {
    return lmsBackend
      .post("cvideos/get-video-detail", data)
      .then(res => {
        return res;
      })
      .catch(err => {
        return err;
      });
  }
  getModuleByIndexUrl(indexUrl, moduleId, moduleNum, userId) {
    return lmsBackend.get("courses/getModuleByIndexUrl", {
      params: {
        url: indexUrl,
        module_no: moduleNum,
        user_id: userId,
        m_id: moduleId
      }
    });
  }
  getAllModulesData(indexUrl, userId, module_id, device_id, course_id) {
    const width = window.screen.width * window.devicePixelRatio;
    const height = window.screen.height * window.devicePixelRatio;
    return lmsBackend
      .get("courses/get-modules-by-index-url", {
        params: {
          url: indexUrl,
          user_id: userId,
          module_id: module_id,
          width,
          height,
          device_id: device_id,
          course_id: course_id
          // user_id: 179181
        }
      })
      .then(res => {
        return res;
      })
      .catch(err => {
        return err;
      });
  }
  getModuleData(course_id, module_id) {
    const width = window.screen.width * window.devicePixelRatio;
    const height = window.screen.height * window.devicePixelRatio;
    return lmsBackend
      .get("courses/get-module-detail", {
        params: {
          course_id: course_id,
          module_id: module_id,
          width,
          height
          // user_id: 179181
        }
      })
      .then(res => {
        return res;
      })
      .catch(err => {
        return err;
      });
  }
  getAllModulesDataForPlayer(indexUrl, userId) {
    const width = window.screen.width * window.devicePixelRatio;
    const height = window.screen.height * window.devicePixelRatio;
    return lmsBackend
      .get("courses/get-modules-by-index-url", {
        params: {
          url: indexUrl,
          user_id: userId,
          width,
          height

          // user_id: 179181
        }
      })
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  checkDownloadAccess() {
    return lmsBackend.get("cvideos/check-video-download-access", {
      params: {}
    });
  }
  getComments(userId, videoId, Page, perpage, notesId, live_session_id = null) {
    const params = {
      user_id: userId,
      id: videoId,
      notesId,
      page: Page,
      perPage: perpage
    };
    if(live_session_id) params.live_session_id = live_session_id;
    return lmsBackend
      .get("comments/get-comments-for-lms", {
        params
      })
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  addComment(obj) {
    return lmsBackend
      .post("comments/addComment", obj)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  createReport(obj) {
    return lmsBackend
      .post("feedback/create-report", obj)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  reportComment(obj) {
    return mainBackend
      .post("comments/report-comment", obj)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  reactVideo(obj) {
    return lmsBackend
      .post("cvideos/react-video", obj)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  reportVideo(obj) {
    return mainBackend
      .post("cvideos/report-video", obj)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  reactComment(obj) {
    return lmsBackend
      .post("comments/react-comment", obj)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  reactCommentReply(obj) {
    return lmsBackend
      .post("comments/react-comment-reply", obj)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  reportCommentReply(obj) {
    return mainBackend
      .post("comments/report-comment-reply", obj)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  addCommentReply(obj) {
    return lmsBackend
      .post("comments/add-comment-reply-for-lms", obj)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  secondsToHms(d) {
    d = Number(d);
    let h = Math.floor(d / 3600);
    let m = Math.floor((d % 3600) / 60);
    let s = Math.floor((d % 3600) % 60);

    let hDisplay = h > 0 ? h + (h == 1 ? " Hour, " : " Hours, ") : "";
    let mDisplay = m > 0 ? m + (m == 1 ? " Min, " : " Mins, ") : "";
    let sDisplay = s > 0 ? s + (s == 1 ? " Sec" : " Secs") : "";

    return hDisplay + mDisplay + sDisplay;
  }

  secondsToHm(d) {
    d = Number(d);
    let h = Math.floor(d / 3600);
    let m = Math.floor((d % 3600) / 60);

    let hDisplay = 0;
    if (h > 0) hDisplay = h > 0 ? h + (h == 1 ? " Hr" : " Hrs") : "";
    else hDisplay = m > 0 ? m + (m == 1 ? " Min " : " Mins ") : "";
    return hDisplay;
  }
  secondsToHmsForVideo(d) {
    d = Number(d);
    let h = Math.floor(d / 3600);
    let m = Math.floor((d % 3600) / 60);
    let s = Math.floor((d % 3600) % 60);

    let hDisplay = h > 0 ? h + ":" : "";
    let mDisplay = m > 0 ? m + ":" : "00:";
    let sDisplay = s == 0 || s < 10 ? "0" + s : s;
    return hDisplay + mDisplay + sDisplay;
  }
  // uploadImageToS3(obj, userId) {
  //   return mainBackend.post("uploader/uploadImageToS3?userId="+userId, obj)
  //   .then(res => {
  //     return res.data
  //   })
  //   .catch(err => {
  //     return err
  //   });
  // }
  updateComment(obj) {
    return lmsBackend
      .post("comments/update_comment_for_lms", obj)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  updateReply(obj) {
    return lmsBackend
      .post("comments/update-reply-for-lms", obj)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  deleteComment(commentId) {
    return lmsBackend
      .post("comments/delete-comment?comment_id=" + commentId)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  getUserInfo() {
    const ax = require("axios");
    return ax
      .get("https://ipapi.co/json/")
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  deleteCommentReply(replyId) {
    return lmsBackend
      .post("comments/delete-comment-reply?reply_id=" + replyId)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  getModulesByCourseId(courseId) {
    return mainBackend.get("courses/get-modules-by-courseId-for-lms", {
      params: {
        id: courseId
      }
    });
  }
  getVideoPoints(selectedVideoId) {
    return lmsBackend
      .get("cvideos/points-client/" + selectedVideoId)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  getCourseProgress(courseId, userId) {
    return trackingAxios
      .get("/v1/tracking/get-course-progress/" + courseId + "/" + userId)
      .then(res => {
        return res;
      })
      .catch(err => {
        return err;
      });
  }
  getUserLastStat(courseId, userId) {
    return trackingAxios
      .get("/v1/tracking/get-user-last-stat/" + courseId + "/" + userId)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  getEnrolledCoursesProgress(
    userId,
    pageNo,
    purchasedOnly,
    lastPurchased,
    courseID,
    tagId
  ) {
    let courseFilter = "";
    if (courseID) {
      courseFilter = "&courseId=" + courseID;
    }
    if (tagId) {
      courseFilter = "&tagId=" + tagId;
    }
    let filter = purchasedOnly ? "purchased_only" : "all";
    let sort = lastPurchased ? "last_purchased" : "last_enrolled";
    return trackingAxios
      .get(
        "/v1/tracking/get-enrolled-courses-progress/" +
          userId +
          "?page=" +
          pageNo +
          "&fillter=" +
          filter +
          "&sort=" +
          sort +
          courseFilter
      )
      .then(res => {
        return res.data.data;
      })
      .catch(err => {
        return err;
      });
  }
  addCourseVisit(obj) {
    return trackingAxios.post("/v1/tracking/save-course-visit", obj);
  }
  saveVideoStat(obj) {
    return trackingAxios.post("/v1/video-tracking/save-video-stat", obj);
  }
  saveNotesStat(obj) {
    return trackingAxios.post("/v1/video-tracking/save-notes-stat", obj);
  }
  // createReport(obj) {
  //   return mainBackend
  //     .post("feedback/reports/create-report", obj)
  //     .then(res => {
  //       return res.data;
  //     })
  //     .catch(err => {
  //       return err;
  //     });
  // }
  getCoursesList(studentId) {
    return lmsBackend
      .get("courses/get-courses-list", {
        params: {
          studentId: studentId
        }
      })
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  updateLeadForCourseProgress(progress, courseName, courseId, faculty, video) {
    return lmsBackend
      .post("odoo/course-watch-odoo-lead", {
        progress,
        courseId,
        courseName,
        faculty,
        videoData: video
      })
      .then(res => res.data)
      .catch(err => err);
  }
  reactUpdateProgress(course_id, device_id) {
    return trackingAxios.get(
      "/v1/download-tracking/get-course-downloaded-count",
      {
        params: {
          course_id: course_id,
          device_id: device_id
        }
      }
    );
  }
  getUserStats() {
    return lmsBackend
      .get("user/get-user-stats", {
      })
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  getUserWatchedTime(userId) {
    return trackingAxios
      .get("/v1/tracking/get-user-watched-time/" + userId, {
      })
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
}
export default new CourseService();

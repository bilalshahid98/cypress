import { quizBackendService, lmsBackend } from "../../environment/environment";

class AppService {
  getMarkets() {
    return lmsBackend
      .get("courses/get-course-tags?practice=true", {})
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  getTagCourses(data) {
    return lmsBackend
      .post("courses/get-tags-courses", data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  getCourseModules(data) {
    return lmsBackend
      .post("courses/get-courses-modules", data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  getTopics(data) {
    return quizBackendService
      .post("practice/get-quiz-topics", data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  getDifficulties(data) {
    return quizBackendService
      .post("practice/get-quiz-difficulty", data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  createPracticeQuestioncCount(data) {
    return quizBackendService
      .post("practice/get-questions-count", data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  createPracticeQuiz(data) {
    return quizBackendService
      .post("practice/create-practice-quiz", data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  getPracticeAttempts(data) {
    return quizBackendService
      .get("practice/get-practice-attempts", {})
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  checkWrongAttempts(data) {
    return quizBackendService
      .post("practice/check-wrong-attempts", data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
}
export default new AppService();

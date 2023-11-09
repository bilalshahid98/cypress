import {
  quizBackendService,
  lmsBackend
} from "../../../environment/environment";

class QuizService {
  getQuiz(id) {
    return quizBackendService.get("quiz/get-quiz/" + id, {});
  }
  getQuizAttempts(id) {
    return quizBackendService.get("quiz-report/get-quiz-attempts/" + id, {});
  }
  getQuizTopStudents(id, rid, first) {
    return quizBackendService.get(
      "quiz-report/get-top-students/" +
        id +
        "?result=" +
        rid +
        "&attempt=" +
        (first ? "first" : "latest"),
      {}
    );
  }
  getStudentsPositions(rid) {
    return quizBackendService.get(
      "quiz-report/get-top-students-by-result-id" +
        "?result=" +
        rid +
        "&attempt=first",
      {}
    );
  }

  getStudentQuizPerformance(id) {
    return quizBackendService.get(
      "quiz-report/get-student-quiz-performance/" + id,
      {}
    );
  }
  submitQuiz(body) {
    return quizBackendService.post("quiz/submit-quiz", body);
  }
  getResult(result_id) {
    return quizBackendService.get("result/get-result/" + result_id, {});
  }
  getQuizResults(quiz_id) {
    return quizBackendService.get(
      "/quiz-report/get-quiz-results/" + quiz_id,
      {}
    );
  }
  getStudentPerformanceTrend(student_id, result_id) {
    return quizBackendService.get(
      "result/get-student-quiz-performance/" + student_id + "/" + result_id,
      {}
    );
  }
  getGrade = percentage => {
    try {
      if (percentage >= 90) {
        return "A+";
      } else if (percentage < 90 && percentage >= 80) {
        return "A";
      } else if (percentage < 80 && percentage >= 70) {
        return "B";
      } else if (percentage < 70 && percentage >= 60) {
        return "C";
      } else if (percentage < 60 && percentage >= 50) {
        return "D";
      } else if (percentage < 50 && percentage >= 40) {
        return "E";
      } else if (percentage < 40) {
        return "F";
      }
      return "NA";
    } catch (error) {
      return "NA";
    }
  };
  createReport(obj) {
    return lmsBackend
      .post("feedback/reports/create-report", obj)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  createReportInQuizBackend(obj) {
    return quizBackendService.post("report/create-report", obj);
  }
  getQuizCityWiseStats = quiz_id => {
    return quizBackendService.get(
      "quiz-report/get-city-wise-stats/" + quiz_id,
      {}
    );
  };
  getClassResult(session_id) {
    return quizBackendService.get("result/get-class-result/" + session_id, {});
  }

  getTopicWiseStrength(session_id, result_id) {
    return quizBackendService.get(
      "result/get-topic-wise-strength/" + session_id + "/" + result_id,
      {}
    );
  }
  getQuizPrediction(course_id, quiz_id) {
    return quizBackendService.get(
      "quiz-report/get-score-prediction/" + course_id + "?quiz_id=" + quiz_id,
      {}
    );
  }
  getBuildCertificate(result_id) {
    return quizBackendService.get(
      "result/build-certificate?result_id=" + result_id,
      {}
    );
  }
  getCertificate(certificate_id) {
    return quizBackendService.get(
      "result/get-certificate/" + certificate_id,
      {}
    );
  }
  clapOnResult(result_id) {
    return quizBackendService.get("result/clap-result/" + result_id, {});
  }
  checkdaqQuestion(data) {
    return quizBackendService.post("question/check-assignment-questions", data);
  }
  getDaqResult(data) {
    return quizBackendService.get("result/get-daq-result", {
      params: data,
    });
  }
  getDaqLastResult(data) {
    return quizBackendService.get("result/get-daq-last-result", {
      params: data,
    });
  }
  notifyOnceChecked(data) {
    return quizBackendService.post("question/notify-once-checked", data);
  }
  getDaqResultFromImage(data) {
    return quizBackendService.post("question/get-text-from-ocr", data);
  }
  saveAnswerFeedback(data) {
    return quizBackendService.post("question/save-question-feedback", data);
  }
}

export default new QuizService();

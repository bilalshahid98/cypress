import { io, Socket } from "socket.io-client";
import { quizBackendService } from "../../../environment/environment";

export const tracker = () => quizBackendService.get("users/user-tracker");

const emitQuestion = obj => {};

export const submitQuestionSocketInit = (
  {
    time_spent,
    skipped_questions,
    marked_questions,
    user,
    quiz,
    questions,
    session_id,
    prediction
  },
  user_details,
  onComplete,
  errorCallback,
  progressCallback
) => {
  const socket = io(process.env.VUE_APP_SOCKET_URL, {
    path: "/quizservice/socket/submit-question",
    transports: ["websocket"]
  });
  const questionsInner = [...questions];
  let __isError = false;
  let __isCompleted = false;
  socket.connect();

  socket.on("connect", () => {
    // console.log("socket connected->", socket.id);
  });

  socket.on("disconnect", () => {
    if (__isError)
      return console.log(
        "socket disconnected due to server error handled already"
      );
    if (__isCompleted)
      return console.log("socket disconnected on complete submission of quiz");

    errorCallback("Connection Error! Please try again.");
    // console.log("disconnected->", socket.id);
  });

  socket.on("error", (message, error) => {
    __isError = true;
    errorCallback(message);
    socket.disconnect();
    console.log(error, message, socket.disconnected);
  });

  socket.on("result", result => {
    onComplete(result);
    socket.disconnect();
  });

  socket.on("progress", progress => progressCallback(Math.ceil(progress)));

  const quiz_without_questionArr = { ...quiz };
  delete quiz_without_questionArr.questions;
  let iterations = Math.ceil(questions.length / 100);
  let i = 1;

  const emitQuestion = () => {
    socket.emit("questions", {
      questions: questionsInner.splice(
        0,
        questionsInner.length >= 100 ? 100 : questionsInner.length
      ),
      time_spent,
      user,
      quiz: quiz_without_questionArr,
      session_id,
      progress: (i / iterations) * 50,
      prediction
    });
  };

  const emitSkips = () => {
    socket.emit("skips", {
      skipped_questions: skipped_questions.splice(
        0,
        skipped_questions.length >= 100 ? 100 : skipped_questions.length
      ),
      user,
      session_id
    });
  };

  const emitMarks = () => {
    socket.emit("marks", {
      marked_questions: marked_questions.splice(
        0,
        marked_questions.length >= 100 ? 100 : marked_questions.length
      ),
      user,
      session_id
    });
  };

  emitQuestion();
  socket.on("itteration-question", () => {
    i++;
    if (questionsInner.length) {
      emitQuestion();
    } else {
      if (skipped_questions.length) {
        emitSkips();
      } else if (marked_questions.length) {
        emitMarks();
      } else ifCompleted();
    }
  });

  socket.on("itteration-skips", () => {
    if (skipped_questions.length) {
      emitSkips();
    } else {
      if (marked_questions.length) {
        emitMarks();
      } else ifCompleted();
    }
  });

  socket.on("itteration-marks", () => {
    if (marked_questions.length) {
      emitMarks();
    } else {
      ifCompleted();
    }
  });
  function ifCompleted() {
    if (
      !questionsInner.length &&
      !skipped_questions.length &&
      !marked_questions.length
    ) {
      socket.emit("complete", {
        location: user_details.data.data.location,
        device: user_details.data.data.device,
        user,
        session_id
      });
      __isCompleted = true;
    }
  }
};

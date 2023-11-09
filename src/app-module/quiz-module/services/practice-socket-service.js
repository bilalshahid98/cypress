import { io, Socket } from "socket.io-client";
import { quizBackendService } from "../../../environment/environment";

export const practiceSocketInit = (
  { quiz_id, user_id, session_id, isNotification },
  usersListUpdated,
  quizSubmit,
  errorCallback
) => {
  const socket = io(process.env.VUE_APP_SOCKET_URL, {
    path: "/quizservice/socket/practice-quiz",
    transports: ["websocket"]
  });
  let __isError = false;
  let __isCompleted = false;
  socket.connect();

  socket.on("connect", () => {
    console.log("connected");
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

  socket.on("room-created", result => {
    console.log("room-created");
    usersListUpdated(result);
  });

  socket.on("room-joined", result => {
    console.log("new User Joined");
    usersListUpdated(result);
  });

  socket.on("new-user-joined", result => {
    console.log("new User Joined");
    usersListUpdated(result);
  });

  socket.on("user-started-quiz", progress => {
    console.log("user-started-quiz");
  });

  socket.on("list-updated", result => {
    usersListUpdated(result);
  });

  socket.on("quiz-submitted-by-a-user", result => {
    quizSubmit(result);
  });

  const shareQuiz = () => {
    socket.emit("create-or-connect-room", {
      quiz_id,
      user_id: user_id,
      session_id,
      isNotification
    });
  };

  shareQuiz();
  return socket;
};

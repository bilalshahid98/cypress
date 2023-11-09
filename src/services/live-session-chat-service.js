import { io } from "socket.io-client";
import customStorageService from "@/app-module/app-services/custom-storage-service";
import appService from "@/app-module/app-services/app-service";

export const saveLiveSessionChatSocketInit = (
    uid,
    session,
  onComplete,
  errorCallback,
    catchMessage,
    catchMessageReply,
  sessionEndCallback,
    catchLikeComment,
    catchSessionUserCount
) => {
  // const uid = (customStorageService.getUid() ?? appService.getBrowserId()) ?? session.instructor_id;
  const socket = io(process.env.VUE_APP_SOCKET_URL, {
    path: "/lmsservice/socket/live-session-chat",
    query: { uid, session_id: session.id, instructor_id: session.instructor_id },
    transports: ["websocket"],
  });
  console.log(socket)
  //   socket.disconnect()
  socket.connect();

  socket.on("connect", () => {
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx
  });
  socket.on("disconnect", () => {
    console.log(socket.id); // undefined
  });
  socket.on("session end", (user_id) => {
    console.log("session end");
    sessionEndCallback(user_id);
  });
  socket.on("error", () => errorCallback());
  socket.on("like-comment", (message) => catchLikeComment(message));
  socket.on("send-message", (message) => catchMessage(message));
  socket.on("session-user-count", (count) => catchSessionUserCount(count));
  socket.on("send-message-reply", (message) => catchMessageReply(message));
  socket.on("complete", () => {
    sendMessage(100);
    onComplete();
    socket.disconnect();
  });

  // setInterval(function(){
  //   console.log(socket.id, "trigger send message event", uid);
  //   socket.emit("send-message", uid, 33, "blah blah blah")
  // },300);

  return socket;
};

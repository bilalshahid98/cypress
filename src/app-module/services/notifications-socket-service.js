import { io, Socket } from "socket.io-client";
import storageService from "../app-services/custom-storage-service";
import { eventBus } from "../../../src/main";
import toastr from "toastr";

const playSound = () => {
  var audio = new Audio(
    "https://storage.googleapis.com/nps3storage/nearpeer-imagees/undefined/notification-tone-swift-gesture-1664803917214.mp3"
  );
  audio.play();
};

export const notificationSocketInit = async () => {
  console.log("iniinn socket");
  let user = await storageService.getUser();
  const socket = io(process.env.VUE_APP_SOCKET_URL, {
    path: "/notificationservice/socket/notification",
    query: { uid: user.id },
    transports: ["websocket"]
  });
  let __isError = false;
  let __isCompleted = false;
  socket.connect();

  socket.on("connect", () => {
    console.log("connected");
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

  socket.on("new-notification", function(message, error) {
    console.log("new notification");

    eventBus.$emit("new-notification", message);
    playSound();
  });

  socket.on("new-notification-on-session-live", function(message, error) {
    console.log("new-notification-on-session-live");

    eventBus.$emit("new-notification-on-session-live", message);
  });

  return socket;
};

import { notificationBackend } from "../../environment/environment";

class AppService {
  getUserNotifications(data) {
    return notificationBackend
      .post("/notification/get-user-notifications", data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  notificationRead(data) {
    return notificationBackend
      .post("/notification/user-notification-read", data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  notificationClick(data) {
    return notificationBackend
      .post("/notification/user-notification-click", data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
}
export default new AppService();

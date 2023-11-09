import authAxios from "../../environment/auth-axios";

class CustomStorageService {
  authenticate(body) {
    return authAxios
      .post("v1/auth/authenticate-frontend-route", body)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  validateSession(body) {
    return authAxios
      .post("v1/sessions/validate-session", body)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  validateOrCreateSession(body) {
    return authAxios
      .post("v1/sessions/validate-or-create-session", body)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
}
export default new CustomStorageService();

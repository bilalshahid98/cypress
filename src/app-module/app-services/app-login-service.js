import { mainBackend, lmsBackend } from "./../../environment/environment";

import toastr from "toastr";

const width = window.screen.width * window.devicePixelRatio;
const height = window.screen.height * window.devicePixelRatio;

const dimensions = {
  width,
  height,
  dimensions: height + "x" + width
};

class LoginService {
  login(loginData) {
    loginData.origin_url = process.env.VUE_APP_LMS_HOME;
    loginData.origin = "LMS";
    loginData.dimensions = dimensions;
    return lmsBackend
      .post("auth/signin", loginData)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  signupAsGuest(signupData) {
    signupData.origin_url = process.env.VUE_APP_LMS_HOME;
    signupData.origin = "LMS";
    signupData.dimensions = dimensions;
    return lmsBackend
      .post("auth/signup-as-guest", signupData)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  getUserById(id) {
    return lmsBackend.get("users/getUserData", id);
  }

  registerGuest(signupData) {
    signupData.origin_url = process.env.VUE_APP_LMS_HOME;
    signupData.origin = "LMS";
    signupData.dimensions = dimensions;
    return lmsBackend
      .post("auth/register-guest", signupData)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }

  signup(signupData) {
    signupData.origin_url = process.env.VUE_APP_LMS_HOME;
    signupData.origin = "LMS";
    signupData.dimensions = dimensions;
    return lmsBackend
      .post("auth/signup", signupData)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  requestEmailConfirmation(requestEmail) {
    // requestEmail.origin_url = process.env.VUE_APP_LMS_HOME;
    return lmsBackend
      .post("users/requestConfirmationMail", requestEmail)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  requestPassword(rpData) {
    rpData.origin_url = process.env.VUE_APP_LMS_HOME;
    return lmsBackend
      .post("users/requestPasswordReset", rpData)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  verifyToken(tokenObj) {
    tokenObj.origin_url = process.env.VUE_APP_LMS_HOME;
    return lmsBackend
      .get("users/verifyPasswordResetToken", {
        params: tokenObj
      })
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  confirmAccountToken(tokenObj) {
    return lmsBackend
      .post("users/confirmUser", tokenObj)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  updatePassword(data) {
    data.origin_url = process.env.VUE_APP_LMS_HOME;
    return lmsBackend
      .post("users/updatePassword", data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  sendOTP(data) {
    return lmsBackend
      .post("auth/send-otp", data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  resendOtp(data) {
    return lmsBackend
      .post("auth/resend-otp", data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  validateOTP(data) {
    data.dimensions = dimensions;
    return lmsBackend
      .post("auth/validate-otp", data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  skipValidate(data) {
    data.dimensions = dimensions;
    return lmsBackend
      .post("auth/skip-validate", data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  logout(data) {
    return lmsBackend
      .post("auth/logout", data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  updateEmail(data) {
    // data.origin_url = process.env.VUE_APP_LMS_HOME;
    // console.log("API CALL", data);
    return lmsBackend
      .post("users/updateUser", data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
  validateEmailPhone(data) {
    return mainBackend
      .post("auth/validate-email-phone", data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return err;
      });
  }
}

export default new LoginService();

<script>
import LoginService from "./../app-services/app-login-service";
import CustomStorageService from "./../app-services/custom-storage-service";
import validatorService from "./../app-services/validator-service";
import toastr from "toastr";

export default {
  name: "app-reset-password",
  created() {
    this.email = this.$route.params.email;
    this.token = this.$route.params.token;
  },
  data() {
    return {
      update: {
        password: "",
        confirmPassword: ""
      },
      setResetOnly: true,
      email: "",
      token: "",
      data: {},
      password: "",
      password_confirmation: "",
      valid: false,
      show: true,
      errorMessage: "",
      loader: false
    };
  },
  methods: {
    forgotPassword() {
      this.forgotpassword = true;
      this.signin = false;
      this.signup = false;
    },

    filter(id) {
      if (id == 1) {
        this.setResetOnly = true;
      } else if (id == 2) {
        this.setResetOnly = false;
      }
    },

    submitHandler(data) {
      this.updatePassword(data);
    },
    async verifyToken() {
      let data = {
        email: this.email,
        token: this.token
      };

      let tokenResponse = await LoginService.verifyToken(data);

      if (tokenResponse.success == true) {
        this.show = false;
        this.valid = true;
        toastr.success("Token Validated!");
      } else if (tokenResponse.success == false) {
        toastr.error("Token Invalid!");
        this.$router.push("/unauthorized-page");
      }
    },
    async confirmAccountToken() {
      let data = {
        email: this.email,
        confirmation_token: this.token
      };

      let tokenResponse = await LoginService.confirmAccountToken(data);

      if (tokenResponse.success == true) {
        toastr.success("Email Successfully Verfied!");
        let time = new Date();
        var updatedUser = CustomStorageService.getUser();
        updatedUser.confirmed_at = time;
        CustomStorageService.setUser(updatedUser);
        this.$router.push("/landing");
      } else if (tokenResponse.success == false) {
        toastr.error("Email Verification Unsuccessful!");
        this.$router.push("/unauthorized-page");
      }
    },
    async updatePassword(data) {
      this.loader = true;
      this.errorMessage = "";
      try {
        const fields = ["password", "confirmPassword"];
        let isDataValidated = await validatorService.validate(
          fields,
          this.update
        );
        if (isDataValidated) {
          throw new Error(isDataValidated);
        } else if (this.update.password != this.update.confirmPassword) {
          throw "password doesn't match";
        } else {
          this.password = data.password;
          this.password_confirmation = data.confirmPassword;

          let passwordData = {
            email: this.email,
            token: this.token,
            password: this.password,
            password_confirmation: this.password_confirmation
          };

          let updatePasswordResponse = await LoginService.updatePassword(
            passwordData
          );

          if (updatePasswordResponse.success == true) {
            toastr.success("Password Successfully Changed!");
            this.$router.push("/login");
          } else if (updatePasswordResponse.success == false) {
            this.$router.push("/login");
          }
        }
        this.loader = false;
      } catch (error) {
        this.errorMessage = error;
        this.loader = false;
      }
    }
  },
  async mounted() {
    if (this.$route.name == "AppConfirmPage") {
      this.confirmAccountToken();
    } else {
      this.verifyToken();
    }
  }
};
</script>

<template src="./reset-password.html"></template>

<style src="./reset-password.css" scoped></style>

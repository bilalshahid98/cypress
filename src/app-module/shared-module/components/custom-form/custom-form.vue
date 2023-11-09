<template src="./custom-form.html"> </template>

<script>
import appService from "../../../app-services/app-service";
import toastr from "toastr";
import CustomStorageService from "@/app-module/app-services/custom-storage-service";
let fbRender;
export default {
  name: "custom-form",
  props: {
    type: null,
    form_data: null,
    form_id: null,
    is_mandatory: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {};
  },
  methods: {
    closePopup() {
      this.$emit('form-saved-event');
    },
    renderForm() {
      fbRender = document.getElementById("fb-render");
      if(this.type == "registration_form" || this.type == "live_session_form") {
        console.log("this.form_data", this.form_data)
        $(fbRender).formRender({ formData: this.form_data });
      }
      else{
        var formData = this.$store.state.showCustomForm;
        $(fbRender).formRender({ formData: formData.form_data });
      }
    },
    async saveFormData() {
      const data = $(fbRender).formRender("userData");
      const body = {
        form_id: this.type == "registration_form" || this.type == "live_session_form"? this.form_id : this.$store.state.showCustomForm.id,
        form_result: data
      };
      if(!(this.type == "registration_form" || this.type == "live_session_form")) {
        const updatedForms = [];
        this.$store.state.customForms.forEach(form => {
          if (form.id !== this.$store.state.showCustomForm.id) {
            updatedForms.push(form);
          }
        });
        this.$store.commit("setCustomForms", updatedForms);
        this.$store.commit("setShowCustomForms", false);
      }
      if(this.type == "registration_form"){
        const res = await appService.saveRegistrationFormData(body);
        console.log("res", res);
        if(res.success) {
          if (res.token) {
            await CustomStorageService.setUid(res.user.id);
            let user = res.user;
            user.token = res.token;
            CustomStorageService.setUser(user);
            if (this.reactApp) {
              window.postMessage("signedUp");
              console.log("userToken" + user.token);
              console.log("userID" + user.id);
              console.log("signedUp", user);
            }
            const currentRoutePath = this.$route.path;

            // Remove "unregister/" from the route path
            const newRoutePath = currentRoutePath.replace('unregistered/', '');

            // Push the new route
            this.$router.push(newRoutePath);
          }
          this.$emit('form-saved-event');
          toastr.success("Subscribed Successfully!");
        }
        else toastr.error(res.error);
      }
      else {
        const res = await appService.saveCustomFormsData(body);
        this.$emit('form-saved-event');
        toastr.success("Data Saved Successfully!");
      }
    }
  },
  mounted() {
    console.log("mounted custom-form");
    // setTimeout(this.renderForm, 3000)
    this.renderForm();
  }
};
</script>

<style src="./custom-form.css"></style>

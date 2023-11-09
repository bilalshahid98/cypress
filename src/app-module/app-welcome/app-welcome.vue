<template src="./app-welcome.html"></template>

<script>
import customStorageService from "../app-services/custom-storage-service";
import appService from "../app-services/app-service";
import authService from "../app-services/auth-service";

export default {
  name: "app-welcome",
  data() {
    return {
      isPageLoading: true,
      userName: "Friend"
    };
  },
  async mounted() {
    let uid;
    let userVisited;
    let currentUser = customStorageService.getUser();
    if (currentUser) {
      mixpanel.track("VL-Welcome-Page", {
        User_Name: (currentUser || {}).full_name,
        User_Email: (currentUser || {}).email,
        User_ID: (currentUser || {}).id
      });
    }

    uid = this.$route.query.uid;
    let token = this.$route.query.token;
    let isValidToken = false;
    if (uid && token) {
      const body = {
        user_id: uid,
        session: token
      };
      const isValid = await authService.validateSession(body);
      if (isValid && isValid.success) {
        isValidToken = true;
      }
    }

    if (this.$route.query.uid || currentUser) {
      customStorageService.setBreadcrumbFlag("true");
      let obj = {
        uid: uid,
        welcome_page: true
      };
      customStorageService.setUid(uid);
      if (this.$route.query.uid && token && isValidToken) {
        uid = this.$route.query.uid;
        this.$store.commit("setUid", {
          uid: uid
        });
        userVisited = await appService.checkUserVisited(uid);
        let user = { ...userVisited?.userVisited?.user_id };
        let userObj = { ...userVisited?.userVisited };
        user.visited = userObj;
        user.token = token;
        userObj.token = token;
        customStorageService.setUser(userObj);

        this.userName = userVisited?.userVisited?.user_id?.full_name
          ? userVisited.userVisited?.user_id?.full_name
          : userVisited.userVisited?.user_id?.name
            ? userVisited.userVisited?.user_id?.name
            : userVisited.userVisited?.user_id?.first_name
              ? userVisited.userVisited?.user_id?.first_name
              : "Peer";
        let visited = await appService.postUserVisited(obj);
        if (this.$route.query.redirecturl) {
          return this.$router.push(`/${this.$route.query.redirecturl}`);
        } else if (user?.visited?.visited_welcome_page) {
          return this.$router.push("/course/course-landing");
        }
      } else if (currentUser) {
        obj.uid = currentUser.id;
        let currentUserVisited = await appService.postUserVisited(obj);
        if (currentUser?.visited?.visited_welcome_page) {
          return this.$router.push("/course/course-landing");
        }
        this.userName = currentUser.full_name
          ? currentUser.full_name
          : currentUser.name
            ? currentUser.name
            : currentUser.first_name
              ? currentUser.first_name
              : "Peer";
      } else {
        this.$router.push("/login");
      }
      this.isPageLoading = false;
    } else {
      this.$router.push("/login");
    }
  }
};
</script>

<style src="./app-welcome.css" scoped></style>

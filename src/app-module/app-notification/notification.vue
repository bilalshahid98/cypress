<template src="./notification.html"></template>

<script>
import appHeader from "../shared-module/components/app-header/app-header";
import appFooter from "../shared-module/components/app-footer/app-footer.vue";
import appsidebar from "../shared-module/components/app-sidebar/app-sidebar.vue";
import AppVerification from "./../shared-module/components/app-verification/app-verification";
import notificationService from "../../app-module/app-services/notification-service";
import customStorageService from "../../app-module/app-services/custom-storage-service";
var moment = require("moment-timezone");

export default {
  name: "AppLivesession",
  data() {
    return {
      currentUser: customStorageService.getUser(),
      notifications: [],
      page: 1,
      searchText: "",
      isLoading: false,
      isLoadMore: true,
      AllNotification: this.$route.name == "AppAssignments" ? false : true,
      isAssignement: this.$route.name == "AppAssignments"
    };
  },
  components: {
    "app-header": appHeader,
    "app-footer": appFooter,
    "app-sidebar": appsidebar,
    "app-verification": AppVerification
  },
  methods: {
    async getNotifications() {
      this.isLoading = true;
      const res = await notificationService.getUserNotifications({
        user_id: this.currentUser.id,
        search: this.searchText,
        page: this.page,
        assignment: !this.AllNotification,
        assignmentCount: true
      });
      if (res && res.success) {
        this.isAssignement = res.isAssignmentNotification;
        this.notifications = [...this.notifications, ...res.notifications];
        if (res.notifications && res.notifications.length === 0) {
          this.isLoadMore = false;
        }
      }
      this.isLoading = false;
    },
    clickNotification(notification) {
      if (!notification.is_clicked) {
        notificationService.notificationClick({
          user_id: this.currentUser.id,
          notification_id: notification.id
        });
      }
      notification.is_clicked = true;
      if (notification.notifications.redirect_url) {
        let link = notification.notifications.redirect_url;
        if (!link.startsWith("http://") && !link.startsWith("https://")) {
          link = "https://" + link;
        }
        if (notification.notifications.redirect_type === "new_tab") {
          window.open(link, "_blank");
        } else {
          window.location.href = link;
        }
      }
    },
    onScroll() {
      if (this.isLoadMore) {
        this.page = this.page + 1;
        this.getNotifications();
      }
    },
    searchNotifications() {
      this.page = 1;
      this.getNotifications();
      this.notifications = [];
    },
    showTime(notification) {
      return moment
        .tz(notification.notifications.createdAt, "Asia/Karachi")
        .format("hh: mm A");
    },
    showDate(notification, index) {
      let prevText;
      if (index > 0) {
        const compareDate = this.notifications[index - 1];
        prevText = moment
          .tz(compareDate.notifications.createdAt, "Asia/Karachi")
          .calendar({
            sameDay: "[Today]",
            nextDay: "DD/MM/YYYY",
            nextWeek: "DD/MM/YYYY",
            lastDay: "[Yesterday]",
            lastWeek: "[Last] dddd",
            sameElse: "DD/MM/YYYY"
          });
      }
      const text = moment
        .tz(notification.notifications.createdAt, "Asia/Karachi")
        .calendar({
          sameDay: "[Today]",
          nextDay: "DD/MM/YYYY",
          nextWeek: "DD/MM/YYYY",
          lastDay: "[Yesterday]",
          lastWeek: "[Last] dddd",
          sameElse: "DD/MM/YYYY"
        });
      if (text == prevText) {
        return false;
      }
      return text;
    },
    getNotiSortingType(type) {
      if (type == "All Notifications") {
        this.AllNotification = true;
      } else {
        this.AllNotification = false;
      }
      this.searchNotifications();
    }
  },
  mounted() {
    this.getNotifications();
    notificationService.notificationRead({
      user_id: this.currentUser.id
    });
  }
};
</script>

<style src="./notification.css" scoped></style>

<template src="./comments.html"></template>

<script>
import customStorageService from "../../../app-services/custom-storage-service";
import courseService from "../../services/course-service";
import { lmsBackend } from "../../../../environment/environment";
import toastr from "toastr";
import _ from "lodash";
import ClickOutside from "vue-click-outside";

var responseBox;
var moment = require("moment");
var user = {};

export default {
  name: "app-comments",
  props: [
    "selectedVideo",
    "currentCourse",
    "selectedModule",
    "selectedChapter"
  ],
  directives: {
    ClickOutside
  },
  data: function() {
    return {
      responseBox,
      commentIds: "",
      otherissue: "",
      commentArr: [],
      toPost: false,
      toNotify: false,
      isToLoadMore: true,
      commentText: "",
      replyText: "",
      pageNo: 1,
      isNext: true,
      format: moment,
      currentComment: {},
      currentReplyId: 0,
      currentCommentId: 0,
      currentReply: {},
      isEdit: false,
      selectedImage: {},
      uploadedImgLink: "",
      toReportReply: false,
      toReportComment: false,
      moreOptions: false,
      currentMoreOptionId: 0,
      moreOptionsReply: false,
      reportCommentDescArr: [],
      reportCommentDesc: "",
      reportReplyDesc: "",
      toReply: false,
      isEditReply: false,
      currentUser: {},
      isPageLoading: true,
      uploadPercentage: 0,
      isImgUploaded: true,
      showComments: true,
      isOtherOpt: false,
      deleteCommentDiv: false,
      deleteReplyDiv: false,
      imgLocalUrl: "",
      editText: "",
      currentOrder: 0,
      disableReact: false,
      oneCommentShow: false,
      disableBtn: false,
      firstReply: true,
    };
  },
  methods: {
    handleComment() {
      this.toPost = true;
      this.$store.commit("setTyping", false);
    },
    hideOptionsBox() {
      this.moreOptions = false;
      this.currentMoreOptionId = 0;
    },
    hideReplyOptionsBox() {
      this.moreOptionsReply = false;
    },
    commentsHandler() {
      this.showComments = !this.showComments;
      this.oneCommentShow = !this.oneCommentShow;
    },
    responseBoxHandler(comment) {
      console.log("🚀 ~ file: comments.vue:91 ~ responseBoxHandler ~ comment:", comment)
      this.currentCommentId = comment.comment_id;
      // this.firstReply = false;
      // ((comment || {}).replies || []).length != 0 && currentCommentId != comment.comment_id
    },
    uploadImage(formData, userId) {
      return lmsBackend
        .post("uploader/uploadImageToS3?userId=" + userId, formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          },
          onUploadProgress: function(progressEvent) {
            this.isImgUploaded = false;
            this.uploadPercentage = parseInt(
              Math.round((progressEvent.loaded / progressEvent.total) * 100)
            );
          }.bind(this)
        })
        .then(res => {
          return res.data;
        })
        .catch(err => {
          toastr.error("Oops! It seems service is down.");
          return err;
        });
    },
    removeImg() {
      this.imgLocalUrl = "";
      this.uploadedImgLink = "";
      this.uploadPercentage = 0;
    },
    async uploadSelectedImage() {
      let fd = new FormData();
      fd.append("file", this.selectedImage, this.selectedImage.name);
      let imageUploaded = await this.uploadImage(fd, user.id);
      if (imageUploaded.success) {
        this.uploadedImgLink = imageUploaded.link;

        this.selectedImage = null;
        toastr.success("image uploaded successfully!");
      }
    },
    async onImageSelected(event) {
      this.uploadPercentage = 0;
      this.selectedImage = event.target.files[0];
      this.imgLocalUrl = URL.createObjectURL(this.selectedImage);
      this.uploadSelectedImage();
    },
    editComment(comment) {
      this.cancelToRestore();
      this.moreOptions = false;
      this.moreOptionsReply = false;
      this.currentComment = comment;
      // this.commentText = comment.text;
      this.editText = comment.text;
      this.toPost = true;
      this.$store.commit("setTyping", false);
      this.isEdit = true;
      this.isEditReply = false;
      this.toNotify = comment.is_teacher_notified;
      this.uploadedImgLink = comment.image_url;
      this.selectedImage = null;
      this.toReportReply = false;
      setTimeout(() => {
        document.getElementById("3-t")?.focus();
        document.getElementById("5-t")?.focus();
      }, 100);
    },
    editReply(reply) {
      this.cancelToRestore();
      this.$store.commit("setTyping", false);
      this.moreOptionsReply = false;
      this.moreOptions = false;
      this.currentReply = reply;
      this.replyText = reply.text;
      this.currentReplyId = reply.id;
      this.responseBox = true;
      this.isEdit = true;
      this.isEditReply = true;
      this.toNotify = reply.is_toNotify_teacher;
      this.uploadedImgLink = reply.image_url;
      this.selectedImage = null;
      this.toReportComment = false;
      this.toReportReply = false;
      setTimeout(() => {
        document.getElementById("2-t")?.focus();
        document.getElementById("3-t")?.focus();
        document.getElementById("4-t")?.focus();
        document.getElementById("5-t")?.focus();
      }, 100);
    },
    async updateComment() {
      let obj = {
        comment_id: this.currentComment.comment_id,
        image_url: this.uploadedImgLink,
        updated_text: this.editText,
        is_toNotifyTeacher: this.toNotify,
        userId: user.id
      };
      if (!(this.uploadedImgLink.length > 0)) {
        let commentIndex = this.commentArr.findIndex(
          c => c.comment_id == this.currentComment.comment_id
        );
        this.commentArr[commentIndex].text = this.editText;
      } else {
        toastr.info("This comment needs to be approved!");
      }

      this.isEdit = false;
      this.isEditReply = false;

      this.toPost = false;
      let commentUpdated = await courseService.updateComment(obj);
      this.removeImg();
      if (commentUpdated.success) {
        this.commentText = "";
        this.replyText = "";
        toastr.success("Successfully Updated");
        this.isImgUploaded = true;
        this.editText = "";
        this.$store.commit("setTyping", true);
        this.selectedImage = null;
        this.uploadedImgLink = "";
        this.toNotify = false;
        this.toReportReply = false;
        this.currentCommentId = 9999990;
        await this.getComments();
      }
    },
    async updateReply() {
      let obj = {
        replyId: this.currentReply.id,
        image_url: this.uploadedImgLink,
        user_id: user.id,
        updated_text: this.replyText,
        is_toNotifyTeacher: this.toNotify
      };
      let replyUpdated = await courseService.updateReply(obj);
      this.removeImg();
      if (replyUpdated.success) {
        toastr.success("Successfully Updated");
        const commentIndex = this.commentArr.findIndex(
          c => c.comment_id == this.currentReply.comment_id
        );
        const replyIndex = this.commentArr[commentIndex].replies.findIndex(
          r => r.id == obj.replyId
        );
        this.commentArr[commentIndex].replies[replyIndex].text = this.replyText;
        await this.resetDataUpdateReply();
      }
    },
    async resetDataUpdateReply() {
      this.commentText = "";
      this.replyText = "";
      this.isEdit = false;
      this.isEditReply = false;
      this.toPost = false;
      this.$store.commit("setTyping", true);
      this.selectedImage = null;
      this.uploadedImgLink = "";
      this.isImgUploaded = true;
      this.responseBox = true;
      this.toNotify = false;
      this.toReportReply = false;
      this.currentReply = {};
      this.toReportComment = false;
      this.currentReplyId = 9999990;
      await this.getComments();
    },
    cancelToRestore() {
      this.currentReply = {};
      this.commentText = "";
      this.replyText = "";
      this.isOtherOpt = false;
      this.reportCommentDescArr = [];
      this.reportCommentDesc = "";
      this.isEdit = false;
      this.isEditReply = false;
      this.toNotify = false;
      this.uploadedImgLink = "";
      this.selectedImage = null;
      this.currentComment = {};
      this.currentReplyId = 0;
      this.toPost = false;
      this.$store.commit("setTyping", true);
      // this.currentCommentId = 0;
      this.toReply = false;
      this.toReportComment = false;
      this.toReportReply = false;
      this.removeImg();
    },
    async deleteCommentConfirm(comment) {
      this.deleteCommentDiv = true;
      this.moreOptions = false;
      this.moreOptionsReply = false;
      this.currentComment = comment;
    },
    async deleteComment() {
      const idToDel = this.currentComment.comment_id;
      let commentDeleted = await courseService.deleteComment(idToDel);
      if (commentDeleted.success) {
        this.deleteCommentDiv = false;
        toastr.success("Successfully Deleted");
        let objIndex = this.commentArr.findIndex(
          obj => idToDel == obj.comment_id
        );
        if (objIndex !== -1) this.commentArr.splice(objIndex, 1);
        await this.getComments();
      }
    },
    async deleteReplyConfirm(reply, cIndex, rIndex) {
      this.deleteReplyDiv = true;
      this.moreOptions = false;
      this.moreOptionsReply = false;
      this.currentReply = { ...reply, cIndex, rIndex };
    },
    async deleteReply() {
      try {
        let replyDeleted = await courseService.deleteCommentReply(
          this.currentReply.id
        );
        if (replyDeleted.success) {
          this.deleteReplyDiv = false;
          toastr.success("Successfully Deleted!");
          if (
            !isNaN(Number(this.currentReply.cIndex)) &&
            !isNaN(Number(this.currentReply.rIndex))
          ) {
            this.commentArr[this.currentReply.cIndex].replies.splice(
              this.currentReply.rIndex,
              1
            );
          } else {
            const commentIndex = this.commentArr.findIndex(
              obj => obj.comment_id == this.currentReply.comment_id
            );
            const replyIndex = this.commentArr.replies.findIndex(
              reply => reply.id == this.currentReply.id
            );
            this.commentArr[commentIndex].replies.splice(this.replyIndex, 1);
          }
          await this.getComments();
        } else {
          toastr.error("Error occured while deleting reply");
        }
      } catch (error) {
        toastr.error(error.message || "Error occured while deleting reply");
      }
    },
    async replyComment(comment) {
      this.currentComment = comment;
      this.currentCommentId = comment.comment_id;
      this.currentReplyId =
        comment.replies.length != 0 ? comment.replies[0].id : 99909;
      this.isEdit = false;
      this.isEditReply = false;
      this.toReply = true;
      this.toReportComment = false;
      this.toReportReply = false;
      this.$store.commit("setTyping", false);
      setTimeout(() => {
        document.getElementById("2-t")?.focus();
        document.getElementById("3-t")?.focus();
        document.getElementById("4-t")?.focus();
        document.getElementById("5-t")?.focus();
      }, 100);
    },
    async reactComment(comment) {
      let usersArr = [];
      this.disableReact = true;
      let reactionObj = {};
      usersArr = comment.reaction ? comment.reaction.users : [];
      let userExists = usersArr.filter(u => u.id == user.id);
      if (userExists.length == 0) {
        if (comment.reaction != null) {
          usersArr = comment.reaction.users;
          usersArr.push(user);
          let commentCount = comment.reaction.count + 1;
          reactionObj = {
            type: "like",
            users: usersArr,
            count: commentCount
          };
        } else {
          usersArr.push(user);
          reactionObj = {
            type: "like",
            users: usersArr,
            count: 1
          };
        }
        let obj = {
          comment_id: comment.comment_id,
          reaction: reactionObj
        };

        let objIndex = this.commentArr.findIndex(
          obj => obj.comment_id == comment.comment_id
        );
        this.commentArr[objIndex].reaction = reactionObj;
        this.commentArr[objIndex].selfLiked = true;
        await courseService.reactComment(obj);
        await this.getComments();
        this.disableReact = false;
      }
    },
    async reactCommentReply(reply) {
      let usersArr = [];
      this.disableReact = true;
      let reactionObj = {};
      usersArr = reply.reaction ? reply.reaction.users : [];
      let userExists = usersArr.filter(u => u.id == user.id);
      if (userExists.length == 0) {
        if (reply.reaction != null) {
          usersArr.push(user);
          let replyCount = reply.reaction.count + 1;
          reactionObj = {
            type: "like",
            users: usersArr,
            count: replyCount
          };
        } else {
          usersArr.push(user);
          reactionObj = {
            type: "like",
            users: usersArr,
            count: 1
          };
        }
        let obj = {
          reply_id: reply.id,
          reaction: reactionObj
        };
        let objIndex = this.commentArr.findIndex(
          obj => obj.comment_id == reply.comment_id
        );
        let replyIndex = this.commentArr[objIndex].replies.findIndex(
          obj => obj.id == reply.id
        );
        this.commentArr[objIndex].replies[replyIndex].reaction = reactionObj;
        this.commentArr[objIndex].replies[replyIndex].selfLiked = true;
        await courseService.reactCommentReply(obj);
        await this.getComments();
        this.disableReact = false;
      }
    },
    async revertReactComment(comment) {
      let usersArr = [];
      this.disableReact = true;
      let reactionObj = {};
      usersArr = comment.reaction.users;
      let userExists = usersArr.filter(u => u.id == user.id);
      if (userExists.length != 0 && userExists.length == 1) {
        usersArr = usersArr.filter(u => u.id != user.id);
        let commentCount = comment.reaction.count - 1;
        reactionObj = {
          type: "like",
          users: usersArr,
          count: commentCount
        };
        let obj = {
          comment_id: comment.comment_id,
          reaction: reactionObj,
          user_id: user.id
        };
        let objIndex = this.commentArr.findIndex(
          obj => obj.comment_id == comment.comment_id
        );
        this.commentArr[objIndex].reaction = reactionObj;
        this.commentArr[objIndex].selfLiked = false;
        await courseService.reactComment(obj);
        await this.getComments();
        this.disableReact = false;
      }
    },
    async revertReactCommentReply(reply) {
      let usersArr = [];
      this.disableReact = true;
      let reactionObj = {};
      usersArr = reply.reaction.users;
      let userExists = usersArr.filter(u => u.id == user.id);
      if (userExists.length != 0 && userExists.length == 1) {
        usersArr = usersArr.filter(u => u.id != user.id);
        let replyReactCount = reply.reaction.count - 1;
        reactionObj = {
          type: "like",
          users: usersArr,
          count: replyReactCount
        };
        let obj = {
          reply_id: reply.id,
          reaction: reactionObj,
          user_id: user.id
        };
        let objIndex = this.commentArr.findIndex(
          obj => obj.comment_id == reply.comment_id
        );
        let replyIndex = this.commentArr[objIndex].replies.findIndex(
          obj => obj.id == reply.id
        );
        this.commentArr[objIndex].replies[replyIndex].reaction = reactionObj;
        this.commentArr[objIndex].replies[replyIndex].selfLiked = false;
        await courseService.reactCommentReply(obj);
        await this.getComments();
        this.disableReact = false;
      }
    },
    reportComment(comment) {
      this.moreOptions = false;
      this.moreOptionsReply = false;
      this.toReportComment = true;
      this.toReportReply = false;
      this.$store.commit("setTyping", false);
      this.currentCommentId = comment.comment_id;
      this.currentComment = comment;
      this.currentReplyId =
        comment.replies.length != 0
          ? comment.replies[0].id
          : comment.comment_id;
    },
    reportCommentReply(reply, comment) {
      this.commentIds = comment.comment_id;
      this.moreOptions = false;
      this.$store.commit("setTyping", false);
      this.moreOptionsReply = false;
      this.toReportComment = false;
      this.toReportReply = true;
      this.isEdit = false;
      this.isEditReply = false;
      this.currentReply = reply;
      this.currentReplyId = reply.id;
    },
    reports(val, event) {
      if (event.target.checked === true) {
        this.reportCommentDescArr.push(val);
      } else {
        let ind = this.reportCommentDescArr.indexOf(val);
        let newArr = this.reportCommentDescArr.splice(ind, 1);
      }
    },
    async postReportComment() {
      this.disableBtn = true;
      let browserInfo = navigator.userAgent;
      let userInfoData = await this.loadGuestUserInfo();
      if (
        this.reportCommentDesc.length == 0 &&
        this.reportCommentDescArr.length == 0
      ) {
        this.disableBtn = false;
        return toastr.info("Please Specify The Problem.");
      }
      // if (this.reportCommentDesc.length > 0) {
      //   this.reportCommentDescArr.push(this.reportCommentDesc);
      // }
      let reportDesc = {
        report_des_arr: this.reportCommentDescArr
      };
      let obj = {
        comment_id: this.currentComment.comment_id,
        report_type: "comment",
        // reported_by: user ? user.id : null,
        // guest_user_ref: {
        //   browserInfo: browserInfo,
        //   userInfo: userInfoData
        // },
        report_desc: reportDesc,
        user_id: user.id,
        other_Issue: this.reportCommentDesc
      };
      this.toReportComment = false;
      this.currentReplyId = -1;
      this.toReportReply = false;
      this.isOtherOpt = false;
      let reportSent = await courseService.createReport(obj);
      if (reportSent.success) {
        toastr.info("Successfully reported");
      } else {
        toastr.error("Something went wrong!");
      }

      this.$store.commit("setTyping", true);
      this.reportCommentDescArr = [];
      this.reportCommentDesc = "";
      this.disableBtn = false;
    },
    async loadGuestUserInfo() {
      return await courseService.getUserInfo();
    },
    async postReplyReport() {
      this.disableBtn = true;
      if (
        this.reportCommentDesc.length == 0 &&
        this.reportCommentDescArr.length == 0
      ) {
        this.disableBtn = false;
        return toastr.info("Please Specify The Problem.");
      }
      let browserInfo = navigator.userAgent;
      let userInfoData = await this.loadGuestUserInfo();
      let reportDesc = {
        report_des_arr: this.reportCommentDescArr
      };
      let obj = {
        comment_id: this.commentIds,
        reply_id: this.currentReply.id,
        reported_by: user ? user.id : null,
        guest_user_ref: {
          browserInfo: browserInfo,
          userInfo: userInfoData
        },
        report_desc: reportDesc,
        is_reported: true,
        user_id: user.id,
        report_type: "comment",
        other_Issue: this.reportCommentDesc
      };
      this.toReportReply = false;
      this.toReportComment = false;
      this.reportCommentDesc = "";
      this.reportCommentDescArr = [];

      this.isOtherOpt = false;
      this.currentReplyId = -1;
      let reportSent = await courseService.createReport(obj);
      if (reportSent.success) {
        toastr.info("Successfully reported");
      } else {
        toastr.error("Something went wrong!");
      }
      this.disableBtn = false;
      this.$store.commit("setTyping", true);
    },
    async postReply() {
      if (this.replyText.length > 0) {
        let obj = {
          text: this.replyText,
          user_id: user.id,
          video_id: this.selectedVideo.id,
          notes_id: this.$route.query.notes,
          image_url: this.uploadedImgLink,
          is_toNotifyTeacher: this.toNotify,
          comment_id: this.currentComment.comment_id
        };
        let objIndex;
        if (!(this.uploadedImgLink.length > 0)) {
          let tempObj = obj;
          tempObj.time = new Date();
          tempObj.image = user.image;
          tempObj.user_name = user.full_name;
          objIndex = this.commentArr.findIndex(
            obj => obj.comment_id == this.currentComment.comment_id
          );
          this.commentArr[objIndex].replies.unshift(tempObj);
          this.getCommentLink();
          toastr.success("reply added successfully");
        } else {
          toastr.info("This comment needs to be approved!");
        }

        this.commentText = "";
        this.replyText = "";
        this.isImgUploaded = true;
        this.isEdit = false;
        this.isEditReply = false;
        this.toPost = false;
        this.toReply = false;
        this.currentReplyId = 0;
        let replyAdded = await courseService.addCommentReply(obj);
        if (replyAdded.data.success) {
          try {
            this.commentArr[objIndex].replies[0].id =
              replyAdded.data.replyAdded.id;
          } catch (error) {
            console.error(error);
          }

          this.selectedImage = null;
          this.uploadPercentage = 0;
          this.isImgUploaded = true;
          this.removeImg();
          this.uploadedImgLink = "";
          this.toNotify = false;
          this.$store.commit("setTyping", true);
          await this.getComments();
        } else {
          this.commentArr[objIndex].replies.shift();
          toastr.error("Oop! Something went wrong.Please try again.");
        }
      }
    },
    async postComment() {
      if (this.commentText.length > 0) {
        let txt = this.commentText;
        let obj = {
          text: txt,
          user_id: user.id,
          video_id: this.selectedVideo.id,
          notes_id: this.$route.query.notes,
          image_url: this.uploadedImgLink,
          user_name: user.full_name ? user.full_name : user.name,
          is_toNotifyTeacher: this.toNotify
        };
        if (!(this.uploadedImgLink.length > 0)) {
          this.addCommentAsap(obj);
          toastr.success("Comment added successfully");
        } else {
          toastr.info("This comment needs to be approved!");
        }
        this.commentText = "";
        this.replyText = "";
        this.isImgUploaded = true;
        this.isEdit = false;
        this.isEditReply = false;
        this.toPost = false;
        document.getElementById("1-t").blur();
        let commentAdded = await courseService.addComment(obj);
        if (commentAdded.success) {
          this.commentArr[0].id = commentAdded.addedComment.id;
          this.commentArr[0].comment_id = commentAdded.addedComment.id;
          this.commentArr[0].user_name = user.full_name;
          this.selectedImage = null;
          this.uploadPercentage = 0;
          this.isImgUploaded = true;
          this.removeImg();
          this.uploadedImgLink = "";
          this.toNotify = false;
          await this.getComments();
          this.$store.commit("setTyping", true);
        } else {
          this.commentArr.shif();
          toastr.error("Oop! Something went wrong.Please try again.");
        }
      }
    },
    addCommentAsap(obj) {
      if (obj.text.length > 0) {
        let tempObj = obj;
        tempObj.time = new Date();
        tempObj.image = user.image;
        tempObj.user_name = user.name;
        tempObj.replies = [];
        this.commentArr.unshift(tempObj);
        this.commentText = "";
        this.getCommentLink();
        // this.commentArr.sort(function(a, b) {
        //   return new Date(b.time) - new Date(a.time);
        // });
      }
    },
    getCommentLink() {
      this.commentArr.forEach(comment => {
        comment.text_ = this.formatTextforLink(comment.text);
        if (comment.replies.length > 0) {
          comment.replies.forEach(reply => {
            if (reply.image_url && reply.image_url.endsWith(".pdf")) {
              reply.pdf = reply.image_url;
              reply.image_url = "";
            }
            reply.text_ = this.formatTextforLink(reply.text);
          });
        }
      });
    },
    async onScroll() {
      if (this.isNext) {
        this.getComments();
      }
    },
    async getComments(first) {
      if (first) this.commentArr = [];
      this.currentUser = user;
      if (!this.currentUser.image) {
        this.currentUser.image = "";
      }
      let data = {
        page: this.pageNo,
        perPage: 10
      };
      let result = await courseService.getComments(
        user.id,
        this.selectedVideo.id,
        data.page,
        data.perPage,
        this.$route.query.notes,
          this.selectedVideo.live_session_id
      );
      if (result.success) {
        this.pageNo++;
        // this.commentArr = result.comments;
        this.commentArr.push(...result.comments);
        this.getCommentLink();
        this.sortComment(this.currentOrder);
        this.checkIfSelfLiked();
        if (result.length === 0) {
          this.isNext = false;
          this.isToLoadMore = false;
        }
      }
    },
    async sortComment(sortId) {
      if (sortId == 1) {
        this.currentOrder = 1;
        this.commentArr = this.commentArr?.sort(function(a, b) {
          return (
            b.replies.length +
            (((b || {}).reaction || {}).count || 0) -
            (a.replies.length + (((a || {}).reaction || {}).count || 0))
          );
        });
      } else {
        this.currentOrder = 0;
        this.commentArr?.sort(function(a, b) {
          return new Date(b.time) - new Date(a.time);
        });
      }
    },
    async handleKeyboard(event) {
      switch (event.keyCode) {
        case 13:
          if (this.toPost) {
            await this.postComment();
          } else if (this.toReply) {
            await this.postReply();
          }
          break;
      }
      if (this.toPost || this.toReply) {
        this.$store.commit("setTyping", false);
      } else {
        this.$store.commit("setTyping", true);
      }
    },
    checkIfSelfLiked() {
      this.commentArr.forEach(comment => {
        if ((((comment || {}).reaction || {}).users || []).length > 0) {
          (((comment || {}).reaction || {}).users || []).forEach(u => {
            if (u.id == this.currentUser.id) {
              comment.selfLiked = true;
            } else {
              comment.selfLiked = false;
            }
          });
        }
        if (((comment || {}).replies || []).length > 0) {
          ((comment || {}).replies || []).forEach(rep => {
            if ((((rep || {}).reaction || {}).users || []).length > 0) {
              (((rep || {}).reaction || {}).users || []).forEach(usr => {
                if (usr.id == this.currentUser.id) {
                  rep.selfLiked = true;
                } else {
                  rep.selfLiked = false;
                }
              });
            }
          });
        }
      });
    },
    formatTextforLink(text) {
      if (!text) return text;
      let newText = text.replace(/(https?:\/\/[^\s]+)/g, url => {
        return `<a target="_blank" style="margin-bottom: 5px;" href="${url}">${url}</a>`;
      });
      return newText;
    }
  },
  async mounted() {
    document.addEventListener("keydown", this.handleKeyboard);
    var window_ = window.innerWidth;
    if (window_ < 600) {
      this.showComments = false;
    }
    user = customStorageService.getUser();
    await this.getComments(true);
    this.checkIfSelfLiked();
    this.isPageLoading = false;
  },
  watch: {
    selectedVideo: function(newVal, oldVal) {
      this.pageNo = 1;
      newVal;
      oldVal;
      this.cancelToRestore();
      this.getComments(true);
      this.checkIfSelfLiked();
    }
  }
};
</script>
<style src="./comments.css" scoped></style>

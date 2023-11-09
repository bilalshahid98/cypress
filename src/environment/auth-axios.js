const axiosTracking = require("axios");

const currentUrl = process.env.VUE_APP_AUTH_SERVICE_URL;

export default axiosTracking.create({
  baseURL: currentUrl
});

class VibrationService {
  vibrate(duration = 200) {
    window.navigator.vibrate(duration);
  }
}
export default new VibrationService();

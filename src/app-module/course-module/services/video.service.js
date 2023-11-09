import { lmsBackend } from "../../../environment/environment";

export const createAudioContext = mediaElem => {
  try {
    var context = new (window.AudioContext || window.webkitAudioContext)(),
      result = {
        context: context,
        source: context.createMediaElementSource(mediaElem),
        gain: context.createGain(),
        media: mediaElem,
        amplify: function(multiplier) {
          result.gain.gain.value = multiplier;
        },
        getAmpLevel: function() {
          return result.gain.gain.value;
        }
      };
    return result;
  } catch (err) {
    return new Error(err);
  }
};

export const getVimeoVideoQualities = vid =>
  lmsBackend.get(`/cvideos/getVssLink?vid=${vid}`);

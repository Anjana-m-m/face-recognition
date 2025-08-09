

const video = document.getElementById('video');

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  );
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  // Position the canvas exactly over the video
  const updateCanvasPosition = () => {
    const box = video.getBoundingClientRect();
    canvas.style.position = 'absolute';
    canvas.style.top = `${box.top + window.scrollY}px`;
    canvas.style.left = `${box.left + window.scrollX}px`;
    canvas.width = box.width;
    canvas.height = box.height;
    faceapi.matchDimensions(canvas, { width: box.width, height: box.height });
  };

  updateCanvasPosition();
  window.addEventListener('resize', updateCanvasPosition);

  setInterval(async () => {
    const videoBox = video.getBoundingClientRect();
    const displaySize = { width: videoBox.width, height: videoBox.height };

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    if (detections.length > 0) {
      const expressions = detections[0].expressions;
      const maxEmotion = Object.keys(expressions).reduce((a, b) =>
        expressions[a] > expressions[b] ? a : b
      );

      let message = "";
      switch (maxEmotion) {
        case "happy":
          message = "You look happier than a potato in a french fry factory! 🥔🍟";
          break;
        case "sad":
          message = "Why so glum, chum? You look like a potato left out in the rain. 🌧️";
          break;
        case "angry":
          message = "Whoa! Someone stole your fries? 🍟😡";
          break;
        default:
          message = `Hmm... you look ${maxEmotion} right now.`;
      }
      document.getElementById("funny-message").innerText = message;
    }
  }, 100);
});


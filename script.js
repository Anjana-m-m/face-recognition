

const video = document.getElementById('video');

const sadImage=["imags/sad1.jpg","imags/sad2.jpg","imags/sad3.jpeg"];
let imgElement = document.getElementById("displayImage");
// const happyText = [
//   "Someone’s clearly been paid today!",
//   "That’s the smile of a person who’s hiding from responsibilities.",
//   "Looking way too happy for someone at a make-a-thon.",
//   "Calm down, it’s not even free pizza yet.",
//   "That smile says: ‘I actually tested my code.’"
// ];

// const angryText = [
//   "Whoa, did GitHub delete your repo?",
//   "Looks like someone’s merge conflict just got personal.",
//   "Are you mad at the code or at life?",
//   "That’s the face of someone who just found 100+ bugs.",
//   "Deep breaths… the compiler can smell fear."
// ];

// const sadText = [
//   "Did your code run once… and never again?",
//   "Someone just lost a semicolon.",
//   "Looks like you debugged for 3 hours and it was a typo.",
//   "Who hurt you… was it Java?",
//   "That’s the expression of someone reading their own old code."
// ];

// const surprisedText = [
//   "Wow, it actually compiled on the first try!",
//   "Did the code… just work?",
//   "That’s the look of a developer who found a feature they didn’t write.",
//   "When you realize you pushed to main by accident.",
//   "Shocked… but also kind of impressed."
// ];

// const neutralText = [
//   "The face of someone whose code neither works nor fails — it just exists.",
//   "Emotion not found. Please check the API.",
//   "Probably just waiting for npm install to finish.",
//   "Internally screaming.",
//   "When you’ve accepted your fate."
// ];
let currentIndex = 0;
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
          message =" way too happy for someone at a make-a-thon.";
          imgElement.src ="imags/happy1.jpg"
          break;
        case "sad":
          message = "Looks like you debugged for 3 hours and it was a typo.";
          imgElement.src = "imags/sad1.jpg"
          break;
        case "angry":
          message = "Are you mad at the code or at life?";
          imgElement.src = "imags/angry1.jpg"
          break;
        case "surprised":
          message = "That’s the look of a developer who found a feature they didn’t write.";
          imgElement.src = "imags/surprise1.jpg"
          break;
        case "neutral":
          message = "Probably just waiting for npm install to finish.";
          imgElement.src = "imags/neutral1.jpg"
          break;
        default:
          message = `Hmm... you look ${maxEmotion} right now.`;
          imgElement.src = "imags/sad3.jpeg"
      } 
      
      document.getElementById("funny-message").innerText = message;
  
    }
  }, 100);
});


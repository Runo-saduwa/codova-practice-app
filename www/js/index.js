
import * as Comlink from "./comlink.js";

//import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";
console.log(Comlink)
const imageList = document.querySelector("#imageList");
const galleryLabel = document.querySelector("#galleryLabel");
const cityElem = document.querySelector(".city");
const descElem = document.querySelector(".weather_description");
const temperature = document.querySelector(".temparature");
const cameraPreview = document.querySelector("#camera_preview");

let app = {
  state: {
    images: [],
  },
  setImages: function (oldImages, newImage) {
    console.log(oldImages, newImage);
    app.state.images = [...oldImages, newImage];
    return app.state.images;
  },

  takePhoto: function () {
    let options = {
      quality: 80,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.CAMERA,
      mediaType: Camera.MediaType.PICTURE,
      encodingType: Camera.EncodingType.JPEG,
      cameraDirection: Camera.Direction.BACK,
    };
    navigator.camera.getPicture(app.cameraSuccess, app.cameraFailure, options);
  },

  cameraSuccess: function (imgUri) {
    app.addImageToDOM(imgUri);

    const images = app.setImages(app.state.images, imgUri);

    app.saveImages(images);
  },

  cameraFailure: function (msg) {
    console.log(message);
  },

  geolocationSuccess: function (position) {
    console.log(position.coords.latitude, position.coords.longitude);
    // alert(
    //   `${position.coords.latitude}, ${position.coords.longitude}`,
    // );
    app.getWeatherForcast(position.coords.latitude, position.coords.longitude);
  },

  geolocationFailure: function (error) {
    console.log(error);
  },

  getCoordinates: function () {
    navigator.geolocation.getCurrentPosition(app.geolocationSuccess, app.geolocationFailure);
  },

  getWeatherForcast: function (latitude, longitude) {
    var API_KEY = "5091cb02bf879588202963354cf12adc";
    fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`)
      .then((response) => response.json())
      .then((data) => {
        cityElem.textContent = data.name;
        descElem.textContent = data.weather[0].description;
        temperature.textContent = `${(data.main.temp - 273.15).toFixed(2)}°C`;
      })
      .catch((e) => console.log(e));
  },

  addImageToDOM: function (imgUri) {
    if (galleryLabel.classList.contains("hide")) {
      galleryLabel.classList.remove("hide");
      galleryLabel.classList.add("show");
    }
    const imageFrame = document.createElement("div");
    const imageElement = document.createElement("img");

    imageElement.src = imgUri;
    imageFrame.classList.add("image_frame");

    imageFrame.appendChild(imageElement);
    imageList.insertBefore(imageFrame, imageList.firstChild);
  },

  saveImages: function (images) {
    if (!localStorage.getItem("imageUriList") || localStorage.getItem("imageUriList").length === 0) {
      localStorage.setItem("imageUriList", JSON.stringify(images));
    } else {
      const storedImages = JSON.parse(localStorage.getItem("imageUriList"));
      updatedStoredImages = [...storedImages, ...images];
      localStorage.setItem("imageUriList", JSON.stringify(updatedStoredImages));
    }
  },

  renderStoredImages: function () {
    const storedImages = JSON.parse(localStorage.getItem("imageUriList"));
    storedImages.forEach((imgUri) => app.addImageToDOM(imgUri));
    cordova.plugins.notification.local.schedule({
      title: "TEXTRAS",
      text: "Welcome back to the app, take some fire shots 🔥...",
      foreground: true,
    });
  },

  startCameraBelow: function () {
    CameraPreview.startCamera({
      x: 0,
      y: 0,
      tapPhoto: true,
      camera: CameraPreview.CAMERA_DIRECTION.BACK,
      previewDrag: false,
      toBack: true,
      storeToFile: true
    });
  },

  stopCamera: function () {
    CameraPreview.stopCamera();
  },

  takePicture: function () {
    CameraPreview.takePicture((img) => {
      document.querySelector("#placeholder").src = img;
      app.cameraSuccess(img);
    }, app.cameraFailure);
  },

  switchCamera: function () {
    CameraPreview.switchCamera();
  },

  copyLogs: function () {
    NativeLogs.getLog(1000,true, app.copyLogsSucess)
  },
  copyLogsSucess: function (logs) {
    document.querySelector("#logBtn").textContent = 'Copied!'
    setTimeout(() => {
      document.querySelector("#logBtn").textContent = 'copy logs to cliplboard'
    }, 1000)
  },

  createObserver: function () {
    let observer;
    let options = {
      root: null,
      rootMargin: "0px",
      threshold: [0, 0.05, 0.25]
    };

    observer = new IntersectionObserver(app.handleIntersection, options);

    observer.observe(cameraPreview);
  },

  handleIntersection: function(entries, observer) {
   entries.forEach(entry => entry.intersectionRatio >= 0.05 ? app.startCameraBelow() : app.stopCamera())
  },

  initialize: function () {
    document.addEventListener("deviceready", app.init);
  },

  init: async function () {
    document.querySelector("#cameraBtn").addEventListener("click", app.takePhoto);
    document.querySelector("#switch_camera_btn").addEventListener("click", app.switchCamera)
    document.querySelector("#snap_button").addEventListener("click", app.takePicture)
    document.querySelector("#placeholder_btn").addEventListener("click", () => {})
    document.querySelector("#logBtn").addEventListener("click", app.copyLogs)

   // app.createObserver();

   app.startCameraBelow()
    galleryLabel.classList.add("hide");
   // app.getCoordinates();

    if (localStorage.getItem("imageUriList")) {
      app.renderStoredImages();
    }

    const testClass = Comlink.wrap(new Worker('./worker.js', { type: "module" }));

    const instance = await new testClass();

    await instance.logSomething()
  },


};

app.initialize();

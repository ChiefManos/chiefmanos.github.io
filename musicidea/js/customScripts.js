// Global namespace
window.siteGV = window.siteGV || {};

$(document).ready(function () {

  // Globals
  siteGV.ZeroAnimationTimeout = 0;
  siteGV.CommonAnimationTimeout = 250;
  siteGV.ExtraLongAnimationTimeout = 5000;

  // Ready scoped elements
  const mobileMenuButton = document.getElementById("mobile-menu-button-id");
  const userLoginDecorative = document.getElementById("user-login-decorative-id");
  const quickLanguageButton = document.getElementById("quick-languages-id");

  // User login bubble
  userLoginDecorative.addEventListener('click', function(event) {

    const decorative = event.currentTarget;
    const real = document.getElementById("user-login-id");
    const usernameInput = real.querySelector("input#uname");
    
    decorative.classList.toggle("c-visible");
    real.classList.toggle("c-visible");
    setTimeout(() => {
      usernameInput?.focus();
    }, siteGV.CommonAnimationTimeout);

  });

  // Global Event Listener: Click
  document.addEventListener('click', function(event) {

    const target = event.target;

    // User login bubble minize
    if (userLoginDecorative?.classList.contains("c-visible")) {

      const real = document.getElementById("user-login-id");

      if (!userLoginDecorative.contains(target) && !real.contains(target)) {

        userLoginDecorative.classList.remove("c-visible");
        real.classList.remove("c-visible");

      }
      
    }

    if (quickLanguageButton?.classList.contains("c-clicked") && !target.closest(".quick-languages-wrapper")) {
      quickLanguageButton.classList.remove("c-clicked");
    }
    
  });

  // Preview Video
  const video = document.getElementById("video-preview-item-id");
  if (video != null) {

    videoElement = document.createElement('video').canPlayType;
    var supportsVideo = !!videoElement;
    if (supportsVideo) {
  
      // const videoContainer = document.getElementById("videoContainer");
      const playButtonDeco = document.getElementById("preview-play-button-id");
      const playPause = document.getElementById("preview-overlay-id");
      
      video.controls = false;
      
      playPause.addEventListener("click", (e) => {
          if (video.paused || video.ended) {
            video.play();
            playButtonDeco.style.transform = "scale(0.5)";
            playButtonDeco.style.opacity = "0";
          } else {
            video.pause();
            playButtonDeco.style.opacity = "1";
            playButtonDeco.style.transform = "scale(1)";
          }
        });
      
      }

  }

  // Guitar String Notes
  const audioLowE = document.getElementById("audio-note-low-e");
  if (audioLowE != null) {

    var supportsAudio = !!document.createElement('audio').canPlayType;
    if (supportsAudio) {
    

      const playPauseLowE = document.getElementById("invoke-audio-note-low-e");
      const audioA = document.getElementById("audio-note-a");
      const playPauseA = document.getElementById("invoke-audio-note-a");
      const audioD = document.getElementById("audio-note-d");
      const playPauseD = document.getElementById("invoke-audio-note-d");
      const audioG = document.getElementById("audio-note-g");
      const playPauseG = document.getElementById("invoke-audio-note-g");
      const audioB = document.getElementById("audio-note-b");
      const playPauseB = document.getElementById("invoke-audio-note-b");
      const audioHighE = document.getElementById("audio-note-high-e");
      const playPauseHighE = document.getElementById("invoke-audio-note-high-e");
    
      audioLowE.controls = false;
      audioLowE.volume = 0.3;
      audioA.controls = false;
      audioA.volume = 0.3;
      audioD.controls = false;
      audioD.volume = 0.3;
      audioG.controls = false;
      audioG.volume = 0.3;
      audioB.controls = false;
      audioB.volume = 0.3;
      audioHighE.controls = false;
      audioHighE.volume = 0.3;
    
      playPauseLowE.addEventListener("click", (e) => {
        if (audioLowE.paused || audioLowE.ended) audioLowE.play();
      });

      playPauseA.addEventListener("click", (e) => {
        if (audioA.paused || audioA.ended) audioA.play();
      });

      playPauseD.addEventListener("click", (e) => {
        if (audioD.paused || audioD.ended) audioD.play();
      });

      playPauseG.addEventListener("click", (e) => {
        if (audioG.paused || audioG.ended) audioG.play();
      });

      playPauseB.addEventListener("click", (e) => {
        if (audioB.paused || audioB.ended) audioB.play();
      });

      playPauseHighE.addEventListener("click", (e) => {
        if (audioHighE.paused || audioHighE.ended) audioHighE.play();
      });

    }
    
  }

  if (quickLanguageButton) {
    handleQuickLanguageButton(quickLanguageButton);
  }

  if (mobileMenuButton) {
    handleMobileMenuButton(mobileMenuButton);
  }

  const formsList = document.querySelectorAll("form");
  formsList.forEach(form => clearForm(form));

}); // ################################################- End ready -################################################

function handleMobileMenuButton(mobileMenuButton) {
  mobileMenuButton.addEventListener('click', function() {
    const htmlElement = document.documentElement;
    const isHtmlScrolledTop = htmlElement.scrollTop === 0;
    setTimeout(() => htmlElement.classList.toggle("mobile-menu-visible"), !isHtmlScrolledTop ? siteGV.CommonAnimationTimeout : siteGV.ZeroAnimationTimeout);
    htmlElement.scrollTop = 0;
  });
}

function handleQuickLanguageButton(quickLanguageButton) {
  quickLanguageButton.addEventListener('click', function() {
    quickLanguageButton.classList.toggle("c-clicked");
  });
}

function handleIncreaseNumber(numberInput) {

  if (numberInput.value === "") {
    numberInput.value = parseInt(numberInput.getAttribute("data-min") ?? "0") + 1;
    return;
  }

  const currentNumber = parseInt(numberInput.value);
  numberInput.value = isNaN(currentNumber) ? 1 : Math.ceil(currentNumber + 0.01);

  const inputMode = numberInput.getAttribute("inputmode");
  if (inputMode === "decimal") {
    numberInput.value = Number(numberInput.value).toFixed(2);
  }

  blurThenFocus(numberInput);

}

function handleDecreaseNumber(numberInput) {

  if (numberInput.value === "") {
    numberInput.value = numberInput.getAttribute("data-min") ?? 0;
    return;
  }

  const currentNumber = parseInt(numberInput.value);
  numberInput.value = currentNumber > 0 ? Math.floor(currentNumber - 0.01) : 0;

  const inputMode = numberInput.getAttribute("inputmode");
  if (inputMode === "decimal") {
    numberInput.value = Number(numberInput.value).toFixed(2);
  }

  blurThenFocus(numberInput);

}

function infoCardActivate(int) {

  stringConstruct = "info-card-";
  stringFinal = stringConstruct + int;

  const infoCard = document.getElementById(stringFinal);

  infoCard.style.visibility = "visible";
  infoCard.style.opacity = "1";
  infoCard.style.height = "100%";

}

function infoCardDeactivate(int) {

  stringConstruct = "info-card-";
  stringFinal = stringConstruct + int;

  const infoCard = document.getElementById(stringFinal);

  infoCard.style.visibility = "hidden";
  infoCard.style.opacity = "0";
  infoCard.style.height = "0";

}

function clearForm(form) {
  form.reset();
}

function cClearTimeout(element) {
  if (element.customTimeout) {
    clearTimeout(element.customTimeout);
  }
}

// Global namespace
window.siteGV = window.siteGV || {};

$(document).ready(function () {

  siteGV.ActiveSection = "landing";
  siteGV.ZeroAnimationTimeout = 0;
  siteGV.CommonAnimationTimeout = 200;
  siteGV.MediumAnimationTimeout = 350;
  siteGV.LongAnimationTimeout = siteGV.NudgeAnimationTimeout = 500;

  const fullscreenWindow = document.getElementById("fullscreen-window-id");
  const fullscreenableImagesList = document.querySelectorAll('[data-can-fullscreen="true"]');
  const frontpageUnique = document.body.classList.contains("frontpage");
  const mobileMenuButton = document.getElementById("mobile-menu-button-id");
  const scheduleAppUnique = document.querySelector("body.schedule.inner-page #section-schedule-id");

  fullscreenWindow.addEventListener('click', handleToggleFullscreen);
  window.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
      handleCloseFullscreen();
    }
  });
  window.addEventListener('click', popBubbles);

  fullscreenableImagesList.forEach(imageWrapper => {
    function handleClickCallback() {
      handleFullscreenImage(imageWrapper);
    }
    addManagedEventListener(imageWrapper, 'click', handleClickCallback);
  });

  if (frontpageUnique) {

    const headerCategories = document.querySelectorAll("header .category-item");
    const sectionItemsList = document.querySelectorAll("main .section-item");
    const itemsProduceBubblesList = document.querySelectorAll('[data-will-produce-bubbles="true"]');
    const terrariumIsland = document.getElementById("terrarium-island");
    const terrariumIslandScrollable = terrariumIsland.querySelector("img");
    const terrariumFish = document.getElementById("terrarium-fish");
    const terrariumFishScrollable = terrariumFish.querySelector("img");
    let currentScroll = document.documentElement.scrollTop;
    let nextScroll = currentScroll;
    let ceaseBubbles = false;
    function scrolledUp() {
      return currentScroll < nextScroll;
    }
    function handleChangeActiveSection() {
      let found = false;
      for (let sectionItem of sectionItemsList) {

        const sectionItemRect = sectionItem.getBoundingClientRect();
        found = Math.abs(sectionItemRect.top) < sectionItemRect.height / 2;

        if (found) {
          siteGV.ActiveSection = sectionItem.getAttribute("data-section-name");
          document.body.setAttribute("data-active-section", siteGV.ActiveSection);
          break;
        }

      }
    }
    function scrollTerrariums() {

      if (siteGV.ActiveSection !== "contact") {
        return;
      }

      const hasScrolledUp = scrolledUp();
      const currentShift = parseInt(terrariumIslandScrollable.style.left.split("px").join(""));
      const shiftAmount = hasScrolledUp
        ? Math.min(currentShift + 1, 234)
        : Math.max(currentShift - 1, 0);

      terrariumIslandScrollable.style.left = `${shiftAmount}px`;
      terrariumFishScrollable.style.right = `${shiftAmount}px`;

    }

    headerCategories.forEach(category => {
      const categoryAnchorId = category.getAttribute("href").split("#").join("");
      const categorySection = document.getElementById(categoryAnchorId);
      category.addEventListener('click', function(event) {
        event.preventDefault();
        scrollToAnchor(categorySection);
      });
    });

    const forceOriginBox = true;
    const minAwait = siteGV.LongAnimationTimeout * 10;
    const maxAwait = siteGV.LongAnimationTimeout * 15
    itemsProduceBubblesList.forEach((item, index) => {
      setTimeout(async function() {
        while(!ceaseBubbles) {
          await new Promise(r => setTimeout(r, getRandomInt(minAwait, maxAwait)));
          popBubbles(item, forceOriginBox);
        }
      }, (siteGV.CommonAnimationTimeout * index));
    });

    document.addEventListener('scroll', function() {
      nextScroll = document.documentElement.scrollTop;
      handleChangeActiveSection();
      scrollTerrariums()
      currentScroll = nextScroll;
    });

    // Permanent observer for gallery items (scroll reveal)
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle("c-visible", entry.isIntersecting);
      });
    });
    const galleryItems = document.querySelectorAll("#section-gallery-id .body-items .body-item");
    galleryItems.forEach(item => {
      observer.observe(item);
    });

    setTimeout(() => {
      handleChangeActiveSection();
    }, siteGV.CommonAnimationTimeout);

  }

  mobileMenuButton?.addEventListener('click', function() {
    handleToggleMobileMenu();
  });

  if (scheduleAppUnique) {
    handleScheduleAppEvents();
  }

  setTimeout(() => document.documentElement.scrollTop = 0, siteGV.ZeroAnimationTimeout);

}); /* ################################################ Ready end ################################################ */

function handleScheduleAppEvents() {

  const scheduleAppUnique = document.querySelector("body.schedule.inner-page #section-schedule-id");
  const continueButton = scheduleAppUnique.querySelector(".continue-button");
  const inputContainersListStage0 = scheduleAppUnique.querySelectorAll('[data-stage="0"] .group-item .item-input');
  const inputContainersListStage1 = scheduleAppUnique.querySelectorAll('[data-stage="1"] .group-item .item-input');
  const inputContainersListStage2 = scheduleAppUnique.querySelectorAll('[data-stage="2"] .group-item .item-input');
  let currentStage = getCurrentStage();
  let currentInputContainersList = getCurrentStageInputContainers();
  function getCurrentStage() {
    const stage = parseInt(scheduleAppUnique.getAttribute("data-current-stage"));
    return !isNaN(stage)
      ? stage
      : 0;
  }
  function handleButtonText() {
    const continueButtonTextElement = continueButton.querySelector(".button-text");
    continueButtonTextElement.textContent = currentStage === 2
      ? continueButton.getAttribute("data-text-finish")
      : continueButton.getAttribute("data-text-next");
  }
  function increaseStage() {
    const stage = getCurrentStage();
    currentStage = stage + 1;
    scheduleAppUnique.setAttribute("data-current-stage", currentStage);
    handleButtonText();
    updateCurrentStageInputContainers();
  }
  function updateCurrentStageInputContainers() {
    currentInputContainersList = getCurrentStageInputContainers();
  }
  function getCurrentStageInputContainers() {
    switch (getCurrentStage()) {
      case 0:
        return inputContainersListStage0;
      case 1:
        return [...inputContainersListStage0, ...inputContainersListStage1];
      case 2:
        return [...inputContainersListStage0, ...inputContainersListStage1, ...inputContainersListStage2];
      default:
        return [];
    }
  }
  function isStageValid() {
    for (let container of currentInputContainersList) {
      const input = container.querySelector("select, input");
      switch (input.nodeName) {
        case "INPUT":
          if (!input.validity.valid) {
            return false;
          }
          break;
        case "SELECT":
          if (parseInt(input.options[input.selectedIndex].value) === 0) {
            return false;
          }
          break;
      }
    }
    return true;
  }
  function handleFinalStage() {

    const ticketWrapper = scheduleAppUnique.querySelector('.group-items[data-stage="3"] .ticket-model-wrapper');
    const ticketNameElement = ticketWrapper.querySelector(".ticket-name");
    const ticketLocationElement = ticketWrapper.querySelector(".ticket-detail.ticket-location .detail-value");
    const ticketValidFromElement = ticketWrapper.querySelector(".ticket-detail.ticket-date .detail-value");
    const ticketCodeElement = ticketWrapper.querySelector(".ticket-code .code-value");
    const scheduleLocationInput = document.getElementById("schedule-location");
    const scheduleLocation = scheduleLocationInput.options[scheduleLocationInput.selectedIndex].text;
    const scheduleDate = document.getElementById("schedule-date").value;
    const scheduleFullName = document.getElementById("schedule-full-name").value.trim();

    const fullNameCharacters = scheduleFullName.split(" ").join("").split("");
    let ticketCode = "";
    for (let character of fullNameCharacters) {

      if (ticketCode.length >= 13) {
        break;
      }
  
      ticketCode += character;

    }

    ticketNameElement.textContent = scheduleFullName;
    ticketLocationElement.textContent = scheduleLocation;
    ticketValidFromElement.textContent = scheduleDate;
    ticketCodeElement.textContent = `${ticketCode}${Date.now()}`;

  }

  continueButton.addEventListener('click', function() {

    if (!isStageValid()) {

      const timeout = siteGV.CommonAnimationTimeout / 3;
      let lastInvalidContainer;
      let lastInvalidInput;
      for (let container of currentInputContainersList) {
        if (container.classList.contains("ifta-valid")) {
          continue;
        }
        const input = container.querySelector("select, input");
        blurThenFocus(input);
        setTimeout(() => {
          if (container.classList.contains("ifta-invalid")) {
            lastInvalidContainer = container;
            lastInvalidInput = input;
          }
        }, timeout);
      }
      setTimeout(() => {
        lastInvalidContainer?.classList.contains("ifta-invalid") && (blurThenFocus(lastInvalidInput));
      }, timeout);

      nudge(continueButton);

      return;

    }

    increaseStage();
    
    if (currentStage === 3) {
      handleFinalStage();
    }

  });

  const iftaLabelGroupsList = scheduleAppUnique.querySelectorAll(".ifta-label-group");
  iftaLabelGroupsList.forEach(group => {
    handleIftaLabelGroup(group);
  });

}

function handleToggleMobileMenu() {

  const mobileMenuButton = document.getElementById("mobile-menu-button-id");
  const mobileMenuWrapper = mobileMenuButton.closest(".menu-button-wrapper");

  mobileMenuWrapper.classList.toggle("c-clicked");

}

function popBubbles(event, forceOriginBox = false) {

  const targetContainer = !forceOriginBox
    ? event.target.closest(".section-item, footer")
    : event;
  if (!targetContainer) {
    return;
  }

  const isOriginBox = !forceOriginBox
    ? event.target.closest("select, input") // Clicked targets that don't announce client-xy position, or where bubbles should lock on regardless
    : event;
  const originBoxRect = isOriginBox?.getBoundingClientRect();
  const targetContainerRect = targetContainer.getBoundingClientRect();
  const originX = isOriginBox
    ? !forceOriginBox
      ? originBoxRect.left + (originBoxRect.width / 2)
      : originBoxRect.width / 2
    : Math.abs(targetContainerRect.left - event.clientX);
  const originY = isOriginBox
    ? Math.abs(targetContainerRect.top - originBoxRect.top)
    : Math.abs(targetContainerRect.top - event.clientY);
  const bubbles = 5;
  const bubbleSpread = 20;
  const bubbleSizeMin = 8;
  const bubbleSizeMax = 18;
  let isBubbling = true;

  for (let i = 0; i <= bubbles; i++) {

    const bubble = document.createElement("div");
    const bubbleX = getRandomInt(originX - bubbleSpread, originX + bubbleSpread);
    const bubbleY = getRandomInt(originY - bubbleSpread, originY + bubbleSpread);
    const bubbleSize = getRandomInt(bubbleSizeMin, bubbleSizeMax);
    const bubbleDriftLeft = getRandomInt(0, 1) === 0; // 50/50 chance for a bubble to drift left or right

    bubble.classList.add("bubble");
    bubble.classList.toggle("bubble-alternative", !targetContainer.classList.contains("section-item-alternative"));
    bubble.style.left = `${bubbleX}px`;
    bubble.style.top = `${bubbleY}px`;
    bubble.style.width = `${bubbleSize}px`;
    bubble.style.height = `${bubbleSize}px`;

    targetContainer.appendChild(bubble);

    // Parallel worker for bubble drift
    setTimeout(async function() {
      while(isBubbling) {
        await new Promise(r => setTimeout(r, siteGV.CommonAnimationTimeout / 4));
        const oldLeft = parseInt(bubble.style.left.split("px").join(""));
        const oldTop = parseInt(bubble.style.top.split("px").join(""))
        bubble.style.left = `${bubbleDriftLeft ? oldLeft - getRandomInt(0, 2) : oldLeft + getRandomInt(0, 2)}px`;
        bubble.style.top = `${oldTop - getRandomInt(0, 5)}px`
      }
    }, siteGV.ZeroAnimationTimeout);

    setTimeout(() => {
      bubble.remove();
      isBubbling = false;
    }, siteGV.LongAnimationTimeout);

  }

}

function handleFullscreenImage(imageWrapper) {

  handleToggleFullscreen();

  const fullImageSizePath = imageWrapper.getAttribute("data-image-large-path");
  const imageAlt = imageWrapper.querySelector("img").alt;
  const fullscreenWindow = document.getElementById("fullscreen-window-id");
  const fullscreenWindowContentWrapper = fullscreenWindow.querySelector(".fullscreen-content");
  const content = document.createElement("img");

  content.src = fullImageSizePath;
  content.alt = imageAlt;

  fullscreenWindowContentWrapper.appendChild(content);

}

function handleToggleFullscreen() {

  const fullscreenWindow = document.getElementById("fullscreen-window-id");
  const fullscreenWindowContentWrapper = fullscreenWindow.querySelector(".fullscreen-content");
  const existingContent = fullscreenWindowContentWrapper.querySelectorAll("img");

  document.documentElement.style.paddingRight = null;

  const currentDocumentWidth = document.documentElement.getBoundingClientRect().width;

  document.documentElement.classList.toggle("has-fullscreen");
  !document.documentElement.classList.contains("has-fullscreen") && (setTimeout(() => existingContent.forEach(content => content.remove()), siteGV.CommonAnimationTimeout));

  const newDocumentWidth = document.documentElement.getBoundingClientRect().width;

  currentDocumentWidth < newDocumentWidth && (document.documentElement.style.paddingRight = `${newDocumentWidth - currentDocumentWidth}px`);

}

function handleCloseFullscreen() {

  const fullscreenWindow = document.getElementById("fullscreen-window-id");
  const fullscreenWindowContentWrapper = fullscreenWindow.querySelector(".fullscreen-content");
  const existingContent = fullscreenWindowContentWrapper.querySelectorAll("img");

  document.documentElement.style.paddingRight = null;
  document.documentElement.classList.remove("has-fullscreen");
  setTimeout(() => existingContent.forEach(content => content.remove()), siteGV.CommonAnimationTimeout);

}

function nudge(element) {
  element?.classList.add("nudge-animation");
  setTimeout(() => {
    element?.classList.remove("nudge-animation");
  }, siteGV.NudgeAnimationTimeout);
}

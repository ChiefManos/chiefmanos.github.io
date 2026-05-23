// Global namespace
window.siteGV = window.siteGV || {};

$(document).ready(function () {

  siteGV.ActiveSection = "landing";
  siteGV.ZeroAnimationTimeout = 0;
  siteGV.CommonAnimationTimeout = 200;
  siteGV.MediumAnimationTimeout = 350;
  siteGV.LongAnimationTimeout = siteGV.NudgeAnimationTimeout = siteGV.BounceAnimationTimeout = 500;

  const advert = document.getElementById("advert-id");
  const mobileMenuButton = document.getElementById("mobile-menu-button-id");
  const userBag = document.querySelector(".header-items .user-bag");
  const frontpageUnique = document.body.classList.contains("frontpage");
  const addToBagButtonsList = document.querySelectorAll(".store-item .action-item.add-to-bag");
  const cSpinnersList = document.querySelectorAll(".c-spinner-container");

  handleHeaderActions();
  handleStoreItems();
  handleCustomApp();

  mobileMenuButton?.addEventListener('click', handleToggleMobileMenu);

  if (advert) {
    const advertCloseButton = advert.querySelector(".advert-close");
    function handleClickCallback(event) {
      event.preventDefault();
      removeContainerEvents(advert);
      advert.remove();
    }
    addManagedEventListener(advertCloseButton, 'click', handleClickCallback);
  }

  if (userBag) {

    const clearBagButton = userBag.querySelector(".clear-bag-button");
    const bagItemsList = userBag.querySelectorAll(".popout-body a.body-item:not(.body-item-prototype)");

    bagItemsList.forEach(item => {
      const removeItemButton = item.querySelector(".item-action");
      function handleClickCallback(event) {
        handleRemoveBagItem(event, item);
      }
      addManagedEventListener(removeItemButton, 'click', handleClickCallback);
    });

    clearBagButton.addEventListener('click', function() {
      const bagItemsList = userBag.querySelectorAll(".popout-body a.body-item:not(.body-item-prototype)");
      bagItemsList.forEach((item, index) => setTimeout(() => handleRemoveBagItem(null, item), (siteGV.CommonAnimationTimeout / 4) * index));
    });

  }

  if (frontpageUnique) {

    const headerCategories = document.querySelectorAll("header .category-item");
    const sectionItemsList = document.querySelectorAll("main .section-item");
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

    headerCategories.forEach(category => {
      const categoryAnchorId = category.getAttribute("href").split("#").join("");
      const categorySection = document.getElementById(categoryAnchorId);
      category.addEventListener('click', function(event) {
        event.preventDefault();
        scrollToAnchor(categorySection);
      });
    });

    document.addEventListener('scroll', function() {
      handleChangeActiveSection();
    });

    $("#gallery-items-id").slick({
      arrows: true,
      nextArrow: $("#gallery-button-next-id"),
      prevArrow: $("#gallery-button-previous-id"),
      slidesToShow: 2,
      responsive: [
        {
          breakpoint: 869.98,
          settings: {
            slidesToShow: 1
          }
        }
      ]
    });

    setTimeout(() => {
      handleChangeActiveSection();
      handleChainPhysics();
    }, siteGV.CommonAnimationTimeout);

  }



  addToBagButtonsList.forEach(button => {
    handleAddToBagEvents(button);
  });

  // Custom spinners (number inputs with custom arrows)
  cSpinnersList.forEach(container => {
    handleSpinner(container);
  });

}); /* ################################################ Ready end ################################################ */

function handleCustomApp() {

  const customAppUnique = document.getElementById("custom-app-id");
  if (!customAppUnique) {
    return;
  }

  const customAppData = getCustomAppData();
  const nextStepButton = customAppUnique.querySelector(".app-choices .choices-action");
  const undoStepButton = customAppUnique.querySelector(".app-choices .header-action");
  const choicesHeader = customAppUnique.querySelector(".choices-header .header-text .text-bottom");
  const choiceItemsList = customAppUnique.querySelectorAll(".app-choices .choice-item");
  const toolsList = customAppUnique.querySelectorAll(".drawboard-tools-wrapper .tool-item");
  const notAvailableText = customAppUnique.getAttribute("data-text-not-available");
  const stepIdsWithChoiceDependency = getStepChoiceDependencies();
  const drawboardWrapper = customAppUnique.querySelector(".app-drawboard .drawboard-frame-wrapper");
  const drawboard = customAppUnique.querySelector(".app-drawboard .drawboard-frame");
  const drawboardContext = drawboard.getContext("2d");
  const lockButton = customAppUnique.querySelector(".drawboard-lock");
  const drawboardClearButton = customAppUnique.querySelector(".app-drawboard .drawboard-clear");
  const toolsHeader = customAppUnique.querySelector(".drawboard-tools-wrapper .tools-header");
  const stoneTool = customAppUnique.querySelector(".app-drawboard .tool-item.tool-stone");
  const stoneToolImg = stoneTool.querySelector(".tool-image img");
  const stoneToolText = stoneTool.querySelector(".tool-text");
  const maskTool = customAppUnique.querySelector(".app-drawboard .tool-item.tool-mask");
  const maskToolActionInputFile = maskTool.querySelector(".tool-action input");
  const fullscreenTool = customAppUnique.querySelector(".app-drawboard .tool-item.tool-fullscreen");
  const uploadButton = customAppUnique.querySelector('.choice-group[data-choice-group-id="4"] .details-action');
  const inputFile = uploadButton.querySelector('input[type="file"]');
  const uploadedFilesContainer = customAppUnique.querySelector('.choice-group[data-choice-group-id="4"] .uploaded-files');
  const infoElement = customAppUnique.querySelector(".app-drawboard .drawboard-footer");
  const choiceActionButton = customAppUnique.querySelector(".app-choices .choices-action");
  const choiceItemInquiry = customAppUnique.querySelector('[data-choice-group-id="4"] .item-value');
  const choiceSummaryTextInquiry = customAppUnique.querySelector('[data-like-step-id="4"] .item-choice');
  const saveCreationButton = customAppUnique.querySelector(".app-choices .choices-save");
  const lastStepId = 5;
  let drawboardRect;
  let drawboardScaleY;
  let drawboardScaleX;
  let eraserWidthX;
  let eraserWidthY;
  let currentChoice;
  let currentTool;
  let drawFillStyle;
  let drawLineWidth;
  let isMouseDown;
  siteGV.CustomApp = {};
  function getStepChoiceDependencies() {
    let dependencies = [];
    for (let key in customAppData) {
      const choiceGroup = customAppData[key];
      const choiceGroupId = choiceGroup.choiceGroupId;
      Object.keys(choiceGroup.choiceGroupChoices).length !== 0 && (dependencies.push(choiceGroupId));
    }
    return dependencies;
  }
  function getChoicesLayout() {
    let choicesLayout = {};
    for (let key in customAppData) {
      const choiceGroup = customAppData[key];
      const choiceGroupId = choiceGroup.choiceGroupId;
      choicesLayout[choiceGroupId] = null;
    }
    return choicesLayout;
  }
  function getCurrentChoiceGroup(id = siteGV.CustomApp.currentStepId) {
    const choiceGroups = siteGV.CustomApp.data;
    return siteGV.CustomApp.data[keyByValue(choiceGroups, "choiceGroupId", id)];
  }
  function isStepChoiceDependent() {
    const currentStepId = getCurrentStepId();
    return stepIdsWithChoiceDependency.includes(currentStepId);
  }
  function updateHeaderText() {
    const choiceGroup = getCurrentChoiceGroup();
    choiceGroup && (choicesHeader.textContent = choiceGroup.choiceGroupName);
  }
  function updateCurrentStepId() {
    customAppUnique.setAttribute("data-step-id", siteGV.CustomApp.currentStepId);
  }
  function getCurrentStepId() {
    return parseInt(customAppUnique.getAttribute("data-step-id"));
  }
  function getCurrentChoice() {
    return customAppUnique.querySelector(".choice-item.c-clicked");
  }
  function clearCurrentChoice() {
    currentChoice = getCurrentChoice();
    currentChoice?.classList.remove("c-clicked");
    currentChoice = null;
  }
  function setStepChoice() {

    currentChoice = getCurrentChoice();
    if (!currentChoice) {
      return;
    }

    const currentStepId = getCurrentStepId();
    const choiceId = parseInt(currentChoice.getAttribute("data-choice-id"));
    siteGV.CustomApp.choices[currentStepId] = choiceId;

  }
  function getCurrentChoiceSummary() {
    const currentStepId = siteGV.CustomApp.currentStepId;
    return customAppUnique.querySelector(`.app-summary .summary-item[data-like-step-id="${currentStepId}"] .item-choice`);
  }
  function updateCurrentChoiceSummary() {
    const currentChoiceId = parseInt(currentChoice?.getAttribute("data-choice-id"));
    const currentChoiceSummary = getCurrentChoiceSummary();
    if (currentChoiceSummary) {

      const choiceGroup = getCurrentChoiceGroup();
      const choiceSummaryText = choiceGroup.choiceGroupChoices[keyByValue(choiceGroup.choiceGroupChoices, "choiceId", currentChoiceId)]?.choiceName;

      if (!choiceSummaryText) {
        return;
      }

      currentChoiceSummary.textContent = choiceSummaryText;
      currentChoiceSummary.closest(".summary-item").setAttribute("data-like-choice-id", currentChoiceId);

    }
  }
  function getCurrentStoneId() {
    const stoneChoiceSummary = customAppUnique.querySelector(`.summary-items .summary-item[data-like-step-id="2"]`);
    return stoneChoiceSummary.getAttribute("data-like-choice-id") ?? null;
  }
  function updateStone() {
    const stoneChoiceId = getCurrentStoneId();
    if (stoneChoiceId) {
      const stoneChoiceElement = customAppUnique.querySelector(`.choice-item[data-choice-id="${stoneChoiceId}"]`);
      stoneToolImg.src = stoneChoiceElement.querySelector(".item-decoration img").src;
      stoneToolText.textContent = stoneChoiceElement.querySelector(".item-text").textContent;
      getCurrentStepId() === 3 && (bounce(stoneTool));
    } else {
      stoneToolImg.src = stoneTool.getAttribute("data-tool-img");
      stoneToolText.textContent = stoneTool.getAttribute("data-tool-text");
    }
  }
  function handleChoiceInteraction(choice) {
    currentChoice = getCurrentChoice();
    const isChoiceCurrentChoice = choice === currentChoice;
    currentChoice?.classList.remove("c-clicked");
    choice.classList.toggle("c-clicked", !isChoiceCurrentChoice);
  }
  function handleToolInteraction(tool) {

    if (tool === stoneTool) {
      const stoneChoiceId = getCurrentStoneId();
      if (!stoneChoiceId) {

        nudge(tool);
        tool.classList.remove("c-clicked");

        return;

      }
    }

    currentTool = getCurrentTool();

    const isToolCurrentTool = tool === currentTool;
    currentTool?.classList.remove("c-clicked");
    tool.classList.toggle("c-clicked", !isToolCurrentTool);

    currentTool = getCurrentTool();

  }
  function getCurrentTool() {
    currentTool = customAppUnique.querySelector(".tool-item.c-clicked");
    const currentToolId = parseInt(currentTool?.getAttribute("data-tool-id") ?? -1);
    siteGV.CustomApp.currentToolId = currentToolId;
    customAppUnique.setAttribute("data-tool-id", currentToolId);
    return currentTool;
  }
  function clearCurrentTool() {
    currentTool = getCurrentTool();
    currentTool?.classList.remove("c-clicked");
    currentTool = null;
    siteGV.CustomApp.currentToolId = -1;
    customAppUnique.setAttribute("data-tool-id", siteGV.CustomApp.currentToolId);
  }
  async function handleUploadMedia(event) {

    const data = event.dataTransfer;
    const files = data ? data.files : event.target.files;
    let acceptableTypes = ["image"];
    let acceptableSize = 10485760; // 10 MB
    let runningTimer = 0;

    for (let file of files) {

      // Check if file is accepted
      const mimeType = file.type;  // MIME type from browser (Naive implementation, production would use Magic Byte processing)
      const fileType = mimeType.substring(0, mimeType.indexOf("/"));
      const acceptableTypeViolated = !acceptableTypes.includes(fileType);
      const acceptableSizeExceeded = file.size > acceptableSize;
      let willFileBeSkipped = acceptableTypeViolated || acceptableSizeExceeded;
  
      const currentFileTimer = !willFileBeSkipped
        ? siteGV.LongAnimationTimeout / 2
        : siteGV.LongAnimationTimeout * 2;
  
      const newMediaFrameWrapper = document.createElement("div");
      const newMediaFrame = document.createElement("img");
      function handleClickFrameCallback() {
        removeContainerEvents(newMediaFrameWrapper, true);
        newMediaFrameWrapper.remove();
      }

      newMediaFrameWrapper.classList.add("file-item");
      newMediaFrame.classList.add("restrict-interact");
  
      let reader = new FileReader();
      reader.onload = function () {
        newMediaFrame.src = !acceptableTypeViolated 
          ? URL.createObjectURL(file)
          : `unsupported.png`;
      }
  
      // Files expressed as blobs
      reader.readAsDataURL(file);
  
      // Queue files to be moved to all media and mini album containers
      setTimeout(async () => {

        // Files not accepted get skipped here
        if (willFileBeSkipped) {
          return;
        }

        newMediaFrameWrapper.prepend(newMediaFrame);
        uploadedFilesContainer.prepend(newMediaFrameWrapper);

        addManagedEventListener(newMediaFrameWrapper, 'click', handleClickFrameCallback);

        const filesList = uploadedFilesContainer.querySelectorAll(".file-item");
        const filesInContainer = filesList.length - 1;
        if (filesInContainer >= 3) {
          const lastFile = filesList[filesInContainer];
          removeContainerEvents(lastFile, true);
          lastFile.remove();
        }
  
      }, runningTimer + currentFileTimer);

      runningTimer += currentFileTimer;

    }

  }
  function handleMaskMedia(event) {

    const data = event.dataTransfer;
    const files = data ? data.files : event.target.files;
    let acceptableTypes = ["image"];

    for (let file of files) {

      // Check if file is accepted
      const mimeType = file.type;  // MIME type from browser (Naive implementation, production would use Magic Byte processing)
      const fileType = mimeType.substring(0, mimeType.indexOf("/"));
      const acceptableTypeViolated = !acceptableTypes.includes(fileType);

      if (acceptableTypeViolated) {
        continue;
      }

      const maskObject = document.createElement("div");

      let reader = new FileReader();
      reader.onload = function () {
        maskObject.style.backgroundImage = `url(${URL.createObjectURL(file)})`;
      }
  
      // Files expressed as blobs
      reader.readAsDataURL(file);

      maskObject.classList.add("drawboard-mask");
      drawboardWrapper.appendChild(maskObject);

      break;

    }

  }
  function toggleInfoVIsibility() {
    infoElement.classList.toggle("c-hidden");
  }
  function handleChoiceButtonText() {
    choiceActionButton.textContent = (function() {
      switch (siteGV.CustomApp.currentStepId) {
        case 4:
          return choiceActionButton.getAttribute("data-action-text-finish");
        case 5:
            return choiceActionButton.getAttribute("data-action-text-start");
        default:
          return choiceActionButton.getAttribute("data-action-text-apply");
      }
    })();
  }
  function resetUniqueApp() {

    const choiceSummariesList = customAppUnique.querySelectorAll(`.app-summary .summary-item .item-choice`);
    choiceSummariesList.forEach(summary => {
      summary.textContent = notAvailableText;
      summary.closest(".summary-item").removeAttribute("data-like-choice-id");
    });

    const uploadedFilesList = customAppUnique.querySelectorAll(".uploaded-files .file-item");
    uploadedFilesList.forEach(file => {
      removeContainerEvents(file, true);
      file.remove();
    });

    choiceItemInquiry.value = "";
    choiceSummaryTextInquiry.textContent = notAvailableText;

    siteGV.CustomApp.currentStepId = 0;
    clearDrawboard();
    updateCurrentStepId();
    clearCurrentChoice();
    updateStone();
    clearCurrentTool();
    handleChoiceButtonText();

  }
  function clearDrawboard() {

    customAppUnique.classList.remove("has-drawings");

    const stoneItemsList = customAppUnique.querySelectorAll(".drawboard-frame-wrapper .stone-item");
    stoneItemsList.forEach(stoneItem => {
      eraseStone(stoneItem, true);
    });

    updateDrawboardRect();
    drawboardContext.clearRect(0, 0, drawboardRect.width, drawboardRect.height);

  }
  function drawboardMouseDownCallback() {
    isMouseDown = true;
    updateDrawboardRect();
  }
  function drawboardMouseUpCallback() {
    isMouseDown = false;
  }
  function updateDrawboardRect() {
    drawboardRect = drawboard.getBoundingClientRect();
    drawboardScaleY = drawboard.height / drawboardRect.height;
    drawboardScaleX = drawboard.width / drawboardRect.width;
  }
  function startDraw(event){
    function initializePen() {
      drawFillStyle = "#000000";
      drawLineWidth = 2;
      drawboardContext.fillStyle = drawFillStyle;
      drawboardContext.lineWidth = drawLineWidth;
      drawboardContext.beginPath();
    }
    function initializeEraser() {
      eraserWidthX = eraserWidthY = 4;
    }
    customAppUnique.classList.add("has-drawings");
    switch (siteGV.CustomApp.currentToolId) {
      case 0:
        initializePen();
        break;
      case 1:
        initializeEraser();
        break;
      case 2:
        drawStone(event);
        break;
      default:
        break;
    }
  }
  function stopDraw() {
    drawboardContext.closePath();
    drawboardMouseUpCallback();
  }
  function drawMove(event) {
    switch (siteGV.CustomApp.currentToolId) {
      case 0:
        drawLine(event);
        break;
      case 1:
        eraseLine(event);
        break;
      default:
        break;
    }
  }
  function drawStone(event) {

    const cursorPositionY = Math.abs(event.clientY - drawboardRect.top);
    const cursorPositionX = Math.abs(event.clientX - drawboardRect.left);
    const stoneObject = document.createElement("div");
    const stoneDecoration = document.createElement("img");
    const drawboardWidth = drawboardRect.width;
    const drawboardHeight = drawboardRect.height;
    function handleClickCallback() {
      eraseStone(stoneObject);
    }
    function handleMouseMoveCallback(event) {
      moveStone(stoneObject, event);
    }

    stoneObject.classList.add("stone-item");
    stoneObject.style.left = `${(cursorPositionX / drawboardWidth) * 100}%`;
    stoneObject.style.top = `${(cursorPositionY / drawboardHeight) * 100}%`;
    stoneDecoration.classList.add("restrict-interact");
    stoneDecoration.src = "img/static/stone.svg";
    stoneDecoration.alt = "Stone";

    stoneObject.prepend(stoneDecoration);
    drawboardWrapper.appendChild(stoneObject);
    bounce(stoneObject);

    addManagedEventListener(stoneObject, 'pointerdown', handleClickCallback);
    addManagedEventListener(stoneObject, 'pointermove', handleMouseMoveCallback);

  }
  function moveStone(stone, event) {

    if (!isMouseDown || siteGV.CustomApp.currentToolId !== -1 || siteGV.CustomApp.currentStepId !== 3) {
      return;
    }

    const cursorPositionY = Math.abs(event.clientY - drawboardRect.top);
    const cursorPositionX = Math.abs(event.clientX - drawboardRect.left);
    const drawboardWidth = drawboardRect.width;
    const drawboardHeight = drawboardRect.height;
    const stoneRect = stone.getBoundingClientRect();

    stone.style.left = `${((cursorPositionX - (stoneRect.width / 2)) / drawboardWidth) * 100}%`;
    stone.style.top = `${((cursorPositionY - (stoneRect.height / 2)) / drawboardHeight) * 100}%`;

  }
  function eraseStone(stone, force = undefined) {

    if (!force && siteGV.CustomApp.currentToolId !== 2) {
      return;
    }

    removeContainerEvents(stone);
    stone.remove();

  }
  function drawLine(event) {

    if (!isMouseDown) { 
      return; 
    }

    const cursorPositionY = Math.abs(event.clientY - drawboardRect.top) * drawboardScaleY;
    const cursorPositionX = Math.abs(event.clientX - drawboardRect.left) * drawboardScaleX;
    drawboardContext.lineTo(cursorPositionX + 2, cursorPositionY + 2);
    drawboardContext.stroke();

  }
  function eraseLine(event) {

    if (!isMouseDown) { 
      return; 
    }

    const cursorPositionY = Math.abs(event.clientY - drawboardRect.top) * drawboardScaleY;
    const cursorPositionX = Math.abs(event.clientX - drawboardRect.left) * drawboardScaleX;
    drawboardContext.clearRect(cursorPositionX, cursorPositionY, eraserWidthX, eraserWidthY);

  }

  siteGV.CustomApp.data = customAppData;
  siteGV.CustomApp.currentStepId = getCurrentStepId();
  siteGV.CustomApp.choices = getChoicesLayout();
  siteGV.CustomApp.currentToolId = -1;

  nextStepButton.addEventListener('click', function() {

    const currentStepId = getCurrentStepId();
    if (currentStepId === lastStepId) {
      resetUniqueApp();
      return;
    }

    const choiceDependent = isStepChoiceDependent();
    currentChoice = getCurrentChoice();
    if (choiceDependent && !currentChoice) {
      nudge(nextStepButton);
      return;
    }

    if (currentStepId === 4) {
      const inquiryText = choiceItemInquiry.value.trim();
      choiceSummaryTextInquiry.textContent = inquiryText === ""
        ? notAvailableText
        : inquiryText;
    }

    updateCurrentChoiceSummary();
    setStepChoice();
    siteGV.CustomApp.currentStepId++;
    updateCurrentStepId();
    clearCurrentChoice();
    updateHeaderText();
    updateStone();
    clearCurrentTool();
    handleChoiceButtonText();

  });

  undoStepButton.addEventListener('click', function() {

    if (siteGV.CustomApp.currentStepId === 0) {
      nudge(undoStepButton);
      return;
    }

    siteGV.CustomApp.currentStepId--;
    updateCurrentStepId();
    updateHeaderText();

    const currentChoiceSummary = getCurrentChoiceSummary();
    if (currentChoiceSummary) {
      currentChoiceSummary.textContent = notAvailableText;
      currentChoiceSummary.closest(".summary-item").removeAttribute("data-like-choice-id");
    }

    updateStone();
    clearCurrentTool();
    handleChoiceButtonText();

  });

  lockButton.addEventListener('click', function() {
    document.documentElement.classList.toggle("scroll-locked");
  });

  drawboardClearButton.addEventListener('click', function() {
    clearDrawboard();
  });

  choiceItemsList.forEach(choice => {
    choice.addEventListener('click', function() { 
      handleChoiceInteraction(choice);
    });
  });

  toolsList.forEach(tool => {
    tool.addEventListener('click', function() {
      handleToolInteraction(tool);
    });
  });

  maskTool.addEventListener('click', function() {
    
    siteGV.CustomApp.currentToolId = -1;
    maskTool.classList.remove("c-clicked");
    customAppUnique.setAttribute("data-tool-id", siteGV.CustomApp.currentToolId);

    const currentMask = drawboardWrapper.querySelector(".drawboard-mask");
    if (currentMask) {
      currentMask.remove();
      return;
    }

    maskToolActionInputFile.click();

  });

  maskToolActionInputFile.addEventListener('change', function(event) {
    event.preventDefault();
    handleMaskMedia(event);
  });

  fullscreenTool.addEventListener('click', function() {

    fullscreenTool.classList.remove("c-clicked");
    siteGV.CustomApp.currentToolId = -1;
    customAppUnique.setAttribute("data-tool-id", siteGV.CustomApp.currentToolId);
    customAppUnique.closest("main").classList.toggle("drawboard-is-fullscreen");

    setTimeout(() => {
      updateDrawboardRect();
    }, siteGV.LongAnimationTimeout)

  });

  uploadButton.addEventListener('click', function() {
    inputFile.click();
  });

  inputFile.addEventListener('change', function(event) {
    event.preventDefault();
    handleUploadMedia(event);
  });

  infoElement.addEventListener('click', function() {
    toggleInfoVIsibility();
  });

  toolsHeader.addEventListener('click', function() {
    const toolsWrapper = toolsHeader.closest(".drawboard-tools-wrapper");
    toolsWrapper.classList.toggle("c-altered");
  });

  saveCreationButton.addEventListener('click', function() {

    updateDrawboardRect();
    drawboardContext.fillStyle = "#9A7E8E";

    const stoneItemsList = customAppUnique.querySelectorAll(".drawboard-frame-wrapper .stone-item");
    stoneItemsList.forEach(stoneItem => {

      const stoneItemRect = stoneItem.getBoundingClientRect();
      const stoneX = Math.abs((stoneItemRect.x + (stoneItemRect.width / 2)) - drawboardRect.left) * drawboardScaleX;
      const stoneY = Math.abs((stoneItemRect.y + (stoneItemRect.height / 2)) - drawboardRect.top) * drawboardScaleY;

      drawboardContext.beginPath();
      drawboardContext.moveTo(stoneX, stoneY);
      drawboardContext.lineTo(stoneX, stoneY + 8);
      drawboardContext.lineTo(stoneX, stoneY - 8);
      drawboardContext.lineTo(stoneX + 4.5, stoneY - 6);
      drawboardContext.lineTo(stoneX + 4.5, stoneY + 6);
      drawboardContext.lineTo(stoneX, stoneY + 8);
      drawboardContext.lineTo(stoneX - 4.5, stoneY + 6);
      drawboardContext.lineTo(stoneX - 4.5, stoneY - 6);
      drawboardContext.lineTo(stoneX, stoneY - 8);
      drawboardContext.closePath();
      drawboardContext.fill();
      drawboardContext.clearRect(stoneX - 2, stoneY - 2, 4, 4);
      eraseStone(stoneItem, true);

    });

    const tempLink = document.createElement("a");
    tempLink.download = "jewelry.png";
    tempLink.href = drawboard.toDataURL();
    tempLink.click();

  });

  window.addEventListener('pointerdown', drawboardMouseDownCallback);
  drawboard.addEventListener('pointerdown', startDraw);
  window.addEventListener('pointerup', drawboardMouseUpCallback);
  drawboard.addEventListener('pointerup', stopDraw);
  drawboard.addEventListener('mouseleave', stopDraw);
  drawboard.addEventListener('pointermove', drawMove);

}

function getCustomAppData() {

  const appData = {};
  const customAppElement = document.getElementById("custom-app-id");
  const choiceGroupsList = customAppElement.querySelectorAll(".choice-group");

  choiceGroupsList.forEach((group, index) => {

    const choiceGroupId = parseInt(group.getAttribute("data-choice-group-id"));
    const choiceGroupName = group.getAttribute("data-step-text");
    const choiceItemsList = group.querySelectorAll(".choice-item");

    appData[index] = {
      choiceGroupId: choiceGroupId,
      choiceGroupName: choiceGroupName,
      choiceGroupChoices: {}
    }

    choiceItemsList.forEach((choiceItem, subIndex) => {
      const choiceItemId = parseInt(choiceItem.getAttribute("data-choice-id"));
      const choiceItemName = choiceItem.querySelector(".item-text").textContent.trim();
      appData[index].choiceGroupChoices[subIndex] = {
        choiceId: choiceItemId,
        choiceName: choiceItemName
      };
    });

  });

  return appData;

}

function handleAddToBagEvents(button) {

  const item = button.closest(".store-item");
  const viewBagElement = item.querySelector(".action-item.view-bag");
  const viewBagButton = viewBagElement?.querySelector(".item-button.view-button");
  const closeNotificationButton = viewBagElement?.querySelector(".item-button.close-button");
  function handleClickAddToBagCallback() {
    handleAddBagItem(item);
  }
  function handleClickCloseCallback() {
    viewBagElement.classList.remove("c-visible");
  }
  function handleClickViewButton() {
    handleClickCloseCallback();
    handleToggleBag(true, siteGV.LongAnimationTimeout);
  }
  
  button.addEventListener('click', handleClickAddToBagCallback);
  closeNotificationButton?.addEventListener('click', handleClickCloseCallback);
  viewBagButton?.addEventListener('click', handleClickViewButton);

}

function handleLastBagItem() {

  const userBag = document.querySelector(".header-items .user-bag");
  const bagItemsList = userBag.querySelectorAll(".popout-body a.body-item:not(.body-item-prototype)");

  userBag.classList.toggle("c-altered", bagItemsList.length === 0);

}

function handleRemoveBagItem(event, item) {

  event?.preventDefault();
  event?.stopPropagation();

  const batchValue = parseFloat(item.querySelector(".detail-value .value-raw").textContent);
  const userBag = document.querySelector(".header-items .user-bag");

  item.classList.add("c-altered");
  setTimeout(() => {

    const subtotalElement = userBag.querySelector(".subtotal .value-raw");
    const newSubtotal = (parseFloat(subtotalElement.textContent) - batchValue).toFixed(2);

    removeContainerEvents(item, true);
    item.remove();

    subtotalElement.textContent = newSubtotal;
    handleLastBagItem();

  }, siteGV.CommonAnimationTimeout);

}

async function handleAddBagItem(item) {

  const itemId = item.getAttribute("data-item-id");
  const quantityElement = item.querySelector(".c-spinner-container");
  const quantity = parseInt(quantityElement.querySelector("input").value);
  const unitValue = parseFloat(item.querySelector(".actions-header .value-raw").textContent);
  const batchValue = quantity * unitValue;
  const userBag = document.querySelector(".header-items .user-bag");
  const subtotalElement = userBag.querySelector(".subtotal .value-raw");
  const newSubtotal = (parseFloat(subtotalElement.textContent) + batchValue).toFixed(2);

  if (quantity === 0) {
    nudge(quantityElement);
    return;
  }

  const itemActionsContainer = item.querySelector(".item-actions");
  itemActionsContainer?.classList.add("c-loading");

  subtotalElement.textContent = newSubtotal;
  async function addBagItemEndCallback() {

    await simulateServerWait();
    itemActionsContainer?.classList.remove("c-loading");

    notifyAddedToBag(item);

  }

  const likeItem = userBag.querySelector(`a.body-item[data-item-id="${itemId}"]`);
  if (likeItem) {

    const likeItemValueElement = likeItem.querySelector(".detail-value .value-raw");
    const likeItemValue = parseFloat(likeItemValueElement.textContent);
    const likeItemQuantityElement = likeItem.querySelector(".detail-quantity .value-raw");
    const likeItemQuantity = parseInt(likeItemQuantityElement.textContent);

    likeItemValueElement.textContent = (likeItemValue + batchValue).toFixed(2);
    likeItemQuantityElement.textContent = likeItemQuantity + quantity;

    await addBagItemEndCallback();

    return;

  }

  const itemName = item.getAttribute("data-item-name");
  const itemURL = item.getAttribute("data-item-url");
  const itemImage = item.querySelector(".item-image img");
  const newUserBagItem = userBag.querySelector(".body-item.body-item-prototype").cloneNode(true);
  const newUserBagItemImage = newUserBagItem.querySelector(".item-image img");
  const newUserBagItemTitle = newUserBagItem.querySelector(".item-details .detail-title");
  const newUserBagItemValue = newUserBagItem.querySelector(".item-details .detail-value .value-raw");
  const newUserBagItemQuantity = newUserBagItem.querySelector(".item-details .detail-quantity .value-raw");
  const newUserBagItemRemoveButton = newUserBagItem.querySelector(".item-action");
  const userBagItemsBody = userBag.querySelector(".popout-body");
  function handleClickCallback(event) {
    handleRemoveBagItem(event, newUserBagItem);
  }

  newUserBagItem.setAttribute("data-item-id", itemId);
  newUserBagItem.href = itemURL;
  newUserBagItemImage.src = itemImage.src;
  newUserBagItemImage.alt = itemImage.alt;
  newUserBagItemTitle.textContent = itemName;
  newUserBagItemValue.textContent = batchValue.toFixed(2);
  newUserBagItemQuantity.textContent = quantity;

  userBagItemsBody.append(newUserBagItem);
  newUserBagItem.classList.remove("body-item-prototype");
  addManagedEventListener(newUserBagItemRemoveButton, 'click', handleClickCallback);

  handleLastBagItem();

  await addBagItemEndCallback();

}

function notifyAddedToBag(item) {
  const viewBagElement = item.querySelector(".action-item.view-bag");
  viewBagElement?.classList.add("c-visible");
}

function handleToggleMobileMenu() {
  document.documentElement.scrollTop = 0;
  document.documentElement.classList.toggle("mobile-menu-active");
}

function handleToggleBag(force = undefined, delay = 0) {
  const userBag = document.querySelector(".header-items .user-bag");
  (force || !userBag.classList.contains("c-clicked")) && (scrollToAnchor(document.querySelector("header")));
  setTimeout(() => userBag.classList.toggle("c-clicked", force), delay);
}

function handleChainPhysics() {

  const chain = document.getElementById("chain-id");
  if (!chain) {
    return;
  }

  const chainLinksList = chain.querySelectorAll("path.link");
  const minDelay = 0;
  const maxDelay = 50;
  const dropAnimationDelay = 10;
  const maxLinkY = 25;
  const linkWeights = [5, 4, 3, 3, 2, 2, 2, 3, 4, 6];
  let currentScrollY = window.scrollY;
  let queueId = 0;

  document.addEventListener('scroll', function() {

    if (siteGV.ActiveSection !== "custom") {
      return;
    }

    queueId = Date.now();

    const newScrollY = window.scrollY;
    const scrolledDown = newScrollY > currentScrollY;
    const currentQueueId = queueId;

    chainLinksList.forEach((link, index) => {
      const delay = getRandomInt(minDelay, maxDelay);
      const nextDropAnimationDelay = getRandomInt(dropAnimationDelay / 2, dropAnimationDelay);
      setTimeout(async () => {

        const initialLinkY = Math.floor(maxLinkY / linkWeights[index]);
        let linkY = initialLinkY - 1;

        link.style.transform = scrolledDown
          ? `translateY(-${initialLinkY}px)`
          : `translateY(${initialLinkY}px)`;
        while (linkY !== 0 && currentQueueId === queueId) {
          link.style.transform = scrolledDown
            ? `translateY(-${linkY}px)`
            : `translateY(${linkY}px)`;
          linkY = linkY > 0
            ? linkY - 1
            : linkY + 1;
          await new Promise(r => setTimeout(r, nextDropAnimationDelay));
        }

      }, delay);
    });

    currentScrollY = newScrollY;

  });

}

function handleStoreItems() {

  const storeItemsList = document.querySelectorAll(".store-item");
  const canvas = document.createElement("canvas");
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const shadowOpacity = 0.6;
  const searchStartX = canvas.width / 2;
  const searchStartY = 5;
  const searchWidth = 1;
  const searchHeight = 1;

  setTimeout(() => {
    storeItemsList.forEach(item => {

      const itemImgWrapper = item.querySelector(".item-image");
      const itemImg = itemImgWrapper.querySelector("img");

      canvas.width = itemImg.width;
      canvas.height = itemImg.height;
      itemImg.crossOrigin = "anonymous";
      context.drawImage(itemImg, 0, 0);

      try {

        const imageData = context.getImageData(searchStartX, searchStartY, searchWidth, searchHeight);
        const red = imageData.data[0];
        const green = imageData.data[1];
        const blue = imageData.data[2];

        itemImgWrapper.style.setProperty("--box-shadow-color", `rgba(${red}, ${green}, ${blue}, ${shadowOpacity}`);

      } catch (error) {
        console.log("Error getting image data: " + error);
      }

    });
  }, siteGV.CommonAnimationTimeout);

}

function handleHeaderActions() {

  const headerActions = document.querySelector("header .items-group.group-right");
  if (!headerActions) {
    return;
  }

  const actionsList = headerActions.querySelectorAll(":scope > .group-item");
  function handleCloseActions() {
    actionsList.forEach(action => action.classList.remove("c-clicked"));
  }

  actionsList.forEach(action => {

    const button = action.querySelector(".item-button");
    button.addEventListener('click', function() {

      const wasClicked = action.classList.contains("c-clicked");

      actionsList.forEach(subAction => subAction.classList.remove("c-clicked"));
      action.classList.toggle("c-clicked", !wasClicked);

    });

  });

  document.addEventListener('click', function(event) {

    const headerComponent = event.target.closest(".items-group.group-right");
    if (headerComponent) {
      return;
    }

    handleCloseActions();

  });

  document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
      handleCloseActions();
    }
  });

}

function getRandomInt(min, max) {

  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;

}

async function simulateServerWait(delay = siteGV.LongAnimationTimeout) {
  return new Promise(r => setTimeout(r, delay));
}

function nudge(element) {
  element?.classList.add("nudge-animation");
  setTimeout(() => {
    element?.classList.remove("nudge-animation");
  }, siteGV.NudgeAnimationTimeout);
}

function bounce(element) {
  element?.classList.add("bounce-animation");
  setTimeout(() => {
    element?.classList.remove("bounce-animation");
  }, siteGV.BounceAnimationTimeout);
}

function keyByValue(object, property, value) {
  return Object.keys(object).find(key => object[key][property] === value);
}

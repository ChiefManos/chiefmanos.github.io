window.siteCommonGV = window.siteCommonGV || {};

$(document).ready(function () {

    siteCommonGV.ZeroAnimationTimeout = 0;

    if (!document.body.classList.contains("portfolio")) {
        return;
    }

    const mainElement = document.querySelector("main");
    const sliderItemsContainer = document.querySelector(".slider-items")
    const sliderArrowRight = document.querySelector(".slider-arrows .arrow-right");
    const sliderArrowLeft = document.querySelector(".slider-arrows .arrow-left");
    const sliderItemsList = sliderItemsContainer.querySelectorAll(":scope > a");
    const sliderTitleElement = document.querySelector(".slider-items-title");
    const ghostTitleElement = document.querySelector(".ghost-item-title");
    const nextItemGhostContainer = document.querySelector(".next-slider-item-ghost");
    const sliderDecorationTrianglesList = [...document.querySelectorAll(".slider-decoration path")].reverse();
    const transition = 200;
    function handleCurrentSliderItem(action) {

        const currentItem = document.querySelector(".slick-slide.slick-current");
        const itemTitle = currentItem.getAttribute("data-project-title");
        const itemId = currentItem.getAttribute("data-project-id");
        const nextItem = currentItem.nextElementSibling ?? sliderItemsContainer.querySelector(".item.slick-slide");
        const nextItemClone = nextItem.cloneNode(true);
        const ghostItem = nextItemGhostContainer.firstChild;
        const ghostItemElement = nextItemGhostContainer.querySelector(".item");

        mainElement.classList.add("item-animating");
        nextItemGhostContainer.setAttribute("data-ghost-project-id", nextItem.getAttribute("data-project-id"));
        sliderTitleElement.href = currentItem.href;
        sliderTitleElement.textContent = itemTitle;
        ghostTitleElement.href = nextItem.href;
        ghostTitleElement.textContent = nextItem.getAttribute("data-project-title");
        mainElement.setAttribute("data-current-project-id", itemId);
        nextItemClone.classList.remove("slick-slide", "slick-current");
        nextItemClone.style = {};
        action === "next" && (ghostItemElement?.classList.remove("ghost-emergent"));
        action === "next" && (ghostItemElement?.classList.add("ghost-active"));

        // Triangle wave
        sliderDecorationTrianglesList.forEach((triangle, index) => {
            triangle.classList.remove("c-animate");
            if (triangle.customTimeout) {
              clearTimeout(triangle.customTimeout);
            }
            triangle.customTimeout = setTimeout(() => {
                triangle.classList.add("c-animate");
            }, transition / 6 * index);
        });

        setTimeout(() => {
            try {
                nextItemGhostContainer.replaceChild(nextItemClone, ghostItem);
                mainElement.classList.remove("item-animating");
            } catch (error) {
                return;
            }
            action === "previous" && (nextItemClone.classList.add("ghost-emergent"));
        }, transition * 1.5);

    }
    function handleHoverMirrorEvents(origin, target) {

        function handleMouseOverCallback() {
          target.classList.add("c-hover-mirrored");
        }
        function handleMouseOutCallback() {
          target.classList.remove("c-hover-mirrored");
        }
      
        origin.addEventListener('mouseover', handleMouseOverCallback);
        origin.addEventListener('mouseout', handleMouseOutCallback);
      
      }

    $(sliderItemsContainer).slick({
        infinite: true,
        speed: transition,
        cssEase: "linear",
        nextArrow: sliderArrowRight,
        prevArrow: sliderArrowLeft,
        fade: true,
        draggable: false
    });

    sliderArrowLeft.addEventListener('click', function() {
        handleCurrentSliderItem("previous");
    });

    sliderArrowRight.addEventListener('click', function() {
        handleCurrentSliderItem("next");
    });

    sliderItemsList.forEach(item => {
        handleHoverMirrorEvents(item, sliderTitleElement);
        handleHoverMirrorEvents(sliderTitleElement, item);
    });

    handleCurrentSliderItem();

}); /* ################################################ Ready end ################################################ */

function removeContainerEvents(container, removeContainerElementEvent = false) {

    if (!container) {
      return;
    }
  
    function handleRemoval(affectedContainer) {
      removeManagedEventListener(affectedContainer);
      affectedContainer.removeAttribute("data-event-listener-added");
    }
  
    const elementsWithEventListenerList = container.querySelectorAll("[data-event-listener-added]");
    elementsWithEventListenerList.forEach(element => {
      handleRemoval(element);
    });
  
    if (removeContainerElementEvent) {
      handleRemoval(container);
    }
  
}

function removeManagedEventListener(element) {

    if (!element.removeEventListenerCallback) {
        return;
    }

    element.removeEventListenerCallback.forEach(callback => {
        callback();
    });

    element.removeEventListenerCallback.length = 0;

}

/**
 * Managed event listeners are an efficient way to add and remove listeners to and from elements.
 */
function addManagedEventListener(element, eventType, callback) {

    element.addEventListener(eventType, callback);
    element.removeEventListenerCallback = element.removeEventListenerCallback || [];
    element.removeEventListenerCallback.push(() => element.removeEventListener(eventType, callback));
  
    if (element !== document) {
      element.setAttribute("data-event-listener-added", "true");
    }
    
}

function handleSpinner(container) {

  const numberInput = container.querySelector(".c-spinner");
  const decreaseButton = container.querySelector(".c-spinner-decrease");
  const increaseButton = container.querySelector(".c-spinner-increase");
  const inputMode = numberInput.getAttribute("inputmode");
  function handleInputCallback(event) {

    event.preventDefault(); // The default behavior to prevent is "enter" key submitting the form

    this.value = inputMode === "decimal" 
      ? Number(this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1').replace(/^0[^.]/, '0')).toFixed(2)
      : this.value.replace(/[^0-9]/g, '');

    if (inputMode === "decimal" && isNaN(this.value)) {
      this.value = Number(0).toFixed(2);
    }

  }
  function handleKeydownCallback(event) {

    if (event.key === "Enter") {
      event.preventDefault(); // The default behavior to prevent is "enter" key submitting the form
    }

    if (event.key === "ArrowDown") {
      handleDecreaseNumber(numberInput);
    } else if (event.key === "ArrowUp") {
      handleIncreaseNumber(numberInput);
    }

  }
  function handleClickIncreaseCallback() {
    handleIncreaseNumber(numberInput);
  }
  function handleClickDecreaseCallback() {
    handleDecreaseNumber(numberInput);
  }

  // Up/down keys
  addManagedEventListener(numberInput, 'input', handleInputCallback);
  addManagedEventListener(numberInput, 'keydown', handleKeydownCallback);

  // Spinner buttons
  [decreaseButton, increaseButton].forEach(button => {
    addManagedEventListener(button, 'click', cPreventDefault);
  });

  addManagedEventListener(decreaseButton, 'click', handleClickDecreaseCallback);
  addManagedEventListener(increaseButton, 'click', handleClickIncreaseCallback);

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

function cPreventDefault(event) {
  event.preventDefault();
}

function cClearTimeout(element) {
  if (element.customTimeout) {
    clearTimeout(element.customTimeout);
  }
}

function clearThenSetTimeout(element, callback, timeout = 0) {
  cClearTimeout(element);
  element.customTimeout = setTimeout(() => callback(), timeout);
}

function blurThenFocus(input) {
  input.click();
  input.focus();
  input.blur();
  input.focus();
}

function scrollToAnchor(target, behavior = "smooth") {

  if (!target) {
    return;
  }

  const targetRect = target.getBoundingClientRect();
  const bodyRect = document.body.getBoundingClientRect();
  const position = targetRect.top - bodyRect.top;

  window.scrollTo({
    top: position,
    behavior: behavior
  });

}

function handleIftaLabelGroup(group) {

  const input = group.querySelector("input, select");
  let isSelect = input.nodeName === "SELECT";

  function handleFocusCallback() {
    group.classList.add("ifta-valid");
  }
  function handleCheckValidityCallback(event) {
    clearThenSetTimeout(event.target || event, () => {

      const isValid = isSelect 
        ? parseInt(input.options[input.selectedIndex].value) !== 0
        : input.validity.valid;
      const isInvalid = !isSelect && input.value.trim() === "";

      group.classList.toggle("ifta-valid", isValid);
      group.classList.toggle("ifta-invalid", isInvalid || !isValid);

    }, siteCommonGV.ZeroAnimationTimeout);
  }

  addManagedEventListener(input, 'focus', handleFocusCallback);
  addManagedEventListener(input, 'blur', handleCheckValidityCallback);
  addManagedEventListener(input, 'input', handleCheckValidityCallback);

  if (input.value.trim() !== "" && !isSelect) {
    handleCheckValidityCallback(input);
  }

}

function getRandomInt(min, max) {

  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;

}

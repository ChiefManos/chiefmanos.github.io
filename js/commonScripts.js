$(document).ready(function () {

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
import React, { useEffect, useRef, useState } from "react";
import ReactDom from "react-dom";
import { FaWindowClose } from "react-icons/fa";

// Portal to render the modal outside the component tree
const Portal = ({ children }) => {
  return ReactDom.createPortal(children, document.body);
};

// Modal component
const Modal = ({
  children,
  isOpen,
  onClose,
  isDismissible = true,
  showCloseIcon = true,
  toAnimate = true,
  animationEnter = "zoomIn",
  animationExit = "zoomOut",
  className = "",
}) => {
  const modalRef = useRef();
  const [mouseDownEv, setMouseDownEv] = useState(null);

  // Handle ESC key press to close modal
  useEffect(() => {
    if (!isOpen || !isDismissible) return;
    const checkEscAndCloseModal = (e) => {
      if (e.key !== "Escape") return;
      onClose();
    };
    document.addEventListener("keydown", checkEscAndCloseModal);
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", checkEscAndCloseModal);
    };
  }, [isOpen, onClose, isDismissible]);

  // Handle mouse down event to detect click outside the modal
  const handleMouseDown = (e) => {
    setMouseDownEv({ screenX: e.screenX, screenY: e.screenY });
  };

  // Check if the click was outside the modal
  const checkOutsideAndCloseModal = (e) => {
    if (!isDismissible) return;
    if (
      modalRef.current.contains(e.target) ||
      Math.abs(mouseDownEv.screenX - e.screenX) > 15 ||
      Math.abs(mouseDownEv.screenY - e.screenY) > 15
    )
      return;
    onClose();
    setMouseDownEv(null);
  };

  // Get enter animation based on passed prop
  const getEnterAnimation = (animEnter) => {
    return {
      zoomIn: "animate-[zoomIn_500ms_forwards]",
      fadeIn: "animate-opacity ease-out duration-500",
    }[animEnter];
  };

  // Get exit animation based on passed prop
  const getExitAnimation = (animExit) => {
    return {
      zoomOut: "animate-[zoomOut_500ms_forwards]",
      fadeOut: "animate-opacity ease-in duration-300",
    }[animExit];
  };

  return (
    <Portal>
      <div
  className={`fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center overflow-hidden bg-black bg-opacity-50 backdrop-blur-lg duration-500
    ${isOpen ? "opacity-100 z-[1000] transition-opacity" : "opacity-0 z-[-1] transition-all"}
  `}
  onClick={checkOutsideAndCloseModal}
  onMouseDown={handleMouseDown}
>
  <div
    ref={modalRef}
    className={`relative bg-white rounded-lg shadow-lg w-full max-w-[90%] sm:max-w-[500px] md:max-w-[700px] lg:max-w-[800px] p-6
      ${toAnimate ? "transition-all duration-500 ease-out" : ""}
      ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none select-none"}
      ${toAnimate && (isOpen ? getEnterAnimation(animationEnter) : getExitAnimation(animationExit))}
      ${className}
    `}
    style={{
      maxHeight: "90vh", // Ensure it doesn't exceed the viewport height
      overflowY: "auto", // Allow scrolling if content is too tall
    }}
  >
    {showCloseIcon && (
      <div className="absolute top-4 right-4">
        <button
          className="rounded-full transition-all"
          onClick={onClose}
        >
          <FaWindowClose className="text-xl" />
        </button>
      </div>
    )}
    <div>{children}</div>
  </div>
</div>

    </Portal>
  );
};

export default Modal;

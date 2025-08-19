import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faList,
  faSave,
  faUpload,
  faDownload,
  faTrash,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import "./DraggableMenu.css";

const DraggableMenu = ({ onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const constraintsRef = useRef(null);
  const menuRef = useRef(null);
  const menuContainerRef = useRef(null);

  const menuItems = [
    { icon: faList, color: "#FFFFFF", action: "toggleView" },
    { icon: faSave, color: "#64F592", action: "save" },
    { icon: faUpload, color: "#5CD1FF", action: "upload" },
    { icon: faDownload, color: "#FFF15C", action: "download" },
    { icon: faTrash, color: "#FF5C5C", action: "clear" },
    { icon: faPlus, color: "#A15CFF", action: "add" },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target) &&
        !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDrag = (event, info) => {
    setPosition({
      x: position.x + info.delta.x,
      y: position.y + info.delta.y,
    });
  };

  const handleMainButtonClick = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleItemClick = (action, e) => {
    e.stopPropagation();
    onAction(action);
    // Don't close menu automatically after action
  };

  return (
    <div
      ref={constraintsRef}
      className="menu-container"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      <motion.div
        ref={menuRef}
        drag
        dragConstraints={constraintsRef}
        onDrag={handleDrag}
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "move",
          zIndex: 1001,
          pointerEvents: "auto",
        }}
        onClick={handleMainButtonClick}
      >
        <FontAwesomeIcon
          icon={faList}
          style={{ color: "#222222", fontSize: "24px" }}
        />
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuContainerRef}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{
              position: "absolute",
              left: position.x,
              top: position.y,
              pointerEvents: "auto",
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking menu
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: Math.cos(index * ((Math.PI * 2) / menuItems.length)) * 60,
                  y: Math.sin(index * ((Math.PI * 2) / menuItems.length)) * 60,
                  opacity: 1,
                }}
                exit={{ x: 0, y: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  delay: index * 0.05,
                }}
                className="menu-item"
                style={{
                  position: "absolute",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: item.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                onClick={(e) => handleItemClick(item.action, e)}
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  style={{ color: "#222222", fontSize: "18px" }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DraggableMenu;

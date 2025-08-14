import React, { useState, useEffect, useRef } from "react";
import { Badge, Button } from "antd";
import { BellOutlined, CloseOutlined } from "@ant-design/icons";
import { notification } from "antd";
import { getAdminNote, getUserNote } from "../services/api";
import "./NotificationBell.css";
import axios from "axios";
import userpng from "../user.png";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8091";

const NotificationBell = () => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const createdBy = localStorage.getItem("userName");
  const isAdmin = localStorage.getItem("userName") === "admin";
  const prevNotificationsRef = useRef([]);

  const showCustomNotification = (item) => {
    const key = `open${Date.now()}`;
    const btn = (
      <Button
        type="text"
        size="small"
        icon={<CloseOutlined />}
        onClick={() => notification.close(key)}
      />
    );

    notification.open({
      // message: (
      //   <div className="notification-toast-title">
      //     <span style={{ fontWeight: "bold" }}>{item.title}</span>
      //   </div>
      // ),
      description: (
        <div className="toast1" key={item.gst_ticketId}>
          <img className="toast__image1" src={userpng} alt="" />
          <div className="toast-info1">
            <div className="toast-info__data1">
              {item.createdBy} - {formatTimeAgo(item.createdOn)}
            </div>
            <div className="toast-info__title1">{item.title}</div>
            <div className="toast-info__message1">{item.description}</div>
          </div>
          <div className="toast__dismiss1">
            <span
              className="cancel-button1"
              tabIndex="0"
              onClick={() => dismissNotification(item.gst_ticketId)}
            >
              <CloseOutlined
                style={{
                  color: "black",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              />
            </span>
          </div>
        </div>
      ),
      // icon: (
      //   <img
      //     src={userpng}
      //     alt="user"
      //     style={{ width: 24, height: 24, borderRadius: "50%" }}
      //   />
      // ),
      // btn,
      // key,
      duration: 125,
      placement: "bottomRight",
      // className: "custom-notification-toast",
      // style: {
      //   width: 350,
      //   borderRadius: 8,
      //   boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      // },
    });
  };

  // const fetchNotifications = async () => {
  //   try {
  //     setLoading(true);
  //     let response;

  //     if (isAdmin) {
  //       response = await getAdminNote(createdBy);
  //     } else {
  //       response = await getUserNote(createdBy);
  //     }

  //     if (response) {
  //       const filtered = response.filter((item) => {
  //         if (isAdmin) {
  //           return (
  //             item.adminNote !== "F" &&
  //             (item.status === "Pending" || item.status === "Going On")
  //           );
  //         }

  //         if (!isAdmin) {
  //           return (
  //             item.userNote !== "F" &&
  //             (item.status === "Completed" || item.status === "Going On")
  //           );
  //         }
  //       });

  //       // Check for new notifications
  //       const newNotifications = filtered.filter(
  //         (newNotif) =>
  //           !prevNotificationsRef.current.some(
  //             (prevNotif) => prevNotif.gst_ticketId === newNotif.gst_ticketId
  //           )
  //       );

  //       // Show custom toast for new notifications
  //       if (
  //         newNotifications.length > 0 &&
  //         prevNotificationsRef.current.length > 0
  //       ) {
  //         newNotifications.forEach((notif) => {
  //           showCustomNotification(notif);
  //         });
  //       }

  //       setNotifications(filtered);
  //       prevNotificationsRef.current = filtered;
  //     } else {
  //       setNotifications([]);
  //       prevNotificationsRef.current = [];
  //     }
  //   } catch (error) {
  //     notification.error({
  //       message: "Data Fetch Error",
  //       description: "Failed to fetch notifications.",
  //     });
  //     setNotifications([]);
  //     prevNotificationsRef.current = [];
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchNotifications();
  //   const intervalId = setInterval(fetchNotifications, 2 * 60 * 1000);
  //   return () => clearInterval(intervalId);
  // }, []);

  const updateNote = async (createdBy, ticketId) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/Ticket/updateNote?id=${ticketId}&createdby=${createdBy}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const dismissNotification = async (ticketId) => {
    try {
      await updateNote(createdBy, ticketId);
      setNotifications((prev) =>
        prev.filter((n) => n.gst_ticketId !== ticketId)
      );
    } catch (error) {
      console.error("Failed to dismiss notification:", error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className="notification-container1">
      <Badge
        count={notifications.length}
        overflowCount={9}
        className="notification-badge1"
        style={{
          backgroundColor: isAdmin ? "#ff4d4f" : "#1890ff",
        }}
        onClick={() => setVisible(!visible)}
      >
        <BellOutlined
          className="notification-icon-trigger1"
          style={{
            color: isAdmin ? "#ff4d4f" : "#1890ff",
          }}
        />
      </Badge>

      {visible && (
        <div className="toast-list1">
          {loading ? (
            <div className="toast1">
              <div className="toast-info1">
                <div className="toast-info__title1">
                  Loading notifications...
                </div>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="toast1">
              <div className="toast-info1">
                <div className="toast-info__title1">No new notifications</div>
              </div>
            </div>
          ) : (
            notifications.map((item) => (
              <div className="toast1" key={item.gst_ticketId}>
                <img className="toast__image1" src={userpng} alt="" />
                <div className="toast-info1">
                  <div className="toast-info__data1">
                    {item.createdBy} - {formatTimeAgo(item.createdOn)}
                  </div>
                  <div className="toast-info__title1">{item.title}</div>
                  <div className="toast-info__message1">{item.description}</div>
                </div>
                <div className="toast__dismiss1">
                  <span
                    className="cancel-button1"
                    tabIndex="0"
                    onClick={() => dismissNotification(item.gst_ticketId)}
                  >
                    <CloseOutlined
                      style={{
                        color: "black",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

import { toast } from "sonner"

type NotificationType =
  | "boardCreated"
  | "boardRenamed"
  | "boardDeleted"
  | "linkCopied"

type NotificationMessages = {
  [key in NotificationType]: {
    success: string
    error: string
  }
}

const notificationMessages: NotificationMessages = {
  boardCreated: {
    success: "Board created",
    error: "Failed to create board",
  },
  boardRenamed: {
    success: "Board renamed",
    error: "Failed to rename board",
  },
  boardDeleted: {
    success: "Board deleted",
    error: "Failed to delete board",
  },
  linkCopied: {
    success: "Link copied",
    error: "Failed to copy link",
  },
}

export const useNotifications = () => {
  const addNotification = (type: NotificationType, isSuccess: boolean) => {
    const messageType = isSuccess ? "success" : "error"

    const message = notificationMessages[type][messageType]

    toast[messageType](message)
  }

  const addNotificationSuccess = (type: NotificationType) =>
    addNotification(type, true)

  const addNotificationError = (type: NotificationType) =>
    addNotification(type, false)

  return { addNotificationSuccess, addNotificationError }
}

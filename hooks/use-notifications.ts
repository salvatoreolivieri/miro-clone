import { toast } from "sonner"

type NotificationType =
  | "boardCreated"
  | "boardRenamed"
  | "boardDeleted"
  | "linkCopied"

export const useNotifications = () => {
  const addNotificationSuccess = (type: NotificationType) => {
    switch (type) {
      case "boardCreated":
        return toast.success("Board created")

      case "boardRenamed":
        return toast.error("Board renamed")

      case "boardRenamed":
        return toast.success("Board deleted")

      case "linkCopied":
        return toast.success("Link copied")
    }
  }

  const addNotificationError = (type: NotificationType) => {
    switch (type) {
      case "boardCreated":
        return toast.error("Failed to create board")

      case "boardRenamed":
        return toast.error("Failed to rename board")

      case "boardDeleted":
        return toast.error("Failed to delete board")

      case "linkCopied":
        return toast.error("Failed to copy link")
    }
  }

  return { addNotificationSuccess, addNotificationError }
}

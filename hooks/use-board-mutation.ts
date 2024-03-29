import { useApiMutation } from "./use-api-mutation"
import { useNotifications } from "./use-notifications"
import { api } from "../convex/_generated/api"

import { useOrganization } from "@clerk/nextjs"

export const useBoardMutation = () => {
  const { organization } = useOrganization()
  const { addNotificationSuccess, addNotificationError } = useNotifications()

  // Utils:
  const checkOrganization = () => {
    if (!organization) return
  }

  // Mutations:
  const { mutate, pending: pendingState } = useApiMutation(api.board.create)

  // Functions:
  const createNewBoard = () => {
    // error handling
    checkOrganization()

    const NOTIFICATION_TYPE = "boardCreated"

    mutate({
      orgId: "",
      title: "untitled",
    })
      .then(() => addNotificationSuccess(NOTIFICATION_TYPE))
      .catch(() => addNotificationError(NOTIFICATION_TYPE))
  }

  return {
    createNewBoard,
    pendingState,
  }
}

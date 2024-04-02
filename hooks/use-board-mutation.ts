import { useApiMutation } from "./use-api-mutation"

import { useNotifications } from "./use-notifications"
import { api } from "../convex/_generated/api"

import { useOrganization } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"

export const useBoardMutation = () => {
  const router = useRouter()
  const search = useSearchParams()
  const favorites = search.get("favorites")

  const { organization } = useOrganization()
  const { addNotificationSuccess, addNotificationError } = useNotifications()

  // Utils:
  const checkOrganization = () => {
    if (!organization) return
  }

  // Mutations:
  const { mutate: create, pending: createPendingState } = useApiMutation(
    api.board.create
  )
  const { mutate: remove, pending: removePendingState } = useApiMutation(
    api.board.remove
  )
  const { mutate: rename, pending: renamePendingState } = useApiMutation(
    api.board.update
  )
  const { mutate: onFavorite, pending: favoritePendingState } = useApiMutation(
    api.board.favorite
  )
  const { mutate: onUnfavorite, pending: unfavoritePendingState } =
    useApiMutation(api.board.unfavorite)

  // Functions:
  const createNewBoard = () => {
    // error handling
    checkOrganization()

    const NOTIFICATION_TYPE = "boardCreated"

    create({
      orgId: organization?.id,
      title: "untitled",
    })
      .then((id) => {
        addNotificationSuccess(NOTIFICATION_TYPE)

        console.log(favorites)

        if (favorites) {
          onFavorite({ id, orgId: organization?.id })
        }

        router.push(`/board/${id}`)
      })
      .catch(() => addNotificationError(NOTIFICATION_TYPE))
  }

  const removeBoard = (id: string) => {
    // error handling
    checkOrganization()

    const NOTIFICATION_TYPE = "boardDeleted"

    remove({
      id,
    })
      .then(() => addNotificationSuccess(NOTIFICATION_TYPE))
      .catch(() => addNotificationError(NOTIFICATION_TYPE))
  }

  const renameBoard = (id: string, title: string) => {
    // error handling
    checkOrganization()

    const NOTIFICATION_TYPE = "boardRenamed"

    rename({ id, title })
      .then(() => addNotificationSuccess(NOTIFICATION_TYPE))
      .catch(() => addNotificationError(NOTIFICATION_TYPE))
  }

  const toggleFavorite = (id: string, favoriteState: boolean) =>
    favoriteState
      ? onUnfavorite({ id })
          .then(() => addNotificationSuccess("unfavorite"))
          .catch(() => addNotificationError("unfavorite"))
      : onFavorite({ id, orgId: organization?.id })
          .then(() => addNotificationSuccess("favorite"))
          .catch(() => addNotificationError("favorite"))

  return {
    // Create
    createNewBoard,
    createPendingState,

    // Remove
    removeBoard,
    removePendingState,

    // Rename
    renameBoard,
    renamePendingState,

    // Favorite
    toggleFavorite,
    favoritePendingState,
    unfavoritePendingState,
  }
}

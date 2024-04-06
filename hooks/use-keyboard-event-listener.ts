import { useHistory } from "@/liveblocks.config"
import { useEffect } from "react"
import { useDeleteLayers } from "./use-delete-layers"

export const useKeyboardEventListener = () => {
  const deleteLayer = useDeleteLayers()
  const history = useHistory()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "z") {
        // Handle undo action here
        history.undo()
      }

      // Check if the pressed key is the delete key (keyCode 46) or backspace key (keyCode 8)
      if (
        (event.metaKey || event.ctrlKey) &&
        (event.keyCode === 46 || event.keyCode === 8)
      ) {
        // Perform your desired action here, for example, console log
        deleteLayer()
      }
    }

    // Add event listener to the document
    document.addEventListener("keydown", handleKeyDown)

    // Clean up by removing event listener when component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [deleteLayer, history]) // Empty dependency array to ensure this effect runs only once on component mount
}

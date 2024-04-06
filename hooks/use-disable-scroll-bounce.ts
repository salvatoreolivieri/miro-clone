import { useEffect } from "react"

export const useDisableScrollBounce = () => {
  useEffect(() => {
    document.body.classList.add("oveflow-hidden", "overscroll-none")

    return () => {
      document.body.classList.remove("oveflow-hidden", "overscroll-none")
    }
  }, [])
}

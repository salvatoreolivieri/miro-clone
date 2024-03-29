"use client"

import { UserButton } from "@clerk/nextjs"

export const Navbar = () => {
  // Add some functions here...

  return (
    <>
      <div className="flex items-center gap-x-4 p-5">
        <div className="hidden lg:flex lg:flex-1">
          {/* TODO: add search */} search...
        </div>

        <UserButton />
      </div>
    </>
  )
}

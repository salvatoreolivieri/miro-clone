"use client"

export const Info = () => {
  // Add some functions here...

  return (
    <>
      <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md">
        Information about the board
      </div>
    </>
  )
}

export const InfoSkeleton = () => (
  <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md w-[300px]" />
)

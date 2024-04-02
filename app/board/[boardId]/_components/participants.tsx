"use client"

export const Participants = () => {
  // Add some functions here...

  return (
    <>
      <div className="absolute h-12 top-2 right-2 bg-white rounded-md p-3 flex items-center shadow-md">
        List of users
      </div>
    </>
  )
}

export const ParticipantsSkeleton = () => (
  <div className="absolute h-12 top-2 right-2 bg-white rounded-md p-3 flex items-center shadow-md w-[100px]" />
)

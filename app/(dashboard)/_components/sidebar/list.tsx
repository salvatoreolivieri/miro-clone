"use client"

import { useOrganizationList } from "@clerk/nextjs"

import { Item } from "./item"

export const List = () => {
  const { userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  })

  if (!userMemberships.data?.length) return null

  return (
    <>
      <ul className="space-y-4">
        {userMemberships.data.map(({ organization }) => (
          <Item
            id={organization.id}
            imageUrl={organization.imageUrl}
            name={organization.name}
            key={organization.id}
          />
        ))}
      </ul>
    </>
  )
}

export interface Waypoint {
  id: number
  name?: string
  latitude: number
  longitude: number
  description?: string
  addedby?: string
  addedbyuserid?: string
  verified?: boolean
  isaccessible?: boolean
  dogfriendly?: boolean
  hasbottlefiller?: boolean
  createdAt?: string
  type?: string
  imageUrl?: string
  maintainer?: string
  updatedAt?: string
  favoriteId?: string
}
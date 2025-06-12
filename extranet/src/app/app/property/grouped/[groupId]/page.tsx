import axios from 'axios';
import React, { useEffect, useState } from 'react'
interface Hotels {
  _id: string;
  hotelName: string,
  images: string[]
}
export default function Grouped({ params }: { params: { groupId: string } }) {
  const groupId = params.groupId
  const [message, setMessage] = useState({
    isGood: false,
    text: ""
  })
  const [loading, setLoading] = useState(false)
  const [allHotels, setAllHotels] = useState<Hotels[]>([])
  const getAllTheHotels = async (groupId: string) => {
    try {
      const response = await axios.get("", {
        headers: {
          "Authorization": `Bearer `
        }
      })
      if (response.data.success) {

        setAllHotels(response.data.data)
      } else {
        setMessage({ ...message, isGood: false, text: response.data.message })
      }
      setLoading(true)
    } catch (error) {

    } finally {
      setLoading(false)

    }
  }
  useEffect(() => {
    getAllTheHotels(groupId)
  }, [groupId])
  return (
    <>
      {
        loading ? (<>
          <h1>Loading</h1>
        </>) : (<>
          <h1>{groupId}</h1>
        </>)
      }
    </>
  )
}

import { useState } from 'react'

export const fetchData = async (url: string) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  setLoading(true)
  try {
    const response = await fetch(url)
    const data = await response.json()
    setData(data)
  } catch (error) {
    setError(error)
  }
  return { data, loading, error }
}

const useAPI = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  return { data, loading, error, fetchData }
}

export default useAPI

import client from '../client'

export const generateInvite = () =>
  client.post('/invite/generate')

export const registerWithInvite = (data: {
  token: string
  username: string
  email: string
  password: string
  first_name: string
  last_name: string
  phone: string
}) => client.post('/invite/register', data)

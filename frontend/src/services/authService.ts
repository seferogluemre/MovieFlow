const API_URL = 'http://localhost:4000/graphql'

interface LoginInput {
  email: string
  password: string
}

interface RegisterInput {
  name: string
  email: string
  password: string
}

export const login = async (input: LoginInput) => {
  const query = `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        user {
          id
          name
          email
        }
        token
      }
    }
  `

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { input },
      }),
    })

    const { data } = await response.json()
    return data.login
  } catch (error) {
    console.error('Giriş yapılırken hata oluştu:', error)
    throw error
  }
}

export const register = async (input: RegisterInput) => {
  const query = `
    mutation Register($input: RegisterInput!) {
      register(input: $input) {
        user {
          id
          name
          email
        }
        token
      }
    }
  `

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { input },
      }),
    })

    const { data } = await response.json()
    return data.register
  } catch (error) {
    console.error('Kayıt olurken hata oluştu:', error)
    throw error
  }
} 
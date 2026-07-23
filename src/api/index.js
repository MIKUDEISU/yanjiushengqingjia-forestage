const BASE_URL = '/api'

function getToken() {
  return localStorage.getItem('auth-token')
}

function setToken(token) {
  localStorage.setItem('auth-token', token)
}

function removeToken() {
  localStorage.removeItem('auth-token')
  localStorage.removeItem('auth-user')
}

async function request(url, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers
  }

  if (options.body instanceof FormData) {
    delete headers['Content-Type']
  }

  try {
    const response = await fetch(`${BASE_URL}${url}`, config)

    let data = null
    try {
      const text = await response.text()
      data = text ? JSON.parse(text) : {}
    } catch {
      data = {}
    }

    if (response.status === 401) {
      removeToken()
      if (!url.includes('/auth/login')) {
        window.location.hash = '#/login'
        throw new Error('登录已过期，请重新登录')
      }
    }

    if (!response.ok) {
      throw new Error(data.message || `请求失败 (${response.status})`)
    }

    return data
  } catch (err) {
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      throw new Error('网络连接失败，请检查后端服务是否启动')
    }
    throw err
  }
}

export const api = {
  get(url, params = {}) {
    const query = new URLSearchParams(params).toString()
    const fullUrl = query ? `${url}?${query}` : url
    return request(fullUrl, { method: 'GET' })
  },

  post(url, data) {
    return request(url, { method: 'POST', body: JSON.stringify(data) })
  },

  put(url, data) {
    return request(url, { method: 'PUT', body: JSON.stringify(data) })
  },

  delete(url) {
    return request(url, { method: 'DELETE' })
  },

  upload(url, formData) {
    return request(url, { method: 'POST', body: formData })
  }
}

export { getToken, setToken, removeToken }

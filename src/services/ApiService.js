import axios from 'axios'
import cookie from 'react-cookies'
import { isJwtExpired } from 'jwt-check-expiration'
let api = process.env.REACT_APP_API

axios.defaults.baseURL = api
export default class ApiService {
  constructor() {
    axios.interceptors.request.use(async (config) => {
      const locale = localStorage.getItem('i18nextLng') || 'en'
      config.headers.locale = locale
      const sessionId = this.session
      const token = await this.token()
      if (token && sessionId) {
        config.headers.Authorization = `Bearer ${token}`
        config.headers.session_id = sessionId
      }
      return config
    })
  }
  async get(endpoint, params) {
    try {
      let res = await axios({
        method: 'get',
        url: `/${endpoint}`,
        params: params,
      })

      return res.data
    } catch (error) {
      throw new Error(error.response?.data?.message)
    }
  }
  async post(endpoint, data, header, params = null) {
    try {
      let res = await axios({
        method: 'post',
        url: `/${endpoint}`,
        data: data,
        headers: header,
        params: params,
      })
      return res.data
    } catch (error) {
      throw new Error(error.response?.data?.message)
    }
  }

  async put(endpoint, data, header, params = null) {
    try {
      let res = await axios({
        method: 'put',
        url: `/${endpoint}`,
        params: params,
        data: data,
      })
      return res.data
    } catch (error) {
      throw new Error(error.response?.data?.message)
    }
  }

  async delete(endpoint, data, header, params = null) {
    try {
      let res = await axios({
        method: 'delete',
        url: `/${endpoint}`,
        data: data,
        params: params,
        headers: header || this.bearer(await this.token()),
      })
      return res.data
    } catch (error) {
      throw new Error(error.response?.data?.message)
    }
  }

  bearer(token) {
    const locale = localStorage.getItem('i18nextLng') ?? 'en'
    return {
      session_id: cookie.load('session_id'),
      Authorization: ` Bearer ${token}`,
      locale,
    }
  }

  basic(data) {
    return {
      Authorization: ` Basic ${btoa(`${data.email}:${data.password}`)}`,
    }
  }
  get session() {
    return cookie.load('session_id')
  }
  async token() {
    let token = cookie.load('access_token', { path: '/' })

    if (!token) return
    else if (!isJwtExpired(token)) {
      return token
    } else {
      let { refresh_token, access_token, status, session_id } = await this.post(
        'auth/refresh',
        null,
        this.bearer(cookie.load('refresh_token', { path: '/' })),
      )
      if (status === 200) {
        cookie.remove('access_token', { path: '/' })
        cookie.remove('refresh_token', { path: '/' })
        cookie.save('access_token', access_token, { path: '/' })
        cookie.save('refresh_token', refresh_token, { path: '/' })

        return access_token
      } else return
    }
  }
  getLimitOffsetFromParams(params) {
    if (params.page) {
      return {
        ...params,
        limit: params.pageSize,
        offset: params.pageSize * (params.page - 1),
      }
    }
    return params
  }
}

import { createSlice } from "@reduxjs/toolkit";
import cookie from 'react-cookies';
import Auth from "../services/Auth"
import Update from "src/services/Update";
const NewAuth = new Auth();
const NewUpdate = new Update();


const login = createSlice({
    name: 'login',
    initialState: { loggedIn: false, user: {}, message: '' },
    reducers: {
        loginAction(state, action) {

            return { ...state, ...action.payload }
        },

        deleteMessage(state, action) {
            return { ...state, message: '' }
        }
    },
})

export const loginHandler = payload => async dispatch => {
    try {
        let response = await NewAuth.basicAuth(payload)
        if (response.status === 200) {
            cookie.save('access_token', response.access_token)
            cookie.save('refresh_token', response.refresh_token)
            cookie.save('session_id', response.session_id)
            let user = await NewAuth.getStore()
            dispatch(loginAction({ loggedIn: true, user: { ...user } }));
        } else {
            dispatch(loginAction({ message: response.message }));
        }
    } catch (err) {
        dispatch(loginAction({ message: 'you are not a seller' }));
    }
}
export const getUser = () => async (dispatch) => {
    try {
        let user = await NewAuth.getStore()
        if (user.id) {
            dispatch(loginAction({ loggedIn: true, user: { ...user } }))
        }
    } catch (error) {
        console.log("🚀 ~ file: auth.js ~ line 51 ~ error", error)
    }

}

export const logout = () => async dispatch => {
    await NewAuth.logout()
    let cookies = cookie.loadAll()
    Object.keys(cookies).forEach(key =>cookie.remove(key) )

    dispatch(loginAction({ loggedIn: false, user: {} }))



}

export const endSession = () => async (dispatch, state) => {
    dispatch(loginAction({ logged: false, user: {} }))
}

export const updateInfo = info => async (dispatch, state) => {
    try {
        let response = await NewUpdate.updateInfo(info)
        console.log(state())
        dispatch(loginAction({ user: { ...state().login.user, ...response.data } }))

    } catch (error) {
        console.log("🚀 ~ file: auth.js ~ line 65 ~ error", error)

    }
}

export const updateName = name => async (dispatch, state) => {
    try {
        let response = await NewUpdate.updateStoreName({ store_name: name })
        dispatch(loginAction({ user: { ...state().login.user, ...response.data } }))
    } catch (error) {
        console.log("🚀 ~ file: auth.js ~ line 77 ~ error", error)

    }
}

export const updateStorePicture = data => async (dispatch, state) => {
    try {
        let response = await NewUpdate.updateStorePicture(data);
        dispatch(loginAction({ user: { ...state().login.user, store_picture: response.result.store_picture } }))
    } catch (error) {
        console.log("🚀 ~ file: auth.js ~ line 88 ~ updateStorePicture ~ error", error)

    }
}

export default login.reducer
export const { loginAction, deleteMessage, logoutAction } = login.actions



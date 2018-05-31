/* global window */
import modelExtend from 'dva-model-extend'
import queryString from 'query-string'
import { config } from 'utils'
import { create, remove, update,query ,getUserInfoes,edtUserAuthenticationes} from 'services/vipMenber/memberSign'
import * as usersService from 'services/users'
import { pageModel } from '../common'

// const { query } = usersService
const { prefix } = config

export default modelExtend(pageModel, {
  namespace: 'memberSign',

  state: {
    currentItem: {},
    modalVisible: false,
    agreeVisible:false,   //同意 按钮  modal
    unagreeVisible:false,   //同意 按钮  modal

    id:'',  //modal 通过 参数
    authentication_status:'',  //modal 通过 参数
    modalType: 'create',
    selectedRowKeys: [],
    isMotion: window.localStorage.getItem(`${prefix}userIsMotion`) === 'true',
  },

  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if (location.pathname === '/memberSign') {
          const payload = queryString.parse(location.search) || { pageIndex: 1, pageSize: 10 }
          dispatch({
            type: 'query',
            payload,
          })
        }
      })
    },
  },

  effects: {

    * query ({ payload = {} }, { call, put }) {
      const data = yield call(query, payload)
      console.log(data)
      if (data.status == 1) {
        yield put({
          type: 'querySuccess',
          payload: {
            list: data.list,
            pagination: {
              current: Number(payload.pageIndex) || 1,
              pageSize: Number(payload.pageSize) || 10,
              total: data.count,
            },
          },
        })
      }
    },




    * getUserInfoes ({ payload }, { call, put, select }) {

      const data = yield call(getUserInfoes, {user_id:payload.user_id})
      console.log(data)
      if (data.status == 1) {
        yield put({ type: 'showModal',payload:{lists:data.list,id:payload.id,authentication_status:payload.authentication_status} })
      } else {
        throw data
      }
    },


//通过 确定
* agreeOk ({ payload }, { call, put, select }) {
  console.log(payload)
    const data = yield call(edtUserAuthenticationes, payload)

    if (data.status == 1) {
      yield put({ type: 'hideAgreeModal' })
    } else {
      throw data
    }
  },





    * delete ({ payload }, { call, put, select }) {
    //  console.log(payload)
      const data = yield call(remove, { shoptypeids: String(payload) })
      if (data.status == 1) {
        yield put({ type: 'hideModal' })
      } else {
        throw data
      }
    },

    * multiDelete ({ payload }, { call, put }) {
      const data = yield call(usersService.remove, payload)
      if (data.success) {
        yield put({ type: 'updateState', payload: { selectedRowKeys: [] } })
      } else {
        throw data
      }
    },

    * create ({ payload }, { call, put }) {

      const data = yield call(create, payload)
      if (data.status == 1) {
        yield put({ type: 'hideModal' })
      } else {
        throw data
      }
    },

    * update ({ payload }, { select, call, put }) {
      // const id = yield select(({ user }) => user.currentItem.id)
      // const newUser = { ...payload, id }
      const data = yield call(update, payload)
      if (data.status == 1) {
        yield put({ type: 'hideModal' })
      } else {
        throw data
      }
    },

  },

  reducers: {

    showModal (state, { payload }) {
      return { ...state, ...payload, modalVisible: true,currentItem:payload.lists,id:payload.id,authentication_status:payload.authentication_status}
    },

    hideModal (state) {
      return { ...state, modalVisible: false }
    },


    showAgreeModal (state) {
      return { ...state, agreeVisible: true }
    },
    hideAgreeModal (state) {
      return { ...state, agreeVisible: false }
    },

    unshowAgreeModal (state) {
      return { ...state, unagreeVisible: true }
    },
    unhideAgreeModal (state) {
      return { ...state, unagreeVisible: false }
    },
    switchIsMotion (state) {
      window.localStorage.setItem(`${prefix}userIsMotion`, !state.isMotion)
      return { ...state, isMotion: !state.isMotion }
    },

  },
})

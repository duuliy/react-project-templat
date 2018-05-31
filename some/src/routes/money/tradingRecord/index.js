import React from 'react'
import PropTypes from 'prop-types'
import { routerRedux } from 'dva/router'
import { connect } from 'dva'
import { Row, Col, Button, Popconfirm,Tabs ,Radio } from 'antd'
import { Page } from 'components'
import queryString from 'query-string'
import List from './List'
import Filter from './Filter'
import Modal from './Modal'
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;

const MemberNameAudit = ({
  location, dispatch, tradingRecord, loading,
}) => {
  location.query = queryString.parse(location.search)
  const { query, pathname } = location
  const {
    list, pagination, currentItem, modalVisible, modalType, isMotion, selectedRowKeys,id,authentication_status,status
  } = tradingRecord
  // console.log(status)
  const handleRefresh = (newQuery) => {
    dispatch(routerRedux.push({
      pathname,
      search: queryString.stringify({
        ...query,
        ...newQuery,
      }),
    }))
  }

  const modalProps = {
    item: modalType === 'create' ? {} : currentItem,
    visible: modalVisible,

    id:id,//通过model
    authentication_status:authentication_status,//通过model
    width:800,
    cancelText:'取消',
    okText:'确定',
    maskClosable: false,
    confirmLoading: loading.effects[`tradingRecord/${modalType}`],
    title: `${modalType === 'create' ? '添加分类' : '修改分类'}`,
    wrapClassName: 'vertical-center-modal',
    onOk (data) {
      console.log(data.shoptype_img )
      data.is_index = 0;
      // data.shoptype_img = '',
      data.shoptype_sxf = Number(data.shoptype_sxf),
      data.shoptype_sort = Number(data.shoptype_sort),
      data.shoptype_status = Number(data.shoptype_status),
      data.shoptype_id = currentItem.shoptype_id;
      data.propertyids =  Object.prototype.toString.call(data.propertyids) == '[object Array]' ?  data.propertyids.join(',') : data.propertyids;
      dispatch({
        type: `tradingRecord/${modalType}`,
        payload: data,
      })
        .then(() => {
          handleRefresh()
        })
    },
    onCancel () {
      dispatch({
        type: 'tradingRecord/hideModal',
      })
    },
    agreeModal(){
      dispatch({
        type: 'tradingRecord/showAgreeModal',
      })
    },
    agreeOk(e){
      console.log(id)
      dispatch({
        type: 'tradingRecord/agreeOk',
        payload:{
          id:id,
          authentication_status:1
        }
      })
    },
    agreeCancel(){
      dispatch({
        type: 'tradingRecord/hideAgreeModal',
      })
    },
    unagreeModal(){
      dispatch({
        type: 'tradingRecord/unshowAgreeModal',
      })
    },
    unagreeOk(e){
      // console.log(document.getElementById('unAgree').value)
      dispatch({
        type: 'tradingRecord/agreeOk',
        payload:{
          id:id,
          authentication_status:2,
          authentication_content:document.getElementById('unAgree').value
        }
      })
    },
    unagreeCancel(){
      dispatch({
        type: 'tradingRecord/unhideAgreeModal',
      })
    }
  }

  const listProps = {
    dataSource: list,
    loading: loading.effects['tradingRecord/query'],
    pagination,
    status,
    location,
    isMotion,
    onChange (page) {
      handleRefresh({
        pageIndex: page.current,
        pageSize: 10,
      })
    },
    onDeleteItem (id) {
      dispatch({
        type: 'tradingRecord/delete',
        payload: id,
      })
        .then(() => {
          handleRefresh({
            page: (list.length === 1 && pagination.current > 1) ? pagination.current - 1 : pagination.current,
          })
        })
    },
    onEditItem (e) {

      console.log(e)
      dispatch({
        type: 'tradingRecord/querySearch',
        payload: {
          item:e
        },
      })
    },
    rowSelection: {
      selectedRowKeys,
      onChange: (keys) => {
        dispatch({
          type: 'tradingRecord/updateState',
          payload: {
            selectedRowKeys: keys,
          },
        })
      },
    },
  }

  const filterProps = {
    isMotion,

    filter: {
      ...query,
    },
    onFilterChange (value) {
      handleRefresh({
        ...value,
        page: 1,
      })
    },
    fatherHandleClick(e){
      console.log(e)
    },
    onAdd (e) {
      console.log(e)
      dispatch({
        type: 'tradingRecord/Search',
        payload:e,
      })
    },
    switchIsMotion () {
      dispatch({ type: 'tradingRecord/switchIsMotion' })
    },
  }

  const handleDeleteItems = () => {
    dispatch({
      type: 'tradingRecord/multiDelete',
      payload: {
        ids: selectedRowKeys,
      },
    })
      .then(() => {
        handleRefresh({
          page: (list.length === selectedRowKeys.length && pagination.current > 1) ? pagination.current - 1 : pagination.current,
        })
      })
  }

  return (
    <Page inner>
    <Filter {...filterProps} />
    {
      selectedRowKeys.length > 0 &&
      <Row style={{ marginBottom: 24, textAlign: 'right', fontSize: 13 }}>
        <Col>
          {`Selected ${selectedRowKeys.length} items `}
          <Popconfirm title="Are you sure delete these items?" placement="left" onConfirm={handleDeleteItems}>
            <Button type="primary" style={{ marginLeft: 8 }}>Remove</Button>
          </Popconfirm>
        </Col>
      </Row>
    }
    <List {...listProps} />
    {modalVisible && <Modal {...modalProps} />}
  </Page>
  )
}

MemberNameAudit.propTypes = {
  tradingRecord: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
}

export default connect(({ tradingRecord, loading }) => ({ tradingRecord, loading }))(MemberNameAudit)

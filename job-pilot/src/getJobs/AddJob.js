import React from 'react'
import { DatePicker, Form, Input, Modal, Select } from 'antd'

const AddJob = ({ addModalVisible, setAddModalVisible, addNewJob, form }) => {
  return (
    <Modal
      title='Add New Job Application'
      open={addModalVisible}
      onCancel={() => setAddModalVisible(false)}
      onOk={addNewJob}
      okText='Add'
    >
      <Form layout='vertical' form={form}>
        <Form.Item
          label='Job Title'
          name='position'
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label='Company' name='company' rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label='City' name='city' rules={[]}>
          <Input />
        </Form.Item>
        <Form.Item
          label='Job Link'
          name='link'
          rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
        >
          <Input type='url' placeholder='https://example.com/job' />
        </Form.Item>
        <Form.Item label='Status' name='status' rules={[{ required: true }]}>
          <Select placeholder='Select job status'>
            <Select.Option value='applied'>Applied</Select.Option>
            <Select.Option value='rejected'>Rejected</Select.Option>
            <Select.Option value='interviewing'>Interviewing</Select.Option>
            <Select.Option value='accepted'>Accepted</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label='Date Applied'
          name='appliedAt'
          rules={[{ required: true }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label='Description'
          name='description'
          rules={[{ required: true }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddJob

import React, { useEffect, useState } from 'react'
import { Row, Col, Tabs, Button, Form, message, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { LogoutOutlined } from '@ant-design/icons'
import axios from 'axios'
import dayjs from 'dayjs'
import './jobs.css'
import JobSummary from './JobSummary'
import JobDetailModal from './JobDetailModal'
import AddJob from './AddJob'
import JobCard from './JobCard'
import JobList from './JobList'
import Analytics from '../analytics/Analytics'

import { v4 as uuidv4 } from 'uuid'

import _get from 'lodash/get'

const GetJobs = ({ config, setUser }) => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const baseUrl = _get(config, 'REACT_APP_API_URL', '')
  const [form] = Form.useForm()

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const idToken = user?.idToken

      const res = await axios.get(`${baseUrl}/jobs`, {
        headers: { Authorization: idToken },
      })
      setJobs(res.data.jobs || [])
    } catch (err) {
      message.error('Failed to fetch jobs')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const addNewJob = () => {
    form
      .validateFields()
      .then(async (values) => {
        const user = JSON.parse(localStorage.getItem('user'))
        const idToken = user?.idToken

        const formattedJob = {
          ...values,
          appliedAt: values.appliedAt.format('YYYY-MM-DD'),
          jobId: uuidv4(),
        }

        try {
          const res = await axios.post(`${baseUrl}/add-jobs`, formattedJob, {
            headers: {
              Authorization: idToken,
            },
          })
          message.success('Application added successfully')
          form.resetFields()
          setAddModalVisible(false)
          fetchJobs?.()
        } catch (error) {
          console.error(
            'Error adding job:',
            error.response?.data || error.message
          )
          message.error('Failed to add application')
        }
      })
      .catch(() => {
        console.warn('Form validation failed')
      })
  }

  const showDetails = (job) => {
    setSelectedJob(job)
    setDetailsModalVisible(true)
  }

  const companyCount = new Set(jobs.map((j) => j.company)).size
  const currentMonthCount = jobs.filter((job) => {
    const jobDate = dayjs(job.appliedAt)
    const now = dayjs()
    return jobDate.month() === now.month() && jobDate.year() === now.year()
  }).length

  const items = [
    {
      key: '1',
      label: 'Job List',
      children: <JobList jobs={jobs} showDetails={showDetails} />,
    },
    {
      key: '2',
      label: 'Job Card',
      children: <JobCard jobs={jobs} showDetails={showDetails} />,
    },
    {
      key: '3',
      label: 'Analytics',
      children: <Analytics jobs={jobs} />,
    },
  ]

  return (
    <div className='job-tracker-container'>
      <Row justify='space-between' align='middle' className='mb-6'>
        <Col>
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>Job Applications</h1>
          <p style={{ color: '#888' }}>
            Track your job applications and stay organized
          </p>
        </Col>
        <Col>
          <Space>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={() => setAddModalVisible(true)}
            >
              Add Application
            </Button>
            <Button
              type='primary'
              icon={<LogoutOutlined />}
              onClick={() => {
                localStorage.removeItem('user')
                setUser(null)
              }}
            >
              Logout
            </Button>
          </Space>
        </Col>
      </Row>
      <Row style={{ marginTop: 4, marginBottom: 0 }} gutter={[16, 0]}>
        <JobSummary
          jobs={jobs}
          companyCount={companyCount}
          currentMonthCount={currentMonthCount}
        />
      </Row>

      <Tabs defaultActiveKey='1' items={items} />

      <AddJob
        addModalVisible={addModalVisible}
        setAddModalVisible={setAddModalVisible}
        addNewJob={addNewJob}
        form={form}
      />
      <JobDetailModal
        selectedJob={selectedJob}
        detailsModalVisible={detailsModalVisible}
        setDetailsModalVisible={setDetailsModalVisible}
        config={config}
      />
    </div>
  )
}

export default GetJobs

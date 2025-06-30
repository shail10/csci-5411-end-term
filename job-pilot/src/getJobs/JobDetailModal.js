import React from 'react'

import { BankOutlined, CalendarOutlined } from '@ant-design/icons'

import { Button, Modal, Typography, Space, Tag, Select } from 'antd'
import dayjs from 'dayjs'

import axios from 'axios'
import { message } from 'antd'

import _get from 'lodash/get'

const statusOptions = [
  { value: 'applied', label: 'Applied', color: 'gold' },
  { value: 'interviewing', label: 'Interviewing', color: 'blue' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'accepted', label: 'Accepted', color: 'green' },
]

const JobDetailModal = ({
  selectedJob,
  detailsModalVisible,
  setDetailsModalVisible,
  config,
}) => {
  const baseUrl = _get(config, 'REACT_APP_API_URL', '')
  const [loading, setLoading] = React.useState(false)
  const { Title, Text, Link } = Typography

  const handleResumeUpload = async () => {
    const user = JSON.parse(localStorage.getItem('user'))
    const idToken = user?.idToken

    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'application/pdf'

    fileInput.onchange = async () => {
      const file = fileInput.files[0]
      if (!file) return

      try {
        // 1. Get Pre-signed URL
        const res = await axios.get(`${baseUrl}/generate-presigned-url`, {
          params: {
            jobId: selectedJob.jobId,
            status: selectedJob.status || 'applied',
          },
          headers: {
            Authorization: idToken,
          },
        })

        const uploadUrl = res.data.uploadUrl

        // 2. Upload the file using PUT
        await axios.put(uploadUrl, file, {
          headers: {
            'Content-Type': 'application/pdf',
          },
        })

        message.success('Resume uploaded successfully!')
      } catch (err) {
        console.error('Upload failed:', err)
        message.error('Resume upload failed')
      }
    }

    fileInput.click()
  }

  const handleGetResume = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const res = await axios.get(`${baseUrl}/get-resume`, {
        params: {
          jobId: selectedJob.jobId,
          status: selectedJob.status || 'applied',
        },
        headers: {
          Authorization: user.idToken,
        },
      })
      window.open(res.data.downloadUrl, '_blank')
    } catch (err) {
      message.error('Could not fetch resume')
    }
  }

  const handleStatusChange = async (value) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const idToken = user?.idToken
      setLoading(true)
      await axios.post(
        `${baseUrl}/change-status`,
        {
          jobId: selectedJob?.jobId,
          newStatus: value,
        },
        {
          headers: {
            Authorization: idToken,
          },
        }
      )
      setLoading(false)
      message.success('Job status updated successfully')
      setDetailsModalVisible(false) // Close modal after update
    } catch (err) {
      console.error('Error updating status:', err)
      message.error('Failed to update job status')
    }
  }

  const RenderStatusTag = ({ status }) => {
    const colorMap = {
      applied: 'gold',
      rejected: 'red',
      interviewing: 'blue',
      accepted: 'green',
    }

    const lower = typeof status === 'string' ? status.toLowerCase() : ''
    const color = colorMap[lower] || 'default'
    const label = lower
      ? lower.charAt(0).toUpperCase() + lower.slice(1)
      : 'Unknown'

    return <Tag color={color}>{label}</Tag>
  }

  const normalizeUrl = (url) => {
    if (!url) return ''
    return url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `https://${url}`
  }

  return (
    <Modal
      open={detailsModalVisible}
      onCancel={() => setDetailsModalVisible(false)}
      footer={
        <Space>
          <Button onClick={() => handleResumeUpload()} type='primary'>
            Upload Resume
          </Button>
          <Button onClick={() => setDetailsModalVisible(false)}>Close</Button>
        </Space>
      }
      width={600}
      bodyStyle={{ padding: '24px' }}
    >
      <Space direction='vertical' size='middle' style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Title level={4} style={{ marginBottom: 0 }}>
              {selectedJob?.position}
            </Title>
            <Text type='secondary'>
              <BankOutlined style={{ marginRight: 6 }} />
              {selectedJob?.company}
            </Text>
          </div>
          <Text style={{ marginTop: 30, display: 'inline-block' }}>
            <CalendarOutlined style={{ marginRight: 8 }} />
            {dayjs(selectedJob?.appliedAt).format('MMM D, YYYY')}
          </Text>
        </div>

        <div>
          <Title level={5} style={{ marginBottom: 4 }}>
            Job Status
          </Title>
          <Text>
            <RenderStatusTag status={selectedJob?.status} />
          </Text>
          <Text>Change Status</Text>
          <Select
            defaultValue={selectedJob?.status || 'applied'}
            style={{ width: 120 }}
            onChange={handleStatusChange}
            disabled={loading}
            options={statusOptions}
            loading={loading}
          />
        </div>

        <div>
          <Title level={5} style={{ marginBottom: 4 }}>
            City
          </Title>
          <Text>
            {selectedJob?.city || <Text type='secondary'>Link not added</Text>}
          </Text>
        </div>

        <div>
          <Title level={5} style={{ marginBottom: 4 }}>
            Job Link
          </Title>
          {selectedJob?.link ? (
            <Link
              href={normalizeUrl(selectedJob.link)}
              target='_blank'
              rel='noopener noreferrer'
            >
              {selectedJob.link}
            </Link>
          ) : (
            <Text type='secondary'>Link not added</Text>
          )}
        </div>

        <div>
          <Title level={5} style={{ marginBottom: 4 }}>
            Job Description
          </Title>
          <Text>{selectedJob?.description || 'No description provided'}</Text>
        </div>

        <div>
          <Title level={5} style={{ marginBottom: 4 }}>
            Resume Used
          </Title>
          {selectedJob?.resumeKey ? (
            <Button
              onClick={() => handleGetResume()}
              type='link'
              style={{ padding: 0, height: 'auto', lineHeight: '1' }}
            >
              Access Resume
            </Button>
          ) : (
            <Text type='secondary'>Not specified</Text>
          )}
        </div>
      </Space>
    </Modal>
  )
}

export default JobDetailModal

import React from 'react'
import { Table, Button, Space, Tag, Input } from 'antd'
import dayjs from 'dayjs'

import './jobs.css' // Assuming you have some styles in this file

const JobList = ({ jobs, showDetails }) => {
  const [searchText, setSearchText] = React.useState('')
  const columns = [
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: 'Applied Date',
      dataIndex: 'appliedAt',
      key: 'appliedAt',
      render: (date) => dayjs(date).format('MMM D, YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          applied: 'gold',
          interviewing: 'blue',
          rejected: 'red',
          accepted: 'green',
        }

        const lower = typeof status === 'string' ? status.toLowerCase() : ''
        const color = colorMap[lower] || 'default'
        const label =
          lower.length > 0
            ? lower.charAt(0).toUpperCase() + lower.slice(1)
            : 'Unknown'

        return <Tag color={color}>{label}</Tag>
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, job) => (
        <Button type='default' size='small' onClick={() => showDetails(job)}>
          View Details
        </Button>
      ),
    },
  ]

  // Sort jobs by appliedAt (most recent first)
  const sortedJobs = [...jobs].sort(
    (a, b) => dayjs(b.appliedAt).valueOf() - dayjs(a.appliedAt).valueOf()
  )

  const filteredJobs = [...jobs]
    .filter((job) => {
      const search = searchText.toLowerCase()
      return (
        job.position?.toLowerCase().includes(search) ||
        job.company?.toLowerCase().includes(search)
      )
    })
    .sort((a, b) => dayjs(b.appliedAt).valueOf() - dayjs(a.appliedAt).valueOf())

  return (
    <div className='job-table-container'>
      <Input.Search
        placeholder='Search by position or company'
        allowClear
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      <Table
        columns={columns}
        dataSource={filteredJobs}
        rowKey='jobId'
        pagination={false}
        size='middle'
        bordered
      />
    </div>
  )
}

export default JobList

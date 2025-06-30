import React from 'react'
import { Row, Col, Card, Button } from 'antd'
import { BankOutlined, CalendarOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const statusColorMap = {
  applied: '#fffbe6', // gold-light
  rejected: '#fff1f0', // red-light
  interviewing: '#e6f4ff', // blue-light
  accepted: '#f6ffed', // green-light
}

const JobCard = ({ jobs, showDetails }) => {
  return (
    <div style={{ maxHeight: '60vh', overflowY: 'auto', marginTop: '1rem' }}>
      <Row gutter={[16, 16]}>
        {jobs.map((job) => {
          const lowerStatus = (job.status || '').toLowerCase()
          const backgroundColor = statusColorMap[lowerStatus] || '#ffffff'

          return (
            <Col xs={24} sm={12} md={8} key={job.jobId}>
              <Card
                hoverable
                style={{
                  backgroundColor,
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0',
                }}
              >
                <h3 style={{ fontWeight: 600 }}>{job.position}</h3>

                <p style={{ marginBottom: 4 }}>
                  <BankOutlined style={{ marginRight: 8 }} />
                  {job.company}
                </p>

                <p style={{ marginBottom: 16 }}>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  {dayjs(job.appliedAt).format('MMM D, YYYY')}
                </p>

                <Button type='default' block onClick={() => showDetails(job)}>
                  View Details
                </Button>
              </Card>
            </Col>
          )
        })}
      </Row>
    </div>
  )
}

export default JobCard

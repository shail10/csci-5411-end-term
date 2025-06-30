import React from 'react'

import { Card, Col, Statistic } from 'antd'

import {
  ApartmentOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from '@ant-design/icons'

const JobSummary = ({ jobs, companyCount, currentMonthCount }) => {
  return (
    <>
      <Col span={8}>
        <Card>
          <Statistic
            title='Total Applications'
            value={jobs.length}
            prefix={<FileTextOutlined />}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Statistic
            title='Companies'
            value={companyCount}
            prefix={<ApartmentOutlined />}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Statistic
            title='This Month'
            value={currentMonthCount}
            prefix={<CalendarOutlined />}
          />
        </Card>
      </Col>
    </>
  )
}

export default JobSummary

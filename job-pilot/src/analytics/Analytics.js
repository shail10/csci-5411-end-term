import React from 'react'
import { Bar, Pie, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js'
import dayjs from 'dayjs'
import './Analytics.css' // Assuming you have some styles in this file

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
)

const Analytics = ({ jobs }) => {
  // Pie chart: job status
  const statusCount = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1
    return acc
  }, {})

  const statusPie = {
    labels: Object.keys(statusCount),
    datasets: [
      {
        data: Object.values(statusCount),
        backgroundColor: ['#ffc658', '#82ca9d', '#8884d8', '#ff8042'],
      },
    ],
  }

  // Bar chart: applications per company
  const companyCount = jobs.reduce((acc, job) => {
    acc[job.company] = (acc[job.company] || 0) + 1
    return acc
  }, {})

  const companyBar = {
    labels: Object.keys(companyCount),
    datasets: [
      {
        label: 'Applications',
        data: Object.values(companyCount),
        backgroundColor: '#8884d8',
      },
    ],
  }

  // Line chart: timeline
  const dateCount = jobs.reduce((acc, job) => {
    const date = dayjs(job.appliedAt).format('YYYY-MM-DD')
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  const sortedDates = Object.keys(dateCount).sort()

  const timelineLine = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Applications per day',
        data: sortedDates.map((d) => dateCount[d]),
        borderColor: '#82ca9d',
        backgroundColor: '#82ca9d',
        fill: false,
        tension: 0.2,
      },
    ],
  }

  // Stacked bar: company + status
  const statuses = ['applied', 'interviewing', 'accepted', 'rejected']
  const companies = Array.from(new Set(jobs.map((j) => j.company)))

  const stackedData = {
    labels: companies,
    datasets: statuses.map((status, i) => ({
      label: status,
      data: companies.map(
        (company) =>
          jobs.filter((j) => j.company === company && j.status === status)
            .length
      ),
      backgroundColor: ['#ffc658', '#82ca9d', '#8884d8', '#ff8042'][i],
    })),
  }

  // Pie chart: resume uploaded
  const resumePie = {
    labels: ['Uploaded', 'Not Uploaded'],
    datasets: [
      {
        data: [
          jobs.filter((j) => j.resumeKey !== '').length,
          jobs.filter((j) => j.resumeKey === '').length,
        ],
        backgroundColor: ['#82ca9d', '#ff8042'],
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
    },
  }

  return (
    <div className='analytics-wrapper'>
      <div className='analytics-grid'>
        <div className='chart-card'>
          <h4>Status Distribution</h4>
          <Pie data={statusPie} options={chartOptions} />
        </div>
        <div className='chart-card'>
          <h4>Application Timeline</h4>
          <Line data={timelineLine} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}

export default Analytics

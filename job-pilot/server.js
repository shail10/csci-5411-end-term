const express = require('express')
const path = require('path')
const app = express()

// Serve static React files
app.use(express.static(path.join(__dirname, 'build')))

// Runtime config endpoint
app.get('/config', (req, res) => {
  res.json({
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    REACT_APP_USER_POOL_ID: process.env.REACT_APP_USER_POOL_ID,
    REACT_APP_CLIENT_ID: process.env.REACT_APP_CLIENT_ID,
    REACT_APP_REGION: process.env.REACT_APP_REGION,
  })
})

// Fallback for React Router
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'))
// })

app.all('/{*any}', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

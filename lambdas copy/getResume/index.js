const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

const s3 = new S3Client({ region: 'us-east-1' })
const BUCKET_NAME = process.env.BUCKET_NAME

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
})

exports.handler = async (event) => {
  const userId = event.requestContext?.authorizer?.claims?.sub
  const { jobId, status } = event.queryStringParameters || {}

  if (!userId || !jobId || !status) {
    return response(400, { error: 'Missing fields' })
  }

  const key = `${status}/${userId}/${jobId}.pdf`
  const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key })

  try {
    const url = await getSignedUrl(s3, command, { expiresIn: 900 })
    return response(200, { downloadUrl: url })
  } catch (err) {
    console.error('Error generating download URL:', err)
    return response(500, { error: 'Could not generate access link' })
  }
}

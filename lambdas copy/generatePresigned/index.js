const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const {
  DynamoDBClient,
  UpdateItemCommand,
} = require('@aws-sdk/client-dynamodb')

const REGION = 'us-east-1'
const BUCKET_NAME = process.env.BUCKET_NAME
const TABLE_NAME = process.env.TABLE_NAME

const s3 = new S3Client({ region: REGION })
const dynamo = new DynamoDBClient({ region: REGION })

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
    return response(400, { error: 'Missing required fields' })
  }

  const key = `${status}/${userId}/${jobId}.pdf`

  try {
    // 1. Generate pre-signed URL
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: 'application/pdf',
    })

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 })

    // 2. Save S3 key in DynamoDB
    const updateCmd = new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: {
        userId: { S: userId },
        jobId: { S: jobId },
      },
      UpdateExpression: 'SET resumeKey = :key',
      ExpressionAttributeValues: {
        ':key': { S: key },
      },
    })

    await dynamo.send(updateCmd)

    return response(200, { uploadUrl })
  } catch (err) {
    console.error('Error:', err)
    return response(500, {
      error: 'Failed to generate upload URL or update DB',
    })
  }
}

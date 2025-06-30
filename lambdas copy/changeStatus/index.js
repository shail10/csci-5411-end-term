const {
  DynamoDBClient,
  UpdateItemCommand,
  GetItemCommand,
} = require('@aws-sdk/client-dynamodb')
const {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3')

const REGION = 'us-east-1'
const TABLE_NAME = process.env.TABLE_NAME
const BUCKET_NAME = process.env.BUCKET_NAME

const dynamo = new DynamoDBClient({ region: REGION })
const s3 = new S3Client({ region: REGION })

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
})

exports.handler = async (event) => {
  const userId = event.requestContext?.authorizer?.claims?.sub

  if (!userId) return response(401, { error: 'Unauthorized' })

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return response(400, { error: 'Invalid JSON' })
  }

  const { jobId, newStatus } = body

  if (!jobId || !newStatus) {
    return response(400, { error: 'Missing jobId or newStatus' })
  }

  const getCmd = new GetItemCommand({
    TableName: TABLE_NAME,
    Key: {
      userId: { S: userId },
      jobId: { S: jobId },
    },
  })

  try {
    const data = await dynamo.send(getCmd)
    const item = data.Item

    if (!item || !item.resumeKey?.S) {
      return response(404, { error: 'Resume not found for this job' })
    }

    const oldKey = item.resumeKey.S
    const filename = oldKey.split('/').pop()
    const newKey = `${newStatus}/${userId}/${filename}`

    // 1. Copy object to new location
    await s3.send(
      new CopyObjectCommand({
        Bucket: BUCKET_NAME,
        CopySource: `${BUCKET_NAME}/${oldKey}`,
        Key: newKey,
      })
    )

    // 2. Delete the old object
    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: oldKey,
      })
    )

    // 3. Update DynamoDB
    const updateCmd = new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: {
        userId: { S: userId },
        jobId: { S: jobId },
      },
      UpdateExpression: 'SET #status = :status, resumeKey = :resumeKey',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': { S: newStatus },
        ':resumeKey': { S: newKey },
      },
    })

    await dynamo.send(updateCmd)

    return response(200, {
      message: 'Status and resumeKey updated successfully',
    })
  } catch (err) {
    console.error('Error:', err)
    return response(500, { error: 'Internal server error' })
  }
}

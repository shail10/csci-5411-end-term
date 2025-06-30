const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb')

// AWS Region and table name from environment variables
const REGION = 'us-east-1'
const TABLE_NAME = process.env.TABLE_NAME

// Helper function to include CORS headers
const response = (statusCode, body) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
  },
  body: JSON.stringify(body),
})

// Lambda handler
exports.handler = async (event) => {
  const userId = event.userId || event.requestContext?.authorizer?.claims?.sub

  if (!userId) {
    return response(400, { error: 'Missing userId' })
  }

  const dynamo = new DynamoDBClient({ region: REGION })

  const queryCmd = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'userId = :uid',
    ExpressionAttributeValues: {
      ':uid': { S: userId },
    },
  })

  try {
    const result = await dynamo.send(queryCmd)

    const jobs = result.Items.map((item) => ({
      jobId: item.jobId.S,
      company: item.company?.S || '',
      position: item.position?.S || '',
      status: item.status?.S || '',
      description: item.description?.S || '',
      appliedAt: item.appliedAt?.S || '',
      resumeKey: item.resumeKey?.S || '',
      city: item.city?.S || '',
      link: item.link?.S || '',
    }))

    return response(200, { jobs })
  } catch (err) {
    console.error('DynamoDB query failed:', err)
    return response(500, { error: 'Failed to query jobs' })
  }
}

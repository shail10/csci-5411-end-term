const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb')
const {
  EventBridgeClient,
  PutEventsCommand,
} = require('@aws-sdk/client-eventbridge')

const REGION = 'us-east-1'
const TABLE_NAME = process.env.TABLE_NAME

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
  },
  body: JSON.stringify(body),
})

exports.handler = async (event) => {
  const userId = event.requestContext?.authorizer?.claims?.sub

  if (!userId) {
    return response(401, { error: 'Unauthorized' })
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return response(400, { error: 'Invalid JSON body' })
  }

  const {
    jobId,
    position,
    company,
    description,
    appliedAt,
    status,
    link,
    city,
  } = body

  if (!jobId || !position || !company || !appliedAt) {
    return response(400, { error: 'Missing required fields' })
  }

  const dynamo = new DynamoDBClient({ region: REGION })

  const putCmd = new PutItemCommand({
    TableName: TABLE_NAME,
    Item: {
      userId: { S: userId },
      jobId: { S: jobId },
      position: { S: position },
      company: { S: company },
      description: { S: description || '' },
      appliedAt: { S: appliedAt },
      status: { S: status || 'applied' },
      link: { S: link || '' },
      city: { S: city || '' },
    },
  })

  try {
    await dynamo.send(putCmd)

    const eventBridge = new EventBridgeClient({ region: REGION })

    await eventBridge.send(
      new PutEventsCommand({
        Entries: [
          {
            Source: 'job.tracker',
            DetailType: 'JobApplied',
            EventBusName: process.env.EVENT_BUS_NAME,
            Time: new Date(Date.now() + 10000), // ⏳ 10 seconds from now
            Detail: JSON.stringify({
              userId,
              jobId,
              position,
              company,
            }),
          },
        ],
      })
    )

    return response(200, { message: 'Job added successfully' })
  } catch (err) {
    console.error('Failed to insert into DynamoDB:', err)
    return response(500, { error: 'Failed to add job' })
  }
}

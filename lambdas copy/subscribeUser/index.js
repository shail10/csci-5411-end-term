const {
  SNSClient,
  SubscribeCommand,
  ListSubscriptionsByTopicCommand,
} = require('@aws-sdk/client-sns')

const REGION = 'us-east-1'
const sns = new SNSClient({ region: REGION })

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
  const userEmail = event.requestContext?.authorizer?.claims?.email
  if (!userEmail) {
    return response(400, { error: 'Email not found in user token' })
  }

  const topicArn = process.env.SNS_TOPIC_ARN

  try {
    // 🔍 Check if already subscribed
    const listCmd = new ListSubscriptionsByTopicCommand({ TopicArn: topicArn })
    const { Subscriptions } = await sns.send(listCmd)

    const existingSub = Subscriptions.find(
      (sub) =>
        sub.Protocol === 'email' &&
        sub.Endpoint === userEmail &&
        sub.SubscriptionArn !== 'PendingConfirmation'
    )

    if (existingSub) {
      return response(200, { message: 'Already subscribed' })
    }

    // ➕ Otherwise, initiate subscription
    await sns.send(
      new SubscribeCommand({
        TopicArn: topicArn,
        Protocol: 'email',
        Endpoint: userEmail,
      })
    )

    return response(200, {
      message: 'Subscription initiated. Confirm your email.',
    })
  } catch (err) {
    console.error('SNS subscription error:', err)
    return response(500, { error: 'Failed to subscribe user' })
  }
}

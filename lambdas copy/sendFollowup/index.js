const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns')

const REGION = 'us-east-1'
const TOPIC_ARN = process.env.TOPIC_ARN

const sns = new SNSClient({ region: REGION })

exports.handler = async (event) => {
  try {
    const detail = event.detail
    const { userId, jobId, position, company } = detail

    if (!userId || !jobId || !position || !company) {
      throw new Error('Missing required event details')
    }

    const message = `Hey! You applied for the ${position} role at ${company}. Consider sending a follow-up email if you haven’t heard back.`

    const publishCmd = new PublishCommand({
      TopicArn: TOPIC_ARN,
      Subject: `Reminder to Follow Up on ${position} @ ${company}`,
      Message: message,
    })

    await sns.send(publishCmd)

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Follow-up reminder sent.' }),
    }
  } catch (err) {
    console.error('Failed to send follow-up reminder:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}

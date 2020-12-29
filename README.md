# Telegram bot for fetching buzzsprout podcast stats, runs on google cloud functions

## Env variables

Define these as runtime env variables;

| variable                 | description                                                        |
|--------------------------|--------------------------------------------------------------------|
| BOT_TOKEN                | telegram bot token, get this from @BotFather when creating the bot |
| BOT_NAME                 | name of the bot (without leading @)                                |
| BUZZSPROUT_PODCAST_ID    | Id of the podcast hosted on buzzsprout                             |
| BUZZSPROUT_PODCAST_TOKEN | Buzzsprout API token, find this in buzzsprout profile settings     |

## Logging

In function logs, query by;
```
resource.type = "cloud_function"
resource.labels.function_name = "kulakshow-telegram-bot"
resource.labels.region = "us-central1"
 severity>=DEFAULT
jsonPayload.name="kulakshow-telegram-bot-node-logger"
```

to filter logs sent by the configured logger
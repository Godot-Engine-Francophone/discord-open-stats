# Discord open stats

Aim of this application is to track anonymously a discord server activity

## Setup

### Prerequisite

- Requires a postgresql connection (not yet used fbut for further update)
- Requires NodeJS v12
- A google analytics tracking ID
- A discord developper token ready to be used.

### Configuration

Either update the `production.json` file or use the environment variables (see `config/custom-environment-variables.json`)

### Usage

```shell
git clone git@github.com:binogure-studio/discord-open-stats.git
cd discord-open-stats/
npm install
NODE_ENV=production npm start
```


## What does it track?

It send an event everytime:

- A user send a message
- A bot send a message
- A new member join your discord server
- A user leave your discord server without having sent any message
- An active user leave your discord server.
- A user connection

Every 10 minutes it sends the number of user of your discord server

## Does it track any personal data?

NO

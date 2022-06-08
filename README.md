# mem

a [Sails v1](https://sailsjs.com) application


# Development
```sh
# start up mongo server
sudo mongod --dbpath ../data/db
cp .env.example .env
# Import database and update .env
npm start
```

## Loading the DB
```sh
~/Downloads/mongodb-database-tools-macos-x86_64-100.5.2/bin/mongorestore --archive="/Users/retnan/Downloads/election_monitoring_presidential.2019030701341.archive"
```

## Import Guide

http://localhost:1337/api/ImportPollingUnit?raw=1
data type in postman must be set to raw
{SN} in CSV is ignored on the backend but must be sent

## CSV Format for Polling Unit Import
```csv

{SN}, {STATE}, {SENATORIAL ZONE}, {LGA}, {WARD}, {PU}, {DELIMITATION}, {AGENT_PHONE}, {AGENT_NAME}

``` 

## CSV Format for Incident Type Import
```csv

{SN}, {INCIDENCE CODE}, {INCIDENCE DESCRIPTION}, {PRIORITY LEVEL}

``` 

## Deploy
```sh
npm install -g grunt-cli
grunt build && git add . && git commit -m "debug" && git push heroku master && heroku logs --tail
```

## ENVs
```sh
export APP_URL=https://mighty-waters-live.herokuapp.com
export EBULK_APIKEY="" # Default is available
export EBULK_CUSTOMER_ID="" # Default is available
export MONGODB_URI=""
export REDIS_URL=""
export SMS_TITLE="" # Default: Monitor
export CONTROL_LEVEL="" # {WARD, PU} Default: WARD 
export STATE="Plateau State" # Default: Plateau State
export ELECTION_YEAR="2019" # Default: 2019
```


## DB LIVE
```
mongodump -u election_monitoring -p "election_m0nitar" --archive=election_monitoring.201902231730.archive --db election_monitoring --authenticationDatabase election_monitoring
```
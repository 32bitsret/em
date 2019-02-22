# mem

a [Sails v1](https://sailsjs.com) application


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
```sh mongo localhost:27017/election_monitoring -u election_monitoring -p election_m0nitar

```
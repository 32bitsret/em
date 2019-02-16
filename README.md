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

{SN}, {INCIDENCE CODE}, {INCIDENCE DESCRIPTION}

``` 

## Deploy
```sh
npm install -g grunt-cli
grunt build && git add . && git commit -m "debug" && git push heroku master && heroku logs --tail
```
import pkg from 'csvtojson'
import uniqid from 'uniqid'
import dotenv from 'dotenv'
import { Client } from '@elastic/elasticsearch'

dotenv.config()
const { csv } = pkg

let entries = []

// Get data and create array with objects.
const csvFilePath = './argentina.csv'
csv().fromFile(csvFilePath)
    .then((jsonObj) => {
        jsonObj.forEach((row) => {
            row.id = uniqid() // Give each obj a unique ID
            entries.push(row)
        })
        console.log(jsonObj)
    })

// Create index
let dataIndex = ''

// Create Elastic client
const client = new Client({
    node: 'https://localhost:9200',
    auth: {
        username: 'elastic',
        fingerprint: process.env.FINGERPRINT,
        password: process.env.PASSWORD
    }
})

// Save data to ElasticSearch (BulkAll --> read doc)

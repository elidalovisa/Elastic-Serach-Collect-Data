import pkg from 'csvtojson'
import uniqid from 'uniqid'
import dotenv from 'dotenv'
import { Client } from '@elastic/elasticsearch'

dotenv.config()
const { csv } = pkg

let entries = []
let date = new Date().toISOString().slice(0, 10)
console.log(date)


// Get data and create array with objects.
const csvFilePath = './argentina.csv'
csv().fromFile(csvFilePath)
    .then((jsonObj) => {
        jsonObj.forEach((row) => {
            row.id = uniqid() // Give each obj a unique ID
            row.TimeStamp = date
            entries.push(row)
        })
        //  console.log(jsonObj)
    })

// Create Elastic client
const client = new Client({
    node: 'https://localhost:9200',
    auth: {
        username: 'elastic',
        fingerprint: process.env.FINGERPRINT,
        password: process.env.PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
})
/*
try {
    let result = await client.info()
    console.log(result)
} catch (error) {
    console.log(error)
}
*/
// Create index
async function createIndex() {
    await client.indices.create({
        index: 'test',
        operations: {
            mappings: {
               /* source: {
                    _timestamp: { type: 'TimeStamp'},
                },*/
                properties: {
                    timestamp: { type: 'date'},
                    province: { type: 'text' },
                    gdp: { type: 'integer' },
                    illiteracy: { type: 'integer' },
                    poverty: { type: 'integer' },
                    deficient_infra: { type: 'integer' },
                    school_dropout: { type: 'integer' },
                    no_healthcare: { type: 'integer' },
                    birth_mortal: { type: 'integer ' },
                    pop: { type: 'integer' },
                    movie_theatres_per_cap: { type: ' integer' },
                    doctors_per_cap: { type: 'integer' },
                    id: { type: 'key' },
                }
            }
        }
    }, { ignore: [400] })


    const operations = entries.flatMap(doc => [{ index: { _index: 'test' } }, doc])
    const bulkResponse = await client.bulk({ refresh: true, operations })
   // console.log(bulkResponse.items[1])
}

createIndex()

// Save data to ElasticSearch (BulkAll --> read doc)

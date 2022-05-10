import pkg from 'csvtojson'
import uniqid from 'uniqid'
import dotenv from 'dotenv'
import { Client } from '@elastic/elasticsearch'

dotenv.config()
const { csv } = pkg
/**
 * Encapsulates a controller.
 */
export class Controller {
    constructor() {
        this.client
        this.entries = []

    }

    async connectClient() {
        let date = new Date().toISOString().slice(0, 10)

        // Get data and create array with objects.
        const csvFilePath = './argentina.csv'
        csv().fromFile(csvFilePath)
            .then((jsonObj) => {
                jsonObj.forEach((row) => {
                    row.id = uniqid() // Give each obj a unique ID
                    row.TimeStamp = date // Add timestamp
                    this.entries.push(row)
                })
            })

        // Create Elastic client
        this.client = new Client({
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
    }

// Create index
async createIndex() {
    await this.client.indices.create({
        index: 'argentina',
        operations: {
            mappings: {
                properties: {
                    timestamp: { type: 'date' },
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


    const operations = this.entries.flatMap(doc => [{ index: { _index: 'argentina' } }, doc])
    const bulkResponse = await this.client.bulk({ refresh: true, operations })
    return bulkResponse
}

async go(req, res, next) {
    this.connectClient()
    const response = await this.createIndex()
    console.log(response)
    res.send(response)
}
 }
//createIndex()

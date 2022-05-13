import pkg from 'csvtojson'
import uniqid from 'uniqid'
import elasticsearch from 'elasticsearch'

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

        // Create Elastic client code from: https://docs.bonsai.io/article/103-node-js
        this.client = elasticsearch.Client({
            host: process.env.BONSAI_URL
        })

        this.client.ping({
            requestTimeout: 30000,
        }, function (error) {
            if (error) {
                console.error('elasticsearch cluster is down!');
            } else {
                console.log('All is well');
            }
        })
    }

    // Check if index exist if not create index
    async createIndex() {
        const exist = await this.client.indices.exists({
            index: 'argentina'
        })
        if (exist) {
            const operations = this.entries.flatMap(doc => [{ index: { _index: 'argentina' } }, doc])
            const bulkResponse = await this.client.bulk({ body: operations })

            return bulkResponse
        } else {
            await this.client.indices.create({
                index: 'argentina',
                body: {
                    mappings: {
                        properties: {
                            timestamp: { type: 'date' },
                            province: { type: 'text' },
                            gdp: { type: 'text' },
                            illiteracy: { type: 'text' },
                            poverty: { type: 'text' },
                            deficient_infra: { type: 'text' },
                            school_dropout: { type: 'text' },
                            no_healthcare: { type: 'text' },
                            birth_mortal: { type: 'text' },
                            pop: { type: 'text' },
                            movie_theatres_per_cap: { type: 'text' },
                            doctors_per_cap: { type: 'text' },
                            id: { type: 'text' },
                        }
                    }
                }
            }, { ignore: [400] })
        }

        const operations = this.entries.flatMap(doc => [{ index: { _index: 'argentina' } }, doc])
        const bulkResponse = await this.client.bulk({ body: operations })

        return bulkResponse
    }

    async go(req, res, next) {
        this.connectClient()
        const response = await this.createIndex()
        res.send(response)
    }
}

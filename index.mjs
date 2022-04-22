import pkg from 'csvtojson'
import uniqid from 'uniqid'

const { csv } = pkg
let entries = []
let count = 0

// Code: https://nodogmablog.bryanhogan.net/2020/10/reading-csv-files-into-objects-with-node-js/
const csvFilePath = './argentina.csv'
csv().fromFile(csvFilePath)
.then((jsonObj) => {
    jsonObj.forEach((row) =>  { 
        count++
        row.id = uniqid()
        entries.push(row)
    })
    console.log(jsonObj)
})

// End of code from above source


// Loop/sort data -> Create objects in an array?

// Each document needs to have a unique id -> Create an ID

// Create index
let musicData = ''

// Create Elastic client

// Save data to ElasticSearch (BulkAll --> read doc)

import fs from 'node:fs'
import path from 'node:path'
import { stringify } from 'yaml'
import { openApiDoc } from './openapi-generator'

// generate openApi docs with zod
// two versions json and yml

//yml format
// convert OpenApi to yml
const ymlDoc = stringify(openApiDoc)

const scriptDir = path.resolve(__dirname)

//write yml file
fs.writeFileSync(`${scriptDir}/openapi.yml`, ymlDoc)
console.log('OpenApi generated in yml format')

//json format
const jsonDoc = JSON.stringify(openApiDoc, null, 2)
// write to json file
fs.writeFileSync(`${scriptDir}/openapi.json`, jsonDoc)
console.log('OpenApi generated in JSON format')

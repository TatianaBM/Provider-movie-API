import fs from 'node:fs'
import path from 'node:path'
import { stringify } from 'yaml'
import { openApiDoc } from './openapi-generator'

// generate openApi docs with zod
// two versions json and yaml

//YAML format
// convert OpenApi to yaml
const yamlDoc = stringify(openApiDoc)

const scriptDir = path.resolve(__dirname)

//write yaml file
fs.writeFileSync(`${scriptDir}/openapi.yaml`, yamlDoc)
console.log('OpenApi generated in YAML format')

//json format
const jsonDoc = JSON.stringify(openApiDoc, null, 2)
// write to json file
fs.writeFileSync(`${scriptDir}/openapi.json`, jsonDoc)
console.log('OpenApi generated in JSON format')

import babel from "@babel/core"
import { readdir, writeFile, mkdir  }  from 'node:fs/promises'
import { watch } from "node:fs"
import config from "../config.js"



const {distPath, templatePath} = config


export default class Transform {

    constructor() {
        this.init()
    }

    init = async () => {
        try {
            await mkdir(`${distPath}/templates` , {recursive: true})
        } catch(e) {
            if (!e.code || e.code != "EEXIST") {
                throw e
            }
        }        
        this.transformAllTemplates()
        
        watch(templatePath, (eventType, filename) => {
            if (filename) {
                this.transformTemplate(filename)
            } 
        });
    }

    transformTemplate = async (filename) => {    
        const resp = await babel.transformFileAsync(`${templatePath}/${filename}`, {
            presets: ["@babel/preset-react", "minify"]
        })
        writeFile(`${distPath}/templates/${filename.replace(/\.\w*$/gm, ".template")}`, resp.code)
        console.log(`Updating Template: ${filename}`)
    }
    
    transformAllTemplates = async () => {
        try {
            const files = await readdir(templatePath);
            for (const file of files) {
                await this.transformTemplate(file)
            }
              
          } catch (err) {
            console.error(err);
        }
    }
}











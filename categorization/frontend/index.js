const express = require('express')
const babel = require("@babel/core");
const crypto = require('crypto');

const { readdir, writeFile, mkdir,  stat, readFile  }  = require('node:fs/promises');
const {  watch, watchFile }  = require('node:fs');

const TEMPLATE_PATH = "./templates"
const DIST_PATH = "./dist"


const app = express()
const port = 3000

const sendFile = async (res, filename) => {
    const contents = await readFile(filename, 'utf8')
    const hashSum = crypto.createHash('sha256');
    hashSum.update(contents);
    const hex = hashSum.digest('hex');
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/plain; charset=utf-8')
    res.setHeader('Transfer-Encoding', 'chunked')
    res.setHeader('ETag', hex)    
    res.send(contents)
}
 
app.get('/*', async (req, res) => {    
    const templateName = req.url
    const filename = `${DIST_PATH}${templateName}`
    console.log(`Fetching  ${filename}` )
    try {
        const fsStat = await stat(filename)
        if (!fsStat.isFile) {
            res.status(404).send("{error: 'Not found'}")
            return
        }
    } catch (e) {
        if (e.code === "ENOENT") {
            res.status(404).send("{error: 'Not found'}")
            return            
        }        
    }    
    try {
        const currentEtag = req.headers.etag
        console.log("CURRENT", currentEtag)

        const contents = await readFile(filename, 'utf8')
        const hashSum = crypto.createHash('sha256');
        hashSum.update(contents);
        const hex = hashSum.digest('hex');
    
        
        
        if (currentEtag != hex) {
            await sendFile(res, filename)
        } else {
            var sent = false
            watch(filename, {persistent: false} ,  async () => {
                if (!sent) {
                    sent = true
                    sendFile(res, filename)
                }        
            })        
        }
    } catch (e) {
        console.error(e)
        res.end()
    }
})

app.listen(port, () => {
    console.log(`Miniapp Debugger listening on port:  ${port}`)
})  

const init =  async () => {
    try {
        await mkdir(`${DIST_PATH}/templates` , {recursive: true})
    } catch(e) {
        if (!e.code || e.code != "EEXIST") {
            throw e
        }
    }        
    transformAllTemplates()
    
    watch(TEMPLATE_PATH, (eventType, filename) => {
        if (filename) {
            transformTemplate(filename)
        } 
    });
    
}

const transformTemplate = async (filename) => {    
    const resp = await babel.transformFileAsync(`${TEMPLATE_PATH}/${filename}`, {
        presets: ["@babel/preset-react"]
    })
    writeFile(`${DIST_PATH}/templates/${filename.replace(/\.\w*$/gm, ".template")}`, resp.code)
    console.log(`Updating Template: ${filename}`)
}

const transformAllTemplates = async () => {
    try {
        const files = await readdir(TEMPLATE_PATH);
        for (const file of files) {
            await transformTemplate(file)
        }
          
      } catch (err) {
        console.error(err);
    }
}
init()






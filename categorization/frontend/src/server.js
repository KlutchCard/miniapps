import express from "express"
import crypto from "crypto"
import {  stat, readFile  } from "node:fs/promises"
import { watch } from "node:fs"
import config from "../config.js"
/* const express = require('express')
const crypto = require('crypto');

const {  stat, readFile  }  = require('node:fs/promises');
const {  watch}  = require('node:fs'); */



const {distPath, port} = config


export default class Server {
    app = express()

    constructor() {
        this.setRoutes()
    }


    sendFile = async (res, filename) => {
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

    setRoutes = () => {
        this.app.get('/*', async (req, res) => {    
            const templateName = req.url
            const filename = `${distPath}${templateName}`
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
        
                const contents = await readFile(filename, 'utf8')
                const hashSum = crypto.createHash('sha256');
                hashSum.update(contents);
                const hex = hashSum.digest('hex');
            
                
                
                if (currentEtag != hex) {
                    await this.sendFile(res, filename)
                } else {
                    var sent = false
                    watch(filename, {persistent: false} ,  async () => {
                        if (!sent) {
                            sent = true
                            this.sendFile(res, filename)
                        }        
                    })        
                }
            } catch (e) {
                console.error(e)
                res.end()
            }
        })
    }
     
    

    start = function() {
        this.app.listen(port, () => {
            console.log(`Miniapp Debugger listening on port:  ${port}`)
        })  
    }
}















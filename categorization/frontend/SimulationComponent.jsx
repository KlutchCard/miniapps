import * as Klutch from '@klutch-card/klutch-components';
import { Asset } from 'expo-asset';
import React, { useEffect, useState, useCallback } from "react";
import equal from "deep-equal";
import axios from "axios";



const SimulationComponent =  ({serverUrl, token, template, type, name, data, onLoadTemplate, panelConfigCallback}) => {
    
    const [content, setContent] = useState(null)
    const [templateState, setTemplateState] = useState()
    const [reRender, setReRender] = useState(0)
    const [config, setConfig] = useState({})
    const [initCallback, setInitCallback] = useState()
    const [init, setInit] = useState(false)
            
    useEffect(() => {        
        const run = async () => {
            if(template) {                
                const mod = await Asset.loadAsync(template)
                const resp = await fetch(mod[0].uri);                            
                const doc = await resp.text()               
                setContent(doc)  
            }
        }
        run()
    })

    useEffect(() => {
        if (initCallback) {
            console.log("DOING")
            if (isPromise(initCallback)) {
                initCallback.then()
            } else {
                initCallback()    
            }            
        }
    }, [init])

    const react = React    

    if (!content) {
        return <Klutch.KText>Loading...</Klutch.KText>
    }
    
    const simulationContext = {        
        loadTemplate(templateName, templateData) {
            onLoadTemplate &&  onLoadTemplate(templateName, templateData)
        },
        setState(stateObj) {
            if (equal(stateObj, this.state)) {
                return
            }
            setTemplateState(obj => {
                var target = obj || {}
                const resp = Object.assign(target, stateObj)
                
                if (resp != obj) {
                    setReRender(r => r + 1)
                }
                return resp
            })
            
        },        
        state: templateState,
        async post(path, data) {
            
            const resp = await axios.post(`${recipeInstall.recipe.serverUrl}${path}`, {                
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                data: data                
            })
            return resp.data
        },
        async get(path, data) {
            try {                
                const resp = await axios.get(`${serverUrl}${path}`, {                    
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    data: data                
                })                
                return resp.data  
            } catch (e) {
                console.error(e)
            }
        },
        closeMiniApp() {
            onLoadTemplate();
        },
        changePanelData(panelId, data) {

        },
        setPanelConfig(conf) {
            if (!equal(config,conf)) {
                setConfig(conf)
            }            
        }, 
        init(callback) {
            if(!init) {
                setInitCallback(callback)
                setInit(true)    
            }
        }
    }

    const drawTemplate = function() {
        const r = eval(content)
        const React = react
        const { DateTime } = require("luxon");
        const Victory = require("victory-native")
        const AlloyJS = require("@klutch-card/klutch-js")
        return r(data, simulationContext)
    }

    if (type === "fullscreen") {
        return (
            <Klutch.KScreen style={config.backgroundColor ? {backgroundColor: config}: null}>
                {drawTemplate()}
            </Klutch.KScreen>  
        )
    } else {
        return (
            <Klutch.KScreen>
                <Klutch.KMiniAppPanel recipeName={name} panelStyle={type}>
                    {drawTemplate()}
                </Klutch.KMiniAppPanel>
            </Klutch.KScreen>
        )

    }

}

const isPromise = v => typeof v === 'object' && typeof v.then === 'function'

export default SimulationComponent




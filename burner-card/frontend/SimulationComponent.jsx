import * as Klutch from '@klutch-card/klutch-components';
import { Asset } from 'expo-asset';
import React, { useEffect, useState } from "react";
import axios from 'axios'
import { config } from './config'


const SimulationComponent = ({ template, type, name, data, onLoadTemplate }) => {
  const [content, setContent] = useState(null)
  const [templateState, setTemplateState] = useState()
  const [reRender, setReRender] = useState(0)

  useEffect(() => {
    const run = async () => {
      if (template) {
        const mod = await Asset.loadAsync(template)
        const resp = await fetch(mod[0].uri);
        const doc = await resp.text()
        setContent(doc)
      }
    }
    run()
  })

  const react = React

  if (!content) {
    return <Klutch.KText>Loading...</Klutch.KText>
  }

  const simulationContext = {
    loadTemplate(templateName, templateData) {
      onLoadTemplate && onLoadTemplate(templateName, templateData)
    },
    setState(stateObj) {
      setTemplateState(obj => {
        var target = obj || {}
        const resp = Object.assign(target, stateObj)
        return resp
      })
      setReRender(r => r + 1)
    },
    state: templateState,
    async post(path, data) {
      const resp = await axios({
        url: `${config.recipe.serverUrl}${path}`,
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer EXAMPLEAUTHKEY`
        },
        data: data
      })
      return resp
    },
    async get(path) {
      const resp = await axios({
        url: `${config.recipe.serverUrl}${path}`,
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer EXAMPLEAUTHKEY`
        },
      })
      return resp.data
    },
    closeMiniApp() {
      onLoadTemplate();
    },
    redirect(path) {
      console.log(`redirect to ${path}`)
    },
    changePanelData(panelId, data) {
    }
  }

  const drawTemplate = function () {
    const r = eval(content)
    const React = react
    const { DateTime } = require("luxon");
    return r(data, simulationContext)
  }

  if (type === "fullscreen") {
    return (
      <Klutch.KScreen>
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

export default SimulationComponent

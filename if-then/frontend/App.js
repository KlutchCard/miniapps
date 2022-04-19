import React, { useState } from 'react';
import {View} from "react-native";
import { useFonts, Inter_400Regular, Inter_600SemiBold,  Inter_700Bold  } from '@expo-google-fonts/inter';
import AppLoading from 'expo-app-loading';
import SimulationComponent from './SimulationComponent';
import {KText, KButton, KScreen} from "@klutch-card/klutch-components"


const APPNAME = "If / Then"

const Templates = {
  AddAction: {filename: "/templates/AddAction.template", type: "fullscreen", template: require(`./dist/templates/AddAction.template`)},
  AddCondition: {filename: "/templates/AddCondition.template", type: "fullscreen", template: require(`./dist/templates/AddCondition.template`)},
  Main: {filename: "/templates/Main.template", type: "fullscreen", template: require(`./dist/templates/Main.template`)},
  InitAutomation: {filename: "/templates/InitAutomation.template", type: "fullscreen", template: require(`./dist/templates/InitAutomation.template`)},
  TransactionPanel: {filename: "/templates/TransactionPanel.template", type: "transaction", template: require(`./dist/templates/TransactionPanel.template`)},
}

const initialData = {
  "action": {
    "expanded": false,
    "key": "freezeCard",
    "title": "Autolock Card",
    "value": ""
  },
  "condition": {
    "key": "merchantName",
    "title": "Merchant is ",
    "value": "Store"
  }
}

export default function App() {

  let [fontsLoaded] = useFonts({Inter_400Regular, Inter_600SemiBold, Inter_700Bold});
  const [templateToLoad, setTemplateToLoad]  = useState()
  const [templateData, setTemplateData] = useState(initialData)

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  if (!templateToLoad) {
    const buttonStyle = {marginVertical: 10, maxHeight: 200}


    return (
      <KScreen style={{flex: 1, marginVertical: 30, justifyContent: 'space-evenly'}}>
        <KText>What template do you want to open?</KText>
        <KButton type="primary" style={buttonStyle} label="Main" onPress={() => setTemplateToLoad(Templates.Main)} />
        <KButton type="primary" style={buttonStyle} label="TransactionPanel" onPress={() => setTemplateToLoad(Templates.TransactionPanel)} />
        <KButton type="primary" style={buttonStyle} label="TransactionBlankPanel" onPress={() => {
          setTemplateToLoad(Templates.TransactionPanel)
          setTemplateData({recipeId: 'IfThen'})
        }} />
      </KScreen>
    )
  }

  const onLoadTemplate = (templateName, templateData) => {
    setTemplateData(templateData || initialData)
    const template = Object.keys(Templates).map(c => Templates[c]).find(c => c.filename == templateName)
    setTemplateToLoad(template)
  }

  return (
    <View>
      <SimulationComponent
        name={APPNAME}
        type={templateToLoad.type}
        template={templateToLoad.template}
        data={templateData}
        onLoadTemplate={onLoadTemplate} />
    </View>
  );
}

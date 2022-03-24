import React, { useState } from 'react';
import { View } from "react-native";
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import AppLoading from 'expo-app-loading';
import SimulationComponent from './SimulationComponent';
import { KText, KButton, KScreen } from "@klutch-card/klutch-components"


/* MINIAPP CONFIGURATION */

const APPNAME = "Demo MiniApp"

const Templates = {
  Main: { type: "fullscreen", template: require(`./dist/templates/Main.template`) },
  Home: { type: "home", template: require(`./dist/templates/Home.template`) },
}

const initialData = {
  transaction: {
    id: "0d2b05d9-68fd-4dd3-a354-25199bd55d48",
    merchantName: "Sport's Academy",
    cardName: "Shopping Card",
    amount: 453.20,
    category: "SHOPPING",
    date: new Date("2021-03-25T11:43:23Z")
  }
}

/* END MINIAPP CONFIGURATION */

export default function App() {
  let [fontsLoaded] = useFonts({ Inter_400Regular, Inter_600SemiBold, Inter_700Bold });
  const [templateToLoad, setTemplateToLoad] = useState()
  const [templateData, setTemplateData] = useState(initialData)

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  if (!templateToLoad) {
    const buttonStyle = { marginVertical: 10 }

    return (
      <KScreen style={{ flex: 1, marginVertical: 30, justifyContent: 'space-evenly' }}>
        <KText>What template do you want to open?</KText>
        <KButton type="primary" style={buttonStyle} label="Main" onPress={() => setTemplateToLoad(Templates.Main)} />
        <KButton type="primary" style={buttonStyle} label="Home Panel" onPress={() => setTemplateToLoad(Templates.Home)} />
      </KScreen>
    )
  }

  const onLoadTemplate = (templateName, templateData) => {
    setTemplateData(templateData)
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

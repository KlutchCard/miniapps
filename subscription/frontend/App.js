import React, { useState } from 'react';
import {View} from "react-native";
import { useFonts, Inter_400Regular, Inter_600SemiBold,  Inter_700Bold  } from '@expo-google-fonts/inter';
import AppLoading from 'expo-app-loading';
import SimulationComponent from './SimulationComponent';
import {KText, KButton, KScreen, PlusSign} from "@klutch-card/klutch-components"




/* MINIAPP CONFIGURATION */

const APPNAME = "Subcription Tracker"

const Templates = {
  Main: {
    filename: "/templates/Main.template",
    type: "fullscreen", 
    template: require(`./dist/templates/Main.template`)
  },
  Transaction: {
    filename: "/templates/Transaction.template",
    type: "transaction", 
    template: require(`./dist/templates/Transaction.template`)
  },
  TransactionSubscription: {
    filename: "/templates/TransactionSubscription.template",
    type: "transaction",
    template: require(`./dist/templates/TransactionSubscription.template`)
  },
  Home: {
    filename: "/templates/Home.template",
    type: "home", 
    template: require(`./dist/templates/Home.template`),        
  },
  Add: {
    filename: "/templates/Add.template",
    type: "fullscreen", 
    template: require(`./dist/templates/Add.template`)
  },
  SubscriptionList: {
    filename: "/templates/SubscriptionList.template",
    type: "fullscreen",
    template: require(`./dist/templates/SubscriptionList.template`)
  }
}

const initialData = {
    "transaction": {
        "id": "43f8ee39-6149-49e6-9339-82db57982125",
        "transactionDate": "2021-04-21T16:50:53.000Z",
        "card": {
            "id": "f7b6d963-cd12-41d5-b31f-5c31d93e934e",
            "name": "Renato Steinberg",
            "lastFour": null,
            "expirationDate": null,
            "media": "PLASTIC",
            "status": "PENDING",
            "color": "#2B2B2B",
            "isLocked": false,
            "autoLockDate": null
        },
        "transactionStatus": "PENDING",
        "merchantName": "Netflix",
        "amount": 10.05,
        "category": null,
        "mcc": "MCC(code=1234, description=null, category=null)"
    }
}




/* END MINIAPP CONFIGURATION */


export default function App() {

  let [fontsLoaded] = useFonts({Inter_400Regular, Inter_600SemiBold, Inter_700Bold});
  const [templateToLoad, setTemplateToLoad]  = useState()
  const [templateData, setTemplateData] = useState(initialData)



  if (!fontsLoaded) {
    return <AppLoading />;
  }

  if (!templateToLoad) {
    const buttonStyle = {marginVertical: 10}  

    return (
      <KScreen style={{flex: 1, marginVertical: 30, justifyContent: 'space-evenly'}}>        
        <KText>What template do you want to open?</KText>
        <KButton type="primary" style={buttonStyle} label="Main" onPress={() => setTemplateToLoad(Templates.Main)} />
        <KButton type="primary" style={buttonStyle} label="Transaction Panel" onPress={() => setTemplateToLoad(Templates.Transaction)} />
        <KButton type="primary" style={buttonStyle} label="Transaction Subscription Panel" onPress={() => {
            setTemplateData({merchant: "NETFLIX", amount: 12.34, totalYear: 234.56, recurrency: "MONTHLY", renewalDate: "2021-09-05", nextPayment: "2021-09-05"})
            setTemplateToLoad(Templates.TransactionSubscription)
          }} />
        <KButton type="primary" style={buttonStyle} label="Home Panel" onPress={() => {
          setTemplateData(homeData)
          setTemplateToLoad(Templates.Home)
        }} />   
        <KButton type="primary" style={buttonStyle} label="Subscription List" onPress={() => {
          setTemplateData(homeData)
          setTemplateToLoad(Templates.SubscriptionList)
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


const subscriptionList = {
  
}


const homeData = {
  "sumMonth": 10.38,
  "sumYear": 145.37,
  "subscriptions" : [ 
      {
          "nextPayment" : "2021-06-05T17:10:46.746-07:00",
          "recipeInstallId" : "44a5ff15-084d-4aab-85ef-bc7af835bb2a",
          "day" : 5,
          "name" : "Netflix",
          "amount": 23.45,
          "subscriptionId" : "4197045f-c491-4c73-8d4b-44b208d7b528",
          "frequency" : "MONTHLY",
          "totalPaid": 124.76          
      }, 
      {
          "nextPayment" : "2021-06-05T17:10:46.746-07:00",
          "recipeInstallId" : "44a5ff15-084d-4aab-85ef-bc7af835bb2a",
          "day" : 15,
          "name" : "Spotify",
          "amount": 29.48,
          "subscriptionId" : "42275d0f-032d-42dd-9c37-1f9b547f29f4",
          "frequency" : "YEARLY",
          "totalPaid": 127.62
      }, 
      {
          "nextPayment" : "2021-06-05T17:10:46.746-07:00",
          "recipeInstallId" : "44a5ff15-084d-4aab-85ef-bc7af835bb2a",
          "day" : 26,
          "name" : "Microsoft",
          "amount": 49.54,
          "subscriptionId" : "7345ae13-fca1-4824-ac9d-9e4d420632bf",
          "frequency" : "MONTHLY",
          "totalPaid": 454.76
      }
  ]
}
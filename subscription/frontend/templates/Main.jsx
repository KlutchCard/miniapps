Template = (data, context) => {

    const K = Klutch

    return (
        <Klutch.KView style={{ flex: 1, paddingBottom: 20 }}>
            <K.KHeader showBackArrow>Subscription</K.KHeader>
            <K.KText style={{textAlign: "center"}} fontWeight="bold">HOW TO START</K.KText>
            
            <Klutch.KText style={{ textAlign: "center", marginTop: 15 }}>1. Use your Klutch card as your payment method for subscriptions.</Klutch.KText>
            <Klutch.KText style={{ textAlign: "center", marginTop: 15 }}>2. Klutch AI will look for subscriptions as you spend and will start adding them here.</Klutch.KText>
            <Klutch.KText style={{ textAlign: "center", marginTop: 15 }}>3. To add manually, when charged for a subscription, click the plus button below the subcription Tracker panel within transaction detail</Klutch.KText>
            <Klutch.KView style={{ flex: 1, justifyContent: "center", marginTop: 15 }} >
                <Klutch.KImage source={{ uri: "https://klutch-test-public.s3.amazonaws.com/phone.png" }} style={{ height: 350 }} resizeMode="contain" />
            </Klutch.KView>            
            <Klutch.KButtonBar >
                <Klutch.KButton type="primary" label="GO TO TRANSACTIONS" link="/transactions" />
            </Klutch.KButtonBar>
        </Klutch.KView>   
    )
}


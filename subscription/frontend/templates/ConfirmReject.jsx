Template = (data, context) => {

    const K = Klutch

    const s = {
        body: {
            flex: 1
        },
        name: {
            fontSize: 30
        },
        table: {

        }, 
        line: {
            flexDirection: "row",
            justifyContent: "space-between",
            borderBottomWidth: 1,
            borderColor: "#bcbcbc",
            paddingVertical: 20
        },
        button: {
            marginTop: 40,
            flex: 1            
        },
        
    }


    const rejectClicked = async () => {
        await context.post(`/subscriptions/${data.subscriptionId}/reject`)
    }


    return (
        <K.KView style={{ flex: 1, paddingBottom: 20 }}>
            <K.KHeader >Are you sure?</K.KHeader>      
            <K.KView style={s.body}>
                <K.KText>You're about to program your card to reject all future payments of this subscription.</K.KText>
                <K.KButtonBar>
                    <K.KButton style={s.button} label="EXIT" type="outline" onPress={() => context.redirect("/")} />                
                    <K.KButton style={s.button} label="YES, REJECT" type="primary" onPress={rejectClicked} />                
                </K.KButtonBar>
                
            </K.KView>
        </K.KView>   
    )

    
}

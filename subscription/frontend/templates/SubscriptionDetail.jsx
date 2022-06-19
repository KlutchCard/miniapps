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
            flex: 0
        }
    }



    return (
        <K.KView style={{ flex: 1, paddingBottom: 20 }}>
            <K.KHeader showBackArrow>SUBSCRIPTIONS</K.KHeader>      
            <K.KView style={s.body}>
                <K.KText style={s.name} fontWeight="bold">{data.name}</K.KText>
                <K.KView style={s.table}>
                    <K.KView style={s.line}>
                        <K.KText>Total spent this year</K.KText>
                        <K.KText>{data.totalPaid}</K.KText>
                    </K.KView>
                    <K.KView style={s.line}>
                        <K.KText>Frequency</K.KText>
                        <K.KText>{data.frequency}</K.KText>
                    </K.KView>
                    <K.KView style={s.line}>
                        <K.KText>Payment</K.KText>
                        <K.KText>{data.amount}</K.KText>
                    </K.KView>
                    <K.KView style={s.line}>
                        <K.KText>Next Payment On</K.KText>
                        <K.KText>{DateTime.fromISO(data.nextPayment).toFormat('LLL dd, yyyy')}</K.KText>
                    </K.KView>                                                                              
                </K.KView>
                    <K.KButton style={s.button} label="REJECT FUTURE PAYMENTS" type="primary" onPress={() => context.loadTemplate("/templates/ConfirmReject.template", data)} />
                
            </K.KView>
        </K.KView>   
    )

    
}

Template = (data, context) => {
    
    return (
        <Klutch.KPressable style={st.main} onPress={() => context.loadTemplate("/templates/SubscriptionList.template")}>
            <Klutch.KView>
                <Klutch.KText style={st.ymtd} >
                    ANNUAL{"\n"}
                    <Klutch.KText format="currency-smallcents" fontWeight="bold">{data.sumYear}</Klutch.KText>
                </Klutch.KText>
                <Klutch.KText style={st.ymtd}>
                    MONTHLY{"\n"}
                    <Klutch.KText format="currency-smallcents" fontWeight="bold">{data.sumMonth}</Klutch.KText>
                </Klutch.KText>
        </Klutch.KView>
            <Klutch.KView style={st.secondColumn}>
                {(data.subscriptions || []).length > 0 ? data.subscriptions.map(s => (
                    <Klutch.KView key={s.subscriptionId} style={st.subscriptionRow}>
                        <Klutch.KView style={st.nameLine}>                        
                            <Klutch.KText fontWeight="semibold">{s.name}</Klutch.KText>                        
                            <Klutch.KText>{s.amount}</Klutch.KText>                        
                        </Klutch.KView>
                        <Klutch.KText>{DateTime.fromISO(s.nextPayment).toFormat('LLL dd')}</Klutch.KText>
                    </Klutch.KView>
                )) :
                    <Klutch.KView style={{flex: 1, justifyContent: "center" }}>
                        <Klutch.KText style={{textAlign:"center"}}>{`Add to see\nupcoming payments`}</Klutch.KText>                        
                    </Klutch.KView>
                }
            </Klutch.KView>

    </Klutch.KPressable>
    )
}


const st = {
    main: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    ymtd: {
        fontSize: 15,
        marginBottom: 8
    }, 
    secondColumn: {
        flex: 1,
        marginLeft: 20
    },
    nameLine: {        
        flexDirection: "row",
        justifyContent: "space-between"
    },
    subscriptionRow: {
        borderBottomWidth: 1,
        borderBottomColor: "#e3e3e3",
        paddingRight: 5,
        paddingVertical: 5
    }
}

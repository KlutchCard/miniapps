const Line = ({style = {}}) => <Klutch.KView style={[st.line, style]} />

Template = (data, context) => {
    
    return (
        <Klutch.KPressable style={st.main} onPress={() => context.loadTemplate("/templates/SubscriptionList.template")}>
            <Klutch.KView>
                <Klutch.KText style={st.ymtd} >
                    ANNUAL{"\n"}
                    <Klutch.KText format="currency-smallcents" fontWeight="bold">{data.sumYear || 0.00}</Klutch.KText>
                </Klutch.KText>
                <Klutch.KText style={st.ymtd}>
                    MONTHLY{"\n"}
                    <Klutch.KText format="currency-smallcents" fontWeight="bold">{data.sumMonth || 0.00}</Klutch.KText>
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
                    <Klutch.KView style={{flex: 1}}>
                        <Klutch.KText style={{fontSize: 12, marginTop: 10}}>{`Add to see upcoming payments`}</Klutch.KText>
                        <Line />
                        <Line style={{ marginTop: 50 }} />
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
        marginBottom: 13
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
    },
    line: {
        height:1,
        backgroundColor: "#BCBCBC",
        opacity: .2,
        marginTop: 10,
    },
}

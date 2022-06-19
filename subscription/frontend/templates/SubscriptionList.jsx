Template =  (data, context) => {

    
    const {subscriptionList, total} = context.state || {}
    
    

    async function getTransactions() {
        const subscriptionList = await context.get("/subscriptions")
        const sum = subscriptionList.reduce((prev, curr) => prev + curr.totalPaid, 0)
        context.setState({subscriptionList, total:sum})        
    }

    if (!context.state) {
        getTransactions()
    }
    if (!subscriptionList) {
        
        return (<Klutch.KLoadingIndicator />)
    }    

    return (
        <Klutch.KView style={{ flex: 1, paddingBottom: 20 }}>
            <Klutch.KView>
                <Klutch.KText format="currency" fontWeight="semibold" style={s.totalAmount}>${total}</Klutch.KText>
                <Klutch.KText style={s.totalSpentLabel} fontWeight="bold">Totsl Spent</Klutch.KText>
            </Klutch.KView>
            <Klutch.KScrollView style={s.transactionList}>
                {subscriptionList.map(t => (
                    <Klutch.KPressable key={t.subscriptionId} onPress={() => context.loadTemplate("/templates/SubscriptionDetail.template", t)}>
                        <Klutch.KView style={s.subscription}>
                            <Klutch.KView style={s.line}>
                                <Klutch.KText>{t.name}</Klutch.KText>
                                <Klutch.KText>{t.amount}</Klutch.KText>
                            </Klutch.KView>
                            <Klutch.KView style={s.line}>
                                <Klutch.KText style={{color: "#6B6B6B"}}>Next Payment: {DateTime.fromISO(t.nextPayment).toFormat('LLL dd')}</Klutch.KText>
                                <Klutch.KText style={s.frequency}>{t.frequency}</Klutch.KText>                            
                            </Klutch.KView>
                            <Klutch.KView style={s.line}>
                                <Klutch.KText style={{color: "#6B6B6B"}}>Total this year: {t.totalPaid}</Klutch.KText>                            
                            </Klutch.KView>
                        </Klutch.KView>    
                    </Klutch.KPressable>                
                ))}
            </Klutch.KScrollView>
            <Klutch.KText style={{textAlign: "center", marginBottom: 10}}>Add more transactions using the transaction panel</Klutch.KText>
            <Klutch.KButton type="primary" style={{flex: 0}} label="Go to Transactions" link="/transactions"/>
        </Klutch.KView>   
    )
}

const s = {
    totalAmount: {
        fontSize: 55
    },
    totalSpentLabel: {
        fontSize: 15
    },
    transactionList: {
        flex: 1,
        marginTop: 30
    },
    line: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    frequency: {
        fontSize: 10,
        borderWidth: 1,
        borderColor: "black",
        paddingHorizontal: 3,
        textAlignVertical: "center",
        justifyContent: "center"        
    },
    subscription: {
        marginVertical: 5,
        paddingVertical: 2,
        borderBottomWidth: 1, 
        borderBottomColor: "#BCBCBC"
    }
}
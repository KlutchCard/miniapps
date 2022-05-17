
Template = (data, context) => {

    const onAddSubscriptionPressed = () => {
        context.loadTemplate("/templates/Add.template", {panelId: context.panel.id,  ...data})
    }

    const nextPayment =  DateTime.fromISO(data.subscription.nextPayment).toFormat('LLL, dd')
    
    return (
        <Klutch.KPressable onPress={() => context.loadTemplate("/templates/SubscriptionList.template")}>
            <Klutch.KView>
                <Klutch.KView style={style.row}>
                    <Klutch.KText fontWeight="bold">{data.subscription.name}</Klutch.KText>
                    <Klutch.KText fontWeight="bold">{data.transaction.amount}</Klutch.KText>                
            </Klutch.KView>
            <Klutch.KView style={style.row}>
                    <Klutch.KText style={style.grayColorText} >Total this year {data.subscription.totalPaid}</Klutch.KText>
                    <Klutch.KText style={style.recurrency} >{data.subscription.frequency}</Klutch.KText>                
            </Klutch.KView>
            <Klutch.KView style={style.row}>
                    <Klutch.KText style={style.grayColorText} >Next Payment {nextPayment}</Klutch.KText>                
            </Klutch.KView>
            </Klutch.KView>
        </Klutch.KPressable>        
    )    
}

const style = {
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 1
    },
    grayColorText: {
        color: "#6B6B6B"
    },
    recurrency: {
        borderColor: "black",
        borderWidth: 1,
        paddingHorizontal: 5,
        fontSize: 10,
        textAlign: "center",
        textAlignVertical: "center",
    }
}
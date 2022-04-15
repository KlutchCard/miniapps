Template = (data, context) => {    

    const K = Klutch



    return (
        <>
            <K.KHeader showBackArrow onBackArrowPressed={() => context.loadTemplate("/templates/Main.template", {})}>SCHEDULE TRANSFERS</K.KHeader>            
            <K.KPressable onPress={() => context.loadTemplate("/templates/NewRecurringTransfer.template", {type: "weekly"})}>
                <K.KView style={s.viewBox}>
                    <K.KText fontWeight="semibold" style={s.title}>Weekly</K.KText>
                    <K.KText  style={s.description}>Deposit will be initiated every Monday</K.KText>
                </K.KView>
            </K.KPressable>
            <K.KPressable onPress={() => context.loadTemplate("/templates/NewRecurringTransfer.template", {type: "monthly"})}>
            <K.KView style={s.viewBox} >
                <K.KText fontWeight="semibold" style={s.title}>Monthly</K.KText>
                <K.KText  style={s.description}>Deposit will be initiated on the 5th of every month</K.KText>
            </K.KView>
            </K.KPressable>
            <K.KPressable onPress={() => context.loadTemplate("/templates/NewRecurringTransfer.template", {type: "lowbalance"})}>
            <K.KView style={s.viewBox}>
                <K.KText fontWeight="semibold" style={s.title}>Low balance</K.KText>
                <K.KText  style={s.description}>Deposit will be initiated upon available balance below a threshold</K.KText>
            </K.KView>
            </K.KPressable>
            <K.KText>Deposit will be initiated on the next business day if the transfer date falls on a weekend or federal bank holiday</K.KText>
        </>
    )
}


const s = {
    title: {
        fontSize: 15
    },
    viewBox: {
        borderColor: "black", 
        borderWidth: 1, 
        borderColor: "black", 
        borderWidth: 1, 
        alignItems: "flex-start",
        justifyContent: "center", 
        padding: 20,
        marginBottom: 10
    }
}


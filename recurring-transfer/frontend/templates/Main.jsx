
Template = (data, context) => {    

    const K = Klutch

    context.init(async () => {
        const transfers = await context.get("/transfers")
        context.setState({transfers, loading: false})
    })


    if (!context.state || !context.state.transfers) {
        return (
            <K.KView style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
                <K.KLoadingIndicator />
            </K.KView>)
    }

    if (data != context.state.transfers) {
        const run = async () => {
            const transfers = await context.get("/transfers")
            context.setState({transfers})    
        }
        run()
    }

    const deletePressed = async (transferId) => {
        context.loadTemplate("/templates/DeleteTransfer.template", {transferId: transferId})
    }

    const addPressed = () => {
        context.setState({loading: true})
        context.loadTemplate("/templates/AddTransfer.template", {})
        
    }

    if (context.state.loading) {
        return (
            <K.KView style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
                <K.KLoadingIndicator />
            </K.KView>)
    }

    return (
        <>
            <K.KHeader showBackArrow onBackArrowPressed={() => context.closeMiniApp()}>SCHEDULED TRANSFERS</K.KHeader>            
            <K.KPressable onPress={addPressed} hitSlop={30}>
                <K.KView style={s.viewBox}>
                    <K.PlusSign color={K.KlutchTheme.colors.secondary} width={28} height={28} />
                </K.KView>
            </K.KPressable>
            {context.state.transfers.map(t => {

                    var subtitle = ""
                    var title = ""
                    switch (t.type) {
                        case "weekly": title= "Weekly"; subtitle = "Every monday"; break;
                        case "monthly": title="Monthly"; subtitle = "Every 5th of the month"; break;
                        case "lowbalance": title="Transfer"; subtitle = "When balance < " + t.lowbalanceAmount; break;
                    }

                    return (
                    <K.KView style={[s.viewBox, {flexDirection: "row", justifyContent: "center"}]} key={t.id}>
                        <K.KView style={{flex: 1}}>
                            <K.KText fontWeight="semibold" style={{fontSize: 25}}>${t.amount} {title}</K.KText>
                            <K.KText>{subtitle}</K.KText>
                        </K.KView>
                        <K.KPressable onPress={() => deletePressed(t.id)} hitSlop={20}>
                            <K.Svg.Svg  width={16} height={16} fill="none" >
                                <K.Svg.Path d="M15 15L8 8l7-7M1 15l7-7-7-7" stroke="#191919" strokeWidth={2} />
                            </K.Svg.Svg>
                        </K.KPressable>
                    </K.KView>
                    )
                }) }

        </>
    )
}


const s = {
    viewBox: {
        borderColor: "black", 
        borderWidth: 1, 
        alignItems: "center",
         borderColor: "black", 
         borderWidth: 1, 
         alignItems: "center",
         justifyContent: "center", 
         padding: 20,
         marginBottom: 10
    }
}


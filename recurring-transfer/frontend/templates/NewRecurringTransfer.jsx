
Template = (data, context) => {    

    const K = Klutch

    context.init(async () => {
        const transferSources = await AlloyJS.TransferService.getTransferSources();
        //const transferSources = [{name: "Test"}]
        context.setState({transferSources, loading: false})    
    })

    if (!context.state || !context.state.transferSources) {
        return (
            <K.KView style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
                <K.KLoadingIndicator />
            </K.KView>
        )
    }

    if (context.state.transferSources.length == 0) {
        return (
            <>
                <K.KHeader showBackArrow>SCHEDULE TRANSFER</K.KHeader>  
                <K.KText>Please Link Bank Account first in order to schedule payments</K.KText>
                <K.KButtonBar>
                    <K.KButton type="primary" label="Link Bank Account" link="/transfers"/> 
                </K.KButtonBar>
            </>)
    }
    

    const acceptPressed = async () => {
        context.setState({error: null})
        const amount = parseFloat(context.state.transferAmount)
        const lowbalanceAmount = parseFloat(context.state.lowBalanceAmount || "0")
        if (amount < 20 || amount > 200 ) {
            context.setState({error: "Transfer amount needs to be between 20 and 200"})
            return;
        }
        var day;
        switch (data.type) {
            case "weekly": day = 1; break;
            case "monthly": day = 5; break;
            case "lowbalance":     
                 if (lowbalanceAmount > amount) {
                     context.setState({error: "Low balance amount has to be equal or smaller than transfer amount"})
                     return;
                 }
        }
        context.setState({loading: true})        
        const transfer = {
            type: data.type,
            amount: context.state.transferAmount,
            day: day,
            lowbalanceAmount: context.state.lowBalanceAmount,
            transferSourceId: context.state.transferSources[0].id
        }
        const newTransfer = await context.post("/transfers", transfer)
        context.loadTemplate("/templates/Main.template", newTransfer)
    }

    return (
        <>
            <K.KHeader showBackArrow onBackArrowPressed={() => context.loadTemplate("/templates/Main.template", {})}>SCHEDULE TRANSFER</K.KHeader>            
            {data.type == "lowbalance" && (
            <K.KView>
                <K.KText style={{fontSize: 15}}>When balance below:</K.KText>
                <K.KBigCurrencyInput                    
                    style={{ backgroundColor: Klutch.KlutchTheme.backgroundColor }}
                    value={context.state.lowBalanceAmount}
                    onAmountChanged={amount => context.setState({lowBalanceAmount: amount})}
                    placeholder="$0.00"
                    returnKeyType='done'
                />
            </K.KView>

            )}
            <K.KView>
                <K.KText style={{fontSize: 15}}>Transfer Amount:</K.KText>
                <K.KBigCurrencyInput                    
                    style={{ backgroundColor: Klutch.KlutchTheme.backgroundColor }}
                    value={context.state.transferAmount}
                    onAmountChanged={amount => context.setState({transferAmount: amount})}
                    placeholder="$0.00"
                    returnKeyType='done'
                />
            </K.KView>
            <K.KView style={s.viewBox}>
                <K.KText style={{fontSize: 15}} fontWeight="bold">Transfer from {context.state.transferSources[0].name}</K.KText>
            </K.KView>
            <K.KText style={{color: "red"}}>{context.state.error}</K.KText>
            <K.KText style={{fontSize: 11, marginVertical: 20, textAlign: "left" }}>By pressing the "accept and complete" button below, I hereby authorize Lambda Financial Technologies Inc. (“Klutch”) to initiate an ACH transfer from the account above. I certify that I am authorized to initiate this transfer and it complies with applicable laws. This authorization is to remain in full force and effect until I notify Klutch at support@klutchcard.com that I wish to revoke it. I understand that Klutch must be provided sufficient time to have a reasonable opportunity to act upon my notice to revoke this authorization.</K.KText>            
            <K.KButtonBar>
                <K.KButton type="primary" 
                    label="Accept and Complete" 
                    onPress={acceptPressed}
                    loading={context.state.loading}
                    /> 
            </K.KButtonBar>
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


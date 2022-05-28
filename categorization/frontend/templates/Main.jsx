Template = (data, context) => {
    const K = Klutch
    

    context.init(async () => {
        context.setPanelConfig({backgroundColor: "#7BA29E"})
        var resp = await context.get("/categories")
        context.setState({dataset: resp})   
    })

    if (data && data.amountPerCategory && data.amountPerCategory.length > 0) {        
        context.setState({dataset: data})
    } else {
    }


    var {dataset} = context.state || {}

    

    if (!dataset) {
        return (<K.KView style={{flex: 1, justifyContent: "center", alignItems: "center"}}><K.KLoadingIndicator  /></K.KView>)                
    }
    

    const month = DateTime.now().toFormat('LLL').toUpperCase();


    var allCategories = dataset
        .filter(x => x.amount > 0)
        .sort((x, y) => y.amount - x.amount)    

    const total = allCategories.reduce((acc, curr) => acc + curr.amount, 0)
    const count = allCategories.reduce((acc, curr) => acc + curr.count, 0)

    return (
        <K.KView style={styles.mainView}>
            <K.KHeader showBackArrow color="white">Spending Categories</K.KHeader>
            <K.KScrollView>                
                {allCategories.map(c => 
                    <K.KView key={c.category.id} style={styles.row}>
                        <K.KView key={c.category.id} style={styles.category}>
                            <K.KText style={styles.categoryName} fontWeight="semibold">{c.category.name}</K.KText>
                            <K.KText style={styles.amount} format="currency-smallcents">{c.amount}</K.KText>
                        </K.KView>                    
                        <K.KText style={styles.avg}>AVG: <K.KText style={styles.avg} format="currency">{c.amount / c.count}</K.KText>
                        </K.KText>
                    </K.KView>
                    )}
                    <K.KView  style={{height: 120}}>
                    </K.KView>               
            </K.KScrollView> 
            <K.KView style={styles.totalPanel}>
                <K.KText style={{color: "#7BA29E", fontSize: 25}} fontWeight="bold">Total</K.KText>
                <K.KView>                    
                    <K.KText style={styles.totalItem}>{month}: <K.KText style={styles.totalItem} format="currency">{total}</K.KText>
                    </K.KText>
                    <K.KText style={styles.totalItem}>AVG: <K.KText format="currency" style={styles.totalItem}>{total / count}</K.KText>
                    </K.KText>
                    <K.KText style={styles.totalItem}>{count} TRANSACTIONS</K.KText>                    
                </K.KView>
            </K.KView>            
        </K.KView>
    )
}

const styles = {
    mainView: {        
        backgroundColor: "#7BA29E",
        height: "100%",
        width: "100%",
        flex: 0
    },
    row: {
        borderBottomColor: "white",
        borderBottomWidth: 1,
        paddingVertical: 10
    },
    category: {
        flexDirection: "row",
        justifyContent: "space-between",
    }, 
    categoryName: {
        fontSize: 30,        
        color: "white"
    },
    amount: {
        color: "white"
    }, 
    avg: {
        color: "white",
        fontSize: 10
    },
    totalPanel: {
       backgroundColor: "#F4FAF9",
       width: "90%",
       height: 70,
       position: "absolute",
       bottom: "5%",
       alignSelf: "center",
       justifyContent: "space-around",
       alignItems: "center",
       flexDirection: "row"
    },
    totalItem: {
        color: "#7BA29E",
        fontSize: 11
    }
}
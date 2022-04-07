const placeHolderData = {
    amountPerCategory: [
        {amount: 0, category: {name: "GROCERIES"}},
        {amount: 0, category: {name: "RESTAURANTS"}},
        {amount: 0, category: {name: "TRAVEL"}},
        {amount: 0, category: {name: "TRANSPORT"}},        
    ],
    placeholder: true
}

Template = (data, context) => {


    if (!data || !data.amountPerCategory || data.amountPerCategory.length <= 1) {
        data = placeHolderData       
    } 
    var allCategories = data.amountPerCategory
        .sort((x, y) => y.amount - x.amount)    


    const others = allCategories.splice(4).reduce((acc, curr) => acc + curr.amount, 0)


    var chartData = allCategories
        .map(d => ({x: d.category.name, y: Math.round(d.amount)}))
    
    if (others && others > 0) {
        chartData.push({x: "OTHERS", y: Math.round(others)})
    }    
    

    
    const colors = ["#44CCFF", "#82E5B9", "#F8D6F9", "#FFFD9F", "#E9F2EF", "#B4B4B4"]



    return (                
        <Klutch.KPressable style={{flex: 1}} onPress={() => context.loadTemplate("/templates/Main.template")} >
            <Klutch.KView style={{flex: 1,  flexDirection: "row"}}>            
                <Klutch.KView style={{flexBasis: 130, flex: 0}} pointerEvents="none">
                    <Victory.VictoryPie  
                    colorScale={data.placeholder ? ["#2050C740"] : colors}                             
                    containerComponent={<Victory.VictoryContainer responsive={false}   />}   
                    data={data.placeholder ? [{x: "NONE", y: 100}]  : chartData} 
                    labels={() => null} 
                    radius={60}                       
                    origin={{x: 60, y: 75}}
                    innerRadius={40}            
                    padding={0} />
                </Klutch.KView>                  
                <Klutch.KView style={{flex: 1, justifyContent: "flex-start"}}>
                    {(chartData).map((c, i) => (
                        <Klutch.KView key={c.x} style={{flexDirection: "row", justifyContent: "space-between", paddingVertical: 5}}>
                            <Klutch.KView style={{flexDirection:"row", justifyContent: "flex-start", alignItems: "center"}}>
                                <Klutch.KView style={{width: 10, height: 10, backgroundColor: colors[i], marginRight: 10}}/>
                                <Klutch.KText>{c.x}</Klutch.KText>
                            </Klutch.KView>
                            <Klutch.KText>{c.y}</Klutch.KText>
                        </Klutch.KView>
                    ))}
                </Klutch.KView>        
            </Klutch.KView>
        </Klutch.KPressable>
    )
}
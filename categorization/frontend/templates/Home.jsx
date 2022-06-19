const placeHolderData = {
    amountPerCategory: [
        {amount: 0, category: {name: "GROCERIES"}},
        {amount: 0, category: {name: "RESTAURANTS"}},
        {amount: 0, category: {name: "TRAVEL"}},
        {amount: 0, category: {name: "TRANSPORT"}},        
    ],
    placeholder: true
}


function formatMoney(number, decPlaces, decSep, thouSep) {
    decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
    decSep = typeof decSep === "undefined" ? "." : decSep;
    thouSep = typeof thouSep === "undefined" ? "," : thouSep;
    var sign = number < 0 ? "-" : "";
    var i = String(parseInt(number = Math.abs(Number(number) || 0).toFixed(decPlaces)));
    var j = (j = i.length) > 3 ? j % 3 : 0;

    return sign +
        (j ? i.substr(0, j) + thouSep : "") +
        i.substr(j).replace(/(\decSep{3})(?=\decSep)/g, "$1" + thouSep) +
        (decPlaces ? decSep + Math.abs(number - i).toFixed(decPlaces).slice(2) : "");
}

Template = (data, context) => {
    

    context.init(async () => {
        var resp = await context.get("/categories") 
         if (resp && resp.amountPerCategory) {
            context.changeData(resp)
        }        
    })
    

    if (!data || !data.amountPerCategory || data.amountPerCategory.length <= 1) {
        data = placeHolderData       
    } 

    const monthlySpent = formatMoney(data.amountPerCategory.reduce((prev, cur) => prev + cur.amount, 0), 0, ".", ",")
    const month = DateTime.now().toFormat('LLLL');

    var allCategories = [...data.amountPerCategory]
        .sort((x, y) => y.amount - x.amount)    
        

    const others = allCategories.splice(4).reduce((acc, curr) => acc + curr.amount, 0)


    var chartData = allCategories
        .map(d => ({x: d.category.name, y: Math.round(d.amount)}))
    
    if (others && others > 0) {
        chartData.push({x: "OTHERS", y: Math.round(others)})
    }    
    

    
    const colors = ["#44CCFF", "#82E5B9", "#F8D6F9", "#FFFD9F", "#E9F2EF", "#B4B4B4"]



    return (                
        <Klutch.KPressable style={{flex: 1}} onPress={() => context.loadTemplate("/templates/Main.template", data)} >
            <Klutch.KView style={{flex: 1,  flexDirection: "row"}}>            
                <Klutch.KView style={{flexBasis: 130, flex: 0}} pointerEvents="none">
                    <Victory.VictoryPie  
                    colorScale={data.placeholder ? ["#2050C740"] : colors}                             
                    containerComponent={<Victory.VictoryContainer responsive={false} />}   
                    data={data.placeholder ? [{x: "NONE", y: 100}]  : chartData} 
                    labels={() => ``}
                    radius={107/2}                       
                    innerRadius={64/2}
                    origin={{x: 60, y: 55}}
                    padding={0} />
                    <Klutch.KView style={{position: "absolute", bottom: -5, left: 0, width: 115}}>
                        <Klutch.KText style={{textAlign: "center", fontSize: 14}} fontWeight="bold">${monthlySpent}</Klutch.KText>
                        <Klutch.KText style={{textAlign: "center", fontSize: 12}}>{month}</Klutch.KText>
                    </Klutch.KView>                
                </Klutch.KView>                  
                <Klutch.KView style={{flex: 1}}>
                    {(chartData).map((c, i) => (
                        <Klutch.KView key={c.x} style={{flexDirection: "row", justifyContent: "space-between", paddingVertical: 5}}>
                            <Klutch.KView style={{flexDirection:"row", alignItems: "center", marginBottom: 3}}>
                                <Klutch.KView style={{width: 10, height: 10, borderRadius: 2, backgroundColor: colors[i], marginRight: 10}}/>
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
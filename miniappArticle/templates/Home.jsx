const MOCK_DATA = {
    food: { name: 'Food', value: .81, },
    travel: { name: 'Travel', value: .04, },
    book: { name: 'Book', value: Math.random(), },
    pet: { name: 'Pet', value: Math.random(), },
    eletronics: { name: 'Eletronic', value: .44, },
    cigar: { name: 'Cigar', value: Math.random(), },
    subscription: { name: 'Subscription', value: Math.random(), },
}

const State = {
    loading: "loading",
    ready: "ready",
}


Template = (data, context) => {
    const { state, resources } = context.state || { state: State.loading }

    const fetchData = async () => {
        // const { resources } = await context.get('resource')
        const resources = MOCK_DATA || {}
        context.setState({ resources, state: State.ready })
    }

    if (resources === undefined) fetchData()

    if (state === State.loading) return <LoadingScreen />

    return (
        <Klutch.KView style={styles.root}>
            {Object.keys(resources).map(id => <CustomBox key={id} {...resources[id]} />)}
        </Klutch.KView>
    )
}

const LoadingScreen = () => (
    <Klutch.KView >
        <Klutch.KLoadingPanelProgress />
    </Klutch.KView>
)

const CustomBox = ({ name, value }) => (
    <Klutch.KView style={styles.customBoxRoot}>
        <Klutch.KText numberOfLines={1}>{name}</Klutch.KText>
        <Klutch.KText>{`${(value * 100).toFixed(0)}%`}</Klutch.KText>
    </Klutch.KView>
)

const styles = {
    root: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        flexWrap: "wrap",
        alignContent: "space-between",
    },
    customBoxRoot: {
        height: 60,
        width: 60,
        margin: 5,
        padding: 6,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "lightblue",
        borderWidth: .5,
        borderColor: Klutch.KlutchTheme.colors.secondary,
    },
}

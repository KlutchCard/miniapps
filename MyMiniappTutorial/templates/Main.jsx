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

    const addItemHandler = () => {
        context.setState({ newValue: "" })
        context.loadTemplate("/templates/AddItem.template", data)
    }

    if (state === State.loading) return <LoadingScreen />

    return (
        <Klutch.KView style={styles.root}>
            <Klutch.KHeader showBackArrow onBackArrowPressed={context.closeMiniApp}>My MiniApp</Klutch.KHeader>

            {Object.keys(resources).map(id => <CustomBar key={id} {...resources[id]} />)}

            <Klutch.KPressable style={styles.addItem} onPress={addItemHandler}>
                <Klutch.PlusSign />
            </Klutch.KPressable>

        </Klutch.KView>
    )

}

const LoadingScreen = () => (
    <Klutch.KView style={styles.loadingRoot}>
        <Klutch.KLoadingIndicator />
    </Klutch.KView>
)

const CustomBar = ({ name, value }) => (
    <Klutch.KView style={styles.customBarRoot}>
        <Klutch.KView style={[styles.customBarFill, { width: `${100 * value}%` }]} />
        <Klutch.KView style={styles.customBarLabelContainer}>
            <Klutch.KText style={styles.customBarLabel}>{name}</Klutch.KText>
            <Klutch.KText style={styles.customBarLabel}>{`${(value * 100).toFixed(0)}%`}</Klutch.KText>
        </Klutch.KView>
    </Klutch.KView>
)

const styles = {
    root: {
        flex: 1,
        paddingBottom: 20,
    },
    loadingRoot: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    customBarRoot: {
        height: 40,
        marginVertical: 8,
        borderWidth: 1,
    },
    customBarFill: {
        backgroundColor: Klutch.KlutchTheme.colors.secondary,
        opacity: .5,
        height: "100%",
        position: "absolute",
    },
    customBarLabelContainer: {
        flex: 1,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "space-between",
    },
    customBarLabel: {
        fontSize: Klutch.KlutchTheme.font.smallSize,
    },
    addItem: {
        height: 40,
        marginVertical: 8,
        borderWidth: .5,
        justifyContent: "center",
        alignItems: "center",
    },
}

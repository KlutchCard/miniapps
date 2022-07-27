Template = (data, context) => {

    const continueButton = () => {
        const newValue = context.state.newValue
        const resources = {
            ...context.state.resources,
            [newValue.toLowerCase()]: { name: newValue, value: Math.random(), },
        }
        context.setState({ resources })
        context.loadTemplate("/templates/Main.template")
    }

    return (
        <Klutch.KView style={styles.root}>
            <Klutch.KHeader showBackArrow>Add Item</Klutch.KHeader>

            <Klutch.KTextInput
                placeholder='new item'
                value={context.state.newValue}
                onChangeText={newValue => context.setState({ newValue })}
            />

            <Klutch.KButtonBar>
                <Klutch.KButton
                    type="primary"
                    label={"CONTINUE"}
                    onPress={continueButton}
                />
            </Klutch.KButtonBar>
        </Klutch.KView>
    )
}

const styles = {
    root: {
        flex: 1,
        paddingBottom: 20,
    },
}

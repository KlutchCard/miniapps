Template = (data, context) => {

    return (
        <Klutch.KView style={styles.root}>
            <CustomBar {...data} />
        </Klutch.KView>
    )
}

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
    },
    customBarRoot: {
        flex: 1,
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
}

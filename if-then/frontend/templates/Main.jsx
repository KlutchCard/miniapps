const styles = {
  card: {
    height: 77,
    backgroundColor: "white",
    padding: 16,
    marginBottom: 20,
    justifyContent: "center",
  },
}

// Enum
const State = {
  fromOtherView: 'switchingToMain',

  ready: 'ready',
  toInitView: 'switchingToInit',
}

Template = (data = {}, context) => {
  const { rules } = context.state || {}
  const { state } = context.state || { state: State.fromOtherView }

  const fetchRules = async () => {
    const resp = await context.get("/automation")
    context.setState({ rules: resp, state: State.ready })
  }

  if (state === State.fromOtherView) fetchRules()

  if (state !== State.ready) {
    return <Klutch.KView style={{ flex: 1, justifyContent: "center" }}>
      <Klutch.KLoadingIndicator />
    </Klutch.KView>
  }

  const Panel = ({ condition, action }) => (
    <Klutch.KView style={styles.card}>

      <Klutch.KView style={{ paddingLeft: 10, flex: 1, justifyContent: "center" }}>
        <Klutch.KText style={{ fontWeight: "bold" }}>{"IF\t"}
          <Klutch.KText style={{ fontWeight: "normal" }}>{`${condition.title}${condition.value}`}</Klutch.KText>
        </Klutch.KText>

        <Klutch.KText style={{ fontWeight: "bold" }}>{"THEN\t"}
          <Klutch.KText style={{ fontWeight: "normal" }}>{`${action.title}${action.value}`}</Klutch.KText>
        </Klutch.KText>
      </Klutch.KView>
    </Klutch.KView>
  )

  return (
    <Klutch.KView style={{ flex: 1, paddingBottom: 20 }}>
      <Klutch.KHeader showBackArrow onBackArrowPressed={context.closeMiniApp}>IF / THEN</Klutch.KHeader>

      <Klutch.KScrollView>
        {rules && Object.entries(rules).map(([key, value]) => <Panel key={key} {...value} />)}

        <Klutch.KPressable style={styles.card}
          onPress={() => {
            context.setState({ ...context.state, state: State.toInitView })
            context.loadTemplate("/templates/InitAutomation.template", {})
          }}
        >
          <Klutch.PlusSign color={Klutch.KlutchTheme.colors.secondary} width={30} height={30} />
        </Klutch.KPressable>
      </Klutch.KScrollView>
    </Klutch.KView>
  )
}

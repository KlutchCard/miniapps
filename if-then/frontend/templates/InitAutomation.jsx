// Enum
const State = {
  fromOtherView: 'switchingToInit',

  loading: 'loading',
  ready: 'ready',
  toAddConditionView: 'switchingToAddCondition',
  toAddActionView: 'switchingToAddAction',
  toMainView: 'switchingToMain',
}

Template = (data = {}, context) => {
  const { state } = context.state || { state: State.fromOtherView }

  if (state === State.fromOtherView) context.setState({ ...context.state, state: State.ready })
  if (state !== State.ready) {
    return <Klutch.KView style={{ flex: 1, justifyContent: "center" }}>
      <Klutch.KLoadingIndicator />
    </Klutch.KView>
  }

  const onDoneButtonPress = async () => {
    context.setState({ ...context.state, state: State.loading })
    if (data.action && data.condition) {
      await context.post("/automation", data)
      context.setState({ ...context.state, state: State.toMainView })
      context.loadTemplate("/templates/Main.template", data)
      return
    }
    context.setState({ ...context.state, state: State.ready })
  }

  const addConditionLabel = data.condition ?
    <Klutch.KText style={{ color: "white" }}>
      {data.condition.title.toUpperCase()}
      <Klutch.KText style={{ fontWeight: "bold", color: "white" }}>{data.condition.value}</Klutch.KText>
    </Klutch.KText> :
    "ADD CONDITION"

  const addActionLabel = data.action ?
    <Klutch.KText style={{ color: "white" }}>
      {data.action.title.toUpperCase()}
      <Klutch.KText style={{ fontWeight: "bold", color: "white" }}>{data.action.value}</Klutch.KText>
    </Klutch.KText> :
    "ADD ACTION"

  return (
    <Klutch.KView style={{ flex: 1, paddingBottom: 20 }}>
      <Klutch.KHeader
        showBackArrow
        onBackArrowPressed={() => context.loadTemplate("/templates/Main.template", {})}
      >
        ADD AUTOMATION
      </Klutch.KHeader>

      <Klutch.KText style={{ fontSize: 56, fontWeight: "bold" }}>IF</Klutch.KText>
      <Klutch.KText>Choose conditions that will start this automation.</Klutch.KText>

      <Klutch.KButtonBar style={{ marginVertical: 20 }}>
        <Klutch.KButton
          type="primary"
          label={addConditionLabel}
          style={{ backgroundColor: "black" }}
          onPress={() => {
            context.setState({ ...context.state, state: State.toAddConditionView })
            context.loadTemplate("/templates/AddCondition.template", data)
          }}
        />
      </Klutch.KButtonBar>

      <Klutch.KText style={{ fontSize: 56, fontWeight: "bold" }}>THEN</Klutch.KText>
      <Klutch.KText>Choose what you want to happen when the conditions are met.</Klutch.KText>

      <Klutch.KButtonBar style={{ marginVertical: 20 }}>
        <Klutch.KButton
          type="primary"
          label={addActionLabel}
          style={{ backgroundColor: "black" }}
          onPress={() => {
            context.setState({ ...context.state, state: State.toAddActionView })
            context.loadTemplate("/templates/AddAction.template", data)
          }}
        />
      </Klutch.KButtonBar>

      <Klutch.KButtonBar style={{ position: "absolute", bottom: 20 }}>
        <Klutch.KButton
          disabled={!data.condition || !data.action}
          type="primary"
          label="DONE"
          onPress={onDoneButtonPress}
        />
      </Klutch.KButtonBar>
    </Klutch.KView>
  )
}

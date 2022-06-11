const actionsData = {
  "categorizeTransaction": {
    label: "Categorize transaction as",
    title: "Categorize as ",
  },
  "freezeCard": {
    label: "Autolock Card",
    title: "Autolock Card",
  },
  "sendNotification": {
    label: "Send notification",
    title: "Send Push Notification",
  },
  "makeDeposit": {
    label: "Make deposit of",
    title: "Make Deposit of $",
  },
  "rejectTransaction": {
    label: "Reject transaction",
    title: "Reject Transaction",
  },
}

const borderColor = "#BCBCBC"

const styles = {
  container: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
  },
  buttonsContainerStyle: {
    borderColor,
    borderTopWidth: Klutch.KlutchTheme.form.input.borderBottomWidth,
  },
  button: {
    borderColor,
    height: 45,
    borderBottomWidth: Klutch.KlutchTheme.form.input.borderBottomWidth,
    justifyContent: "center",
    padding: 10,
  },
  label: {
    color: Klutch.KlutchTheme.form.label.color,
    fontSize: Klutch.KlutchTheme.form.label.size,
  },
  extraFunctionalityTextInputStyle: {
    flex: 2,
    height: 45,
    marginBottom: 0,
    paddingBottom: 10.5,
    justifyContent: "center",
    padding: 10,
  },
}

// Enum
const State = {
  fromOtherView: 'switchingToAddAction',

  ready: 'ready',
  toInitView: 'switchingToInit',
}

Template = (data, context) => {
  let { categories } = context.state || {}
  const { state } = context.state || { state: State.fromOtherView }

  const fetchCategories = async () => {
    const cats = await context.get("/category")
    let cats2 = []
    cats.map(({ name }) => cats2.push(name))
    context.setState({ ...context.state, categories: cats2, state: State.ready })
  }

  if (state === State.fromOtherView) fetchCategories()
  if (state !== State.ready) {
    return <Klutch.KView style={{ flex: 1, justifyContent: "center" }}>
      <Klutch.KLoadingIndicator />
    </Klutch.KView>
  }

  if (!context.state) context.state = {}
  if (!context.state.action) {
    context.state.action = { selected: "" }
    Object.keys(actionsData).map(key => {
      context.state.action[key] = { title: "", value: "" }
    })
  }

  const { selected } = context.state.action

  const Button = ([key, { label, title }], disabled = false) => {
    const labelStyle = [styles.label, (selected === key && { color: "white" })]

    return (
      <Klutch.KPressable
        style={[
          styles.button,
          selected === key && { backgroundColor: Klutch.KlutchTheme.colors.primaryButtonColor },
          disabled && { opacity: .6 }
        ]}
        onPress={disabled
          ? (() => { })
          : () => context.setState({ action: { selected: key, [key]: { title, value: '', expanded: false } } })}
      >
        <Klutch.KView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Klutch.KText style={labelStyle}>{label}</Klutch.KText>
          {disabled && <Klutch.KText style={[labelStyle, { textTransform: "uppercase" }]}>COMING SOON</Klutch.KText>}
        </Klutch.KView>
      </Klutch.KPressable>
    )
  }

  const ButtonWithDropDown = ([key, { label, title }]) => {
    const labelStyle = [styles.label, (selected === key && { color: "white" })]
    const containerStyle = [
      { flexDirection: 'row', borderBottomWidth: Klutch.KlutchTheme.form.input.borderBottomWidth, borderColor, },
      (selected === key && { backgroundColor: Klutch.KlutchTheme.colors.primaryButtonColor })
    ]

    const inputComponent = (
      <Klutch.KView style={containerStyle}>
        <Klutch.KPressable
          style={[styles.button, { borderBottomWidth: 0, flex: 1 }]}
          onPress={() => context.setState(
            { action: { selected: key, [key]: { title, value: ((context.state.action[key] || {}).value || ''), expanded: false } } }
          )}
        >
          <Klutch.KText style={labelStyle}>{label}</Klutch.KText>
        </Klutch.KPressable>
        {selected === key && (
          <Klutch.KPressable style={[styles.extraFunctionalityTextInputStyle, { flex: 1 }]}
            onPress={() => context.setState(
              { action: { selected: key, [key]: { title, value: ((context.state.action[key] || {}).value || ''), expanded: true } } }
            )}
          >
            <Klutch.KText style={[labelStyle, { fontWeight: 'bold' }]}>
              {context.state.action[key].value || "Category"}
            </Klutch.KText>
          </Klutch.KPressable>
        )}
      </Klutch.KView >
    )

    if ((context.state.action[key] || {}).expanded) {
      const expandedContainerStyle = {
        position: 'absolute', width: "100%", top: -65, bottom: 0,
        backgroundColor: Klutch.KlutchTheme.backgroundColor, zIndex: 2,
      }

      return (
        <Klutch.KView style={expandedContainerStyle}>
          {inputComponent}
          <Klutch.KView>
            <Klutch.KScrollView>
              {categories.map(opt => (
                <Klutch.KPressable
                  key={`${opt}`}
                  style={{ paddingVertical: 15, paddingHorizontal: 10, }}
                  onPress={() => context.setState(
                    { action: { selected: key, [key]: { title, value: opt, expanded: false } } }
                  )}>
                  <Klutch.KText style={styles.label}>{opt}</Klutch.KText>
                </Klutch.KPressable>
              ))}
            </Klutch.KScrollView>
          </Klutch.KView>
        </Klutch.KView>
      )
    }

    return inputComponent
  }

  const onFloatInputAmountChanged = (amount, key) => {
    context.setState({
      action: {
        selected: key,
        [key]: {
          title: actionsData[key].title,
          value: amount.toString(),
        }
      }
    })
  }

  const confirmButtonPressed = (template) => {
    context.setState({ ...context.state, state: State.toInitView })
    const { selected } = context.state.action
    var action = context.state.action[selected] || {}
    action.key = selected
    var contextData = {}

    if (selected === "categorizeTransaction" || selected === "makeDeposit") {
      contextData = action.value && { action }
    } else {
      contextData = action.title && { action }
    }

    context.loadTemplate(template, { ...data, ...contextData })
  }

  return (
    <Klutch.KView style={{ flex: 1, paddingBottom: 20, justifyContent: 'space-between', }}>
      <Klutch.KView>
        <Klutch.KHeader showBackArrow onBackArrowPressed={() => confirmButtonPressed("/templates/Main.template")}>
          ADD AUTOMATION
        </Klutch.KHeader>

        <Klutch.KText style={{ fontSize: 56, fontWeight: "bold" }}>THEN</Klutch.KText>
        <Klutch.KText>Choose what you want to happen when the conditions are met.</Klutch.KText>
      </Klutch.KView>

      <Klutch.KView style={styles.container}>
        {
          selected === "makeDeposit" &&
          <Klutch.KBigCurrencyInput
            amount={(parseFloat(context.state.action[selected].value) || 0).toFixed(2)}
            onAmountChanged={amount => onFloatInputAmountChanged(amount, selected)}
          />
        }

        <Klutch.KView style={styles.buttonsContainerStyle}>
          {ButtonWithDropDown(["categorizeTransaction", actionsData.categorizeTransaction])}
          {Button(["freezeCard", actionsData.freezeCard])}
          {Button(["sendNotification", actionsData.sendNotification], disabled = true)}
          {Button(["makeDeposit", actionsData.makeDeposit], disabled = true)}
        </Klutch.KView>

        <Klutch.KButtonBar style={{ marginTop: 13 }}>
          <Klutch.KButton
            type="primary"
            label={"CONTINUE"}
            disabled={!selected}
            onPress={() => confirmButtonPressed("/templates/InitAutomation.template")}
          />
        </Klutch.KButtonBar>
      </Klutch.KView>

    </Klutch.KView>
  )
}

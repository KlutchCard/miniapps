const conditionsData = {
  "merchantName": {
    label: "If merchant is",
    title: "Merchant is ",
  },
  "merchantAmount": {
    label: "If transaction is over $",
    title: "Amount Over Then $",
  },
  "merchantCategory": {
    label: "If transaction category is",
    title: "Category is ",
  },
  "accountBalance": {
    label: "If available balance is",
    title: "Balance Over Then $",
  },
}

const borderColor = "#BCBCBC"

const styles = {
  container: {
    position: "absolute",
    bottom: 20,
    width: "100%",
  },
  buttonsContainerStyle: {
    borderColor,
    borderTopWidth: Klutch.KlutchTheme.form.input.borderBottomWidth
  },
  button: {
    borderColor,
    height: 45,
    borderBottomWidth: Klutch.KlutchTheme.form.input.borderBottomWidth,
    justifyContent: "center",
    padding: 10,
    flex: 2,
  },
  label: {
    textTransform: "capitalize",
    color: Klutch.KlutchTheme.form.label.color,
    fontSize: Klutch.KlutchTheme.form.label.size,
  },
  extraFunctionalityTextInputStyle: {
    flex: 3,
    height: 45,
    marginBottom: 0,
  },
}

// Enum
const State = {
  fromOtherView: 'switchingToAddCondition',

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
    context.setState({ categories: cats2, state: State.ready })
  }

  if (state === State.fromOtherView) fetchCategories()
  if (state !== State.ready) {
    return <Klutch.KView style={{ flex: 1, justifyContent: "center" }}>
      <Klutch.KLoadingIndicator />
    </Klutch.KView>
  }

  if (!context.state) context.state = {}
  if (!context.state.condition) {
    context.state.condition = { selected: "" }
    Object.keys(conditionsData).map(key => {
      context.state.condition[key] = { title: "", value: "" }
    })
  }

  const { selected } = context.state.condition

  const ButtonExtraFunctionality = (key, title) => {
    if (selected === key) {
      switch (key) {
        case "merchantName":
          return (
            <Klutch.KTextInput
              style={styles.extraFunctionalityTextInputStyle}
              labelContainerStyle={{ height: 0 }}
              textStyle={{ textAlignVertical: "center", borderBottomWidth: 0, color: 'white', fontWeight: 'bold' }}
              errorMessageStyle={{ height: 0, fontSize: 0 }}
              placeholderTextColor='white'
              placeholder='Merchant Name'
              value={context.state.condition[key].value}
              onChangeText={value => context.setState({ condition: { [key]: { title, value }, selected: key } })}
              returnKeyType='done'
            />
          )
      }
    }
    return <></>
  }

  const Button = (key, disabled = false) => {
    const { label, title } = conditionsData[key]

    const labelStyle = [styles.label, (selected === key && { color: "white" })]
    const containerStyle = [
      { flexDirection: 'row' },
      { backgroundColor: (selected === key ? Klutch.KlutchTheme.colors.primaryButtonColor : Klutch.KlutchTheme.backgroundColor) }
    ]

    return (
      <Klutch.KView key={`condition-button-${key}`} style={[containerStyle, (disabled && { opacity: .6 })]}>

        <Klutch.KPressable
          style={styles.button}
          onPress={disabled
            ? (() => { })
            : (() => context.setState({ condition: { selected: key, [key]: { title: "", value: "" } } }))}
        >
          <Klutch.KView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Klutch.KText style={labelStyle}>{label}</Klutch.KText>
            {disabled && <Klutch.KText style={[labelStyle, { textTransform: "uppercase" }]}>COMING SOON</Klutch.KText>}
          </Klutch.KView>
        </Klutch.KPressable>

        {ButtonExtraFunctionality(key, title)}

      </Klutch.KView>
    )
  }

  const ButtonWithDropDown = ([key, { label, title }]) => {
    const labelStyle = [styles.label, (selected === key && { color: "white" })]
    const containerStyle = [
      { flexDirection: 'row' },
      { backgroundColor: (selected === key ? Klutch.KlutchTheme.colors.primaryButtonColor : Klutch.KlutchTheme.backgroundColor) }
    ]

    const inputComponent = (
      <Klutch.KView style={containerStyle}>
        <Klutch.KPressable
          style={styles.button}
          onPress={() => context.setState(
            { condition: { selected: key, [key]: { title, value: ((context.state.condition[key] || {}).value || ''), expanded: false } } }
          )}
        >
          <Klutch.KText style={labelStyle}>{label}</Klutch.KText>
        </Klutch.KPressable>
        {selected === key && (
          <Klutch.KPressable style={[styles.extraFunctionalityTextInputStyle, { flex: 2, justifyContent: "center" }]}
            onPress={() => context.setState(
              { condition: { selected: key, [key]: { title, value: ((context.state.condition[key] || {}).value || ''), expanded: true } } }
            )}
          >
            <Klutch.KText style={[labelStyle, { fontWeight: 'bold' }]}>
              {context.state.condition[key].value || "Category"}
            </Klutch.KText>
          </Klutch.KPressable>
        )}
      </Klutch.KView >
    )

    if ((context.state.condition[key] || {}).expanded) {
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
                    { condition: { selected: key, [key]: { title, value: opt, expanded: false } } }
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
      condition: {
        [key]: {
          title: conditionsData[key].title,
          value: (amount || 0).toString(),
        },
        selected: key
      }
    })
  }

  const confirmButtonPressed = (template) => {
    context.setState({ ...context.state, state: State.toInitView })
    var condition = context.state.condition[selected] || {}
    condition.key = selected
    var contextData = condition.value ? { condition } : {}

    context.loadTemplate(template, { ...data, ...contextData })
  }

  return (
    <Klutch.KView style={{ flex: 1, paddingBottom: 20 }}>
      <Klutch.KView>
        <Klutch.KHeader
          showBackArrow
          onBackArrowPressed={() => confirmButtonPressed("/templates/Main.template")}
        >
          ADD AUTOMATION
        </Klutch.KHeader>

        <Klutch.KText style={{ fontSize: 56, fontWeight: "bold" }}>IF</Klutch.KText>
        <Klutch.KText>Choose conditions that will start this automation.</Klutch.KText>
      </Klutch.KView>

      <Klutch.KView key="footerMenu" style={styles.container}>
        {selected === "merchantAmount" && (
          <Klutch.KBigCurrencyInput
            style={{ backgroundColor: Klutch.KlutchTheme.backgroundColor }}
            value={(parseFloat(context.state.condition[selected].value) || 0).toFixed(2)}
            onAmountChanged={amount => onFloatInputAmountChanged(amount, selected)}
            placeholder="$0.00"
            returnKeyType='done'
          />
        )}
        {(selected === "accountBalance") && (
          <Klutch.KBigCurrencyInput
            style={{ backgroundColor: Klutch.KlutchTheme.backgroundColor }}
            value={(parseFloat(context.state.condition[selected].value) || 0).toFixed(2)}
            onAmountChanged={amount => onFloatInputAmountChanged(amount, selected)}
            placeholder="$0.00"
            returnKeyType='done'
          />
        )}
        <Klutch.KView style={styles.buttonsContainerStyle}>
          {Button("merchantName")}
          {ButtonWithDropDown(["merchantCategory", conditionsData["merchantCategory"]])}
          {Button("merchantAmount")}
          {Button("accountBalance", disabled = true)}
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

    </Klutch.KView >
  )
}


const styles = {
  loading: {
    flex: 1,
    justifyContent: "center",
  },
  textHeader: {
    fontSize: 20,
  },
  inputContainer: {
    marginTop: 30,
    marginBottom: 30,
    borderBottomWidth: 1,
    borderColor: 'lightgray',
  },
  inputLabel: {
    fontSize: 15,
  },
  inputValue: {
    fontSize: 55,
    fontWeight: 'bold',
  },
  inputCategoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    height: 50,
    borderWidth: 1,
    marginVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#44CCFF',
  },
  buttonText: {
    fontSize: 12,
  },
  error: { color: 'red' },
}

const stylesCategories = {
  label: {
    fontSize: 15,
    fontWeight: "bold"
  },
  button: {
    paddingTop: 20,
    paddingBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: 'lightgray'
  },
  buttonLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  buttonSquare: {
    height: 10,
    width: 10,
    borderRadius: 2
  },
  buttonLabelText: { marginLeft: 16 },
  footerText: { fontSize: 12 },
  scrollContainer: {
    marginTop: 10,
    height: "85%",
  },
}

const categoryColors = [
  { color1: "#639FAF", color2: "#E0D0C2" },
  { color1: "#9FA3AF", color2: "#E2D5D4" },
  { color1: "#77A8C5", color2: "#BAC1D8" },
  { color1: "#6A81BC", color2: "#C6B1B1" },
  { color1: "#578C6D", color2: "#CCB9A8" },
  { color1: "#77A8C5", color2: "#BAC1D8" },
  { color1: "#77A8C5", color2: "#BAC1D8" },
]

// Enum
const State = {
  fromOtherView: 'switchingToEdit',

  loadCategories: "loadCategories",
  selectCategory: 'selectCategory',
  saving: 'saving',
  deleting: 'deleting',
  ready: 'ready',
  toMainView: 'switchingtoMain',
}

Template = (data, context) => {
  if (Object.keys(context.state.budget).length === 0) context.setState({ budget: data })
  const { id, category, amount } = context.state.budget
  const { budgets, state, error, categories } = context.state
  if (!categories) context.setState({ categories: ['SHOPPING', 'DINING OUT', 'TRANSPORT', 'FOOD', 'GIFTS', 'FUN', 'MEDICAL', 'BEAUTY'], ...context.state, })

  const loadCategories = async () => {
    const cats = await context.get("/category")
    context.setState({ ...context.state, state: State.ready, categories: cats.map(({ name }) => name) })
  }

  if (state === State.fromOtherView) context.setState({ ...context.state, state: State.loadCategories })
  if (state === State.loadCategories) loadCategories()

  if (state === State.selectCategory) {
    return (
      <Klutch.KView key='container'>

        <Klutch.KView key='header'>
          <Klutch.KHeader
            showBackArrow
            onBackArrowPressed={() => context.setState({ ...context.state, budget: { id, category, amount }, state: State.ready })}
          >
            CATEGORIES
          </Klutch.KHeader>
        </Klutch.KView>

        <Klutch.KText style={styles.inputLabel}>What category are you budgeting for?</Klutch.KText>

        <Klutch.KView key='body' style={stylesCategories.scrollContainer}>
          <Klutch.KScrollView>
            {categories.map((categoryCandidate, idx) => {
              const gradientColors = [
                categoryColors[idx % categoryColors.length].color1,
                categoryColors[idx % categoryColors.length].color2,]

              return (
                <Klutch.KPressable
                  key={`category-item-${idx}`}
                  style={stylesCategories.button}
                  onPress={() =>
                    context.setState({ ...context.state, budget: { id, category: categoryCandidate, amount }, state: State.ready })
                  }
                >
                  <Klutch.KView style={stylesCategories.buttonLabelContainer}>
                    <Klutch.LinearGradient.LinearGradient
                      style={stylesCategories.buttonSquare}
                      colors={gradientColors}
                    />
                    <Klutch.KText style={stylesCategories.buttonLabelText}>{categoryCandidate}</Klutch.KText>
                  </Klutch.KView>
                  <Klutch.Arrow color="black" />
                </Klutch.KPressable>
              )
            })}
            <Klutch.KText style={stylesCategories.footerText}>
              To create a new category, go to the transactions tab and swipe right on a transaction
            </Klutch.KText>
          </Klutch.KScrollView >
        </Klutch.KView>

      </Klutch.KView >
    )
  }

  if ([State.fromOtherView, State.saving, State.deleting, State.toMainView].includes(state)) {
    return (
      <Klutch.KView style={styles.loading}>
        <Klutch.KLoadingIndicator />
      </Klutch.KView>
    )
  }

  const onSaveButtonPress = async () => {
    if (amount == 0) return
    context.setState({ ...context.state, error: undefined, state: State.saving })

    // check if category is alread exists
    const budgetSetted = budgets.find(b => b.category == category)
    if (budgetSetted && budgetSetted.id !== id) {
      context.setState({ ...context.state, state: State.ready, error: "Budget for this category already exists" })
      return
    }

    // if new category, delete older
    if (!budgetSetted) await context.request('delete', `/budget/${id}`, {})

    await context.request('put', '/budget', { category, amount })
    context.setState({ error: undefined, state: State.toMainView })
    context.loadTemplate("/templates/Main.template")
  }

  const onDeleteButtonPress = async () => {
    context.setState({ state: State.deleting })
    await context.request('delete', `/budget/${id}`, {})

    context.setState({ state: State.toMainView })
    context.loadTemplate("/templates/Main.template")
  }

  return (
    <Klutch.KView key='container'>

      <Klutch.KView key='header'>
        <Klutch.KHeader showBackArrow textStyle={styles.textHeader}>EDIT BUDGET</Klutch.KHeader>
      </Klutch.KView>

      <Klutch.KView key='budget' style={styles.inputContainer}>
        <Klutch.KText style={styles.inputLabel} fontWeight="bold">Monthly Budget</Klutch.KText>
        <Klutch.KBigCurrencyInput
          style={styles.inputValue}
          value={amount}
          onAmountChanged={(value) => context.setState({ ...context.state, budget: { id, category, amount: value } })}
          placeholder="$0.00"
        />
      </Klutch.KView>

      <Klutch.KView key='category' style={styles.inputContainer} >
        <Klutch.KText style={styles.inputLabel}>Budget Category</Klutch.KText>
        <Klutch.KPressable
          style={styles.inputCategoryContainer}
          onPress={() => context.setState({ ...context.state, budget: { id, category, amount }, state: State.selectCategory })}
        >
          <Klutch.KText style={styles.inputValue}>{category}</Klutch.KText>
          <Klutch.Arrow color="black" height={30} width={30} />
        </Klutch.KPressable>
      </Klutch.KView>

      {error && <Klutch.KText style={styles.error}>{error}</Klutch.KText>}

      <Klutch.KPressable key='save-button' style={styles.button} onPress={onSaveButtonPress} >
        <Klutch.KText style={styles.buttonText}>SAVE</Klutch.KText>
      </Klutch.KPressable>

      <Klutch.KPressable key='delete-button'
        style={[styles.button, { backgroundColor: 'transparent' }]}
        onPress={onDeleteButtonPress}
      >
        <Klutch.KText style={styles.buttonText}>DELETE</Klutch.KText>
      </Klutch.KPressable>

    </Klutch.KView >
  )
}

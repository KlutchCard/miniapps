const styles = {
  textHeader: {
    fontSize: 20,
  },
  summaryContainer: {
    marginVertical: 5,
  },
  summaryAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryAmount: {
    fontSize: 45,
    fontWeight: 'bold',
  },
  addBudgetButton: {
    width: 65,
    height: 30,
    borderWidth: 1,
    borderColor: '#44CCFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summarySubtitle: {
    fontWeight: 'bold',
    marginVertical: 10,
  },
}

const budgetContainerStyles = {
  container: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: .5,
    borderColor: 'lightgray',
  },
  textContainer: {
    marginBottom: 10,
    flexDirection: 'row',
    width: '75%',
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
}

const budgetContainer = ({ id, category, amount: budget }) => (
  <Klutch.KPressable
    style={budgetContainerStyles.container}
    key={`budget-${id}`}
    onPress={() => console.log('TODO move to edit')}
  >

    <Klutch.KView style={budgetContainerStyles.textContainer}>
      <Klutch.KText style={budgetContainerStyles.text}>{category.toUpperCase()}</Klutch.KText>
      <Klutch.KText style={budgetContainerStyles.text}>{budget.toFixed(2)}</Klutch.KText>
    </Klutch.KView>

    <Klutch.Arrow color="black" />

  </Klutch.KPressable>
)

Template = (data, context) => {
  const { budgets, totalBudget } = context.state

  return (
    <Klutch.KView key='container'>

      <Klutch.KView key='header'>
        <Klutch.KHeader showBackArrow textStyle={styles.textHeader}>MONTHLY BUDGET</Klutch.KHeader>
      </Klutch.KView>

      <Klutch.KView key='summary' style={styles.summaryContainer}>
        <Klutch.KView style={styles.summaryAmountContainer}>
          <Klutch.KText style={styles.summaryAmount}>{`$${totalBudget.toFixed(2)}`}</Klutch.KText>

          <Klutch.KPressable
            style={styles.addBudgetButton}
            onPress={() => console.log("TODO move add budget")}
          >
            <Klutch.PlusSign color="#44CCFF" />
          </Klutch.KPressable >
        </Klutch.KView >

        <Klutch.KText style={styles.summarySubtitle}>Total Budgeted</Klutch.KText>
      </Klutch.KView >

      <Klutch.KScrollView key='body'>
        {budgets.map(budgetContainer)}
      </Klutch.KScrollView>

    </Klutch.KView >
  )
}

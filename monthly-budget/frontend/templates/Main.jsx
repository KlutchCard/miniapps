const styles = {
  loading: {
    flex: 1,
    justifyContent: "center",
  },
  editButtonContainer: {
    position: 'absolute',
    height: '60%',
    width: '15%',
    alignSelf: 'flex-end',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: "#44CCFF",
    alignSelf: 'center',
  },
  summaryContainer: {
    marginVertical: 5,
  },
  summaryAmount: {
    fontSize: 50,
  },
  summarySubtitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  scrollContainer: {
    paddingBottom: 350,
  },
}

const budgetContainerStyles = {
  container: {
    marginVertical: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  category: {
    fontSize: 20,
  },
  currency: {
    fontSize: 15,
  },
  text: {
    fontSize: 10,
  },
  budget: {
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  progressBar: {
    height: 6,
    width: '100%',
    borderWidth: .5,
    marginVertical: 5,
  },
  progress: {
    height: '100%',
    backgroundColor: '#44CCFF',
  },
}

const budgetContainer = ({ id, category, amount: budget, spent }) => (
  <Klutch.KView style={budgetContainerStyles.container} key={`budget-${id}`}>
    <Klutch.KView style={budgetContainerStyles.headerContainer}>

      <Klutch.KView>
        <Klutch.KText style={budgetContainerStyles.category} fontWeight="semibold">
          {category.toUpperCase()}
        </Klutch.KText>
        <Klutch.KText style={budgetContainerStyles.currency} fontWeight="semibold">
          {Math.max((budget - spent), 0).toFixed(2)}
          <Klutch.KText style={budgetContainerStyles.text}> LEFT</Klutch.KText>
        </Klutch.KText>
      </Klutch.KView>

      <Klutch.KView style={{ alignSelf: 'flex-end' }}>
        <Klutch.KText style={budgetContainerStyles.currency}>{spent.toFixed(2)}
          <Klutch.KText style={budgetContainerStyles.text}> SPENT</Klutch.KText>
        </Klutch.KText>
        <Klutch.KText style={budgetContainerStyles.budget}>{`OF ${(budget).toFixed(2)}`}</Klutch.KText>
      </Klutch.KView>
    </Klutch.KView>

    <Klutch.KView style={budgetContainerStyles.progressBar}>
      <Klutch.KView style={[budgetContainerStyles.progress, { width: `${100 * spent / budget}%` }]} />
    </Klutch.KView>

  </Klutch.KView>
)


Template = (data, context) => {
  let { budgets,  totalBudget, loading } = context.state || { budgets: [], totalBudget: 0, loading: true}

  context.init(async () => {
    if (data && data.budgets)  {
      context.setState({budgets: data.budgets, loading: false})
    }
    const budgets = await context.get('/budget')

    if (budgets.length === 0) {
      context.loadTemplate("/templates/New.template")
      return
    } else {
      const totalBudget = budgets.reduce((accum, item) => accum + item.amount, 0)
      context.setState({ budgets, totalBudget, loading: false})
    }
  })


  if (loading) {
    return (
      <Klutch.KView style={styles.loading}>
        <Klutch.KLoadingIndicator />
      </Klutch.KView>
    )
  }

  return (
    <Klutch.KView key='container'>

      <Klutch.KView key='header'>
        <Klutch.KHeader showBackArrow onBackArrowPressed={context.closeMiniApp}>MONTHLY BUDGET</Klutch.KHeader>

        <Klutch.KPressable
          style={styles.editButtonContainer}
          onPress={() => {
            context.loadTemplate("/templates/Home.template", {budgets})
          }}
        >
          <Klutch.KText style={styles.editButtonText}>EDIT</Klutch.KText>
        </Klutch.KPressable>
      </Klutch.KView>

      <Klutch.KView key='summary' style={styles.summaryContainer}>
        <Klutch.KText style={styles.summaryAmount} fontWeight='semibold'>{`$${totalBudget.toFixed(2)}`}</Klutch.KText>
        <Klutch.KText style={styles.summarySubtitle}>Total Budgeted</Klutch.KText>
      </Klutch.KView >

      <Klutch.KView key='body' style={styles.scrollContainer}>
        <Klutch.KScrollView>
          {budgets.map(budgetContainer)}
        </Klutch.KScrollView>
      </Klutch.KView >

    </Klutch.KView >
  )
}

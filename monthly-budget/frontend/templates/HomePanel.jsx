const styles = {
  loading: {
    flex: 1,
    justifyContent: "center",
  },
  container: {
    marginTop: 20
  },
  squareContainer: {
    flexDirection: 'row'
  },
  square: {
    height: 110,
    width: 135,
    padding: 12,
    margin: 2,
    borderWidth: 1,
    justifyContent: "space-between"
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: "center",
  },
  category: {
    maxWidth: '90%',
    fontSize: 20,
  },
  arrow: {
    transform: [{ rotate: '45deg' }],
    height: 12,
    width: 12,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  spent: {
    fontSize: 20,
  },
  budget: {
    fontSize: 12,
    color: 'gray'
  },
  squareAddBudget: {
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#6B6B6B'
  },
}

Template = (data, context) => {
  const { recipeId } = data
  const { budgets } = context.state || { budgets: data.budgets }

  const budgetContainer = ({ id, category, amount: budget, spent }) => (
    <Klutch.KView key={`budget-${id}`} style={styles.square}>

      <Klutch.KPressable
        style={styles.categoryContainer}
        onPress={() => {
          context.redirect(`/miniapps/${recipeId}/templates/Main.template`)
        }}
      >
        <Klutch.KText adjustsFontSizeToFit numberOfLines={1} style={styles.category} fontWeight="bold">
          {`${category[0].toUpperCase()}${category.substring(1).toLowerCase()}`}
        </Klutch.KText>

        <Klutch.KView style={styles.arrow} />
      </Klutch.KPressable>

      <Klutch.KView>
        <Klutch.KText style={styles.spent} fontWeight="bold">{spent.toFixed(2)}</Klutch.KText>
        <Klutch.KText style={styles.budget}>{`of ${(budget).toFixed(0)}`}</Klutch.KText>
      </Klutch.KView>

    </Klutch.KView>
  )

  context.init(async () => {
    const budgets = await context.get('/budget')
    
    context.changeData({recipeId, budgets})
    context.setState({ budgets })

  })


  const onPlusButtonPress = () => {
    context.redirect(`/miniapps/${recipeId}/templates/New.template`)
  }

  
  if (!budgets) {
    return (
      <Klutch.KView style={styles.loading}>
        <Klutch.KLoadingIndicator />
      </Klutch.KView>
    )
  }

  return (
    <Klutch.KView key='container' style={styles.container}>

      <Klutch.KScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollContentStyle={{ minHeight: 0 }}
      >
        <Klutch.KView style={styles.squareContainer}>
          {budgets.map(budgetContainer)}

          <Klutch.KPressable style={[styles.square, styles.squareAddBudget]} onPress={onPlusButtonPress}>
            <Klutch.PlusSign color="#6B6B6B" width={30} height={30} />
          </Klutch.KPressable>

        </Klutch.KView >
      </Klutch.KScrollView>

    </Klutch.KView >
  )
}

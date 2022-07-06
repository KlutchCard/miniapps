styles = {
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
    padding: 16,
    paddingBottom: 25,
  }
}

const dateFormated = (datetimeToString) => {
  const datetime = new Date(datetimeToString)
  const date = DateTime.fromJSDate(datetime)

  switch (date.toRelativeCalendar()) {
    case 'today':
      return <Klutch.KText format="from-now">{datetime}</Klutch.KText>
    case 'yesterday':
      return <Klutch.KText>{date.toRelativeCalendar()}</Klutch.KText>
    default:
      return <Klutch.KText>{date.toFormat("LLL dd")}</Klutch.KText>
  }
}

Template = (data, context) => {
  let { cards, loading, buttonDisabled, errorMessage } = context.state || { loading: true, buttonDisabled: false, errorMessage: undefined }

  const fetchBurnerCards = async () => {
    const { cards } = await context.get("/card")
    context.setState({ cards, loading: false })
  }

  if (loading) {
    fetchBurnerCards()
    return (
      <Klutch.KView style={{ flex: 1, justifyContent: "center" }}>
        <Klutch.KLoadingIndicator />
      </Klutch.KView>
    )
  }

  const burnerCards = Object.values(cards)

  const cardCreated = (card) => {
    const transaction = card.transaction

    return (
      <Klutch.KView key={`card-${card.id}`} style={[styles.card, { justifyContent: "space-between" }]}>
        <Klutch.KView>
          <Klutch.KView style={{ flexDirection: 'row' }}>
            <Klutch.KView style={{ height: 18, width: 27, backgroundColor: card.color, marginRight: 6 }} />
            <Klutch.KText style={{ fontWeight: "bold" }}>{card.name + (card.lastFour ? ` (${card.lastFour})` : '')}</Klutch.KText>
          </Klutch.KView>
          {transaction && (
            <>
              <Klutch.KText>{transaction.merchantName}</Klutch.KText>
              {dateFormated(transaction.transactionDate)}
            </>
          )}
        </Klutch.KView>
        <Klutch.KText style={{ fontWeight: "bold" }}>{transaction ? transaction.amount : 'Unused'}</Klutch.KText>
      </Klutch.KView>
    )
  }

  return (
    <Klutch.KView style={styles.container}>
      <Klutch.KHeader showBackArrow onBackArrowPressed={context.closeMiniApp}>SINGLE-USE CARD</Klutch.KHeader>

      <Klutch.KScrollView style={{ paddingLeft: 10, paddingRight: 10 }}>
        {errorMessage && <Klutch.KText style={{ color: "red", fontSize: 10 }}>{errorMessage}</Klutch.KText>}

        {burnerCards.map(cardCreated)}

        <Klutch.KPressable
          style={[styles.card, { alignItems: 'center', height: 100 }, buttonDisabled && { opacity: .5 }]}
          onPress={async () => {
            if (buttonDisabled) {
              return
            }
            context.setState({ loading: true, buttonDisabled: true, errorMessage: undefined })
            try {
              const resp = await context.post("/card")
              context.redirect(`/cards/${resp.data.id}`)
            } catch (err) {
              context.setState({ errorMessage: "Could not create a card. Make sure you have appropriate permissions and you are approved" })
            }
            context.setState({ buttonDisabled: false })
          }}>
          <Klutch.PlusSign color={Klutch.KlutchTheme.colors.secondary} width={28} height={28} />
          <Klutch.KText style={{ marginLeft: 16 }}>Create new Single-Use Card</Klutch.KText>
        </Klutch.KPressable>
      </Klutch.KScrollView>

    </Klutch.KView>
  )
}

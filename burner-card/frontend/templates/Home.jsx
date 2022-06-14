Template = (data, context) => {
  let { buttonDisabled, errorMessage } = context.state || { buttonDisabled: false, errorMessage: undefined }

  return (
    <Klutch.KView style={{ flex: 1, padding: 5 }}>
      {errorMessage && <Klutch.KText style={{ color: "red", fontSize: 10 }}>{errorMessage}</Klutch.KText>}
      <Klutch.KPressable
        style={[
          { backgroundColor: "white", flexDirection: 'row', alignItems: 'center', flex: 1 },
          buttonDisabled && { opacity: .5 }
        ]}
        onPress={async () => {
          if (buttonDisabled) {
            return
          }
          context.setState({ errorMessage: undefined, buttonDisabled: true })
          try {
            const resp = await context.post("/card")
            context.redirect(`/cards/${resp.data.id}`)
          } catch (err) {
            context.setState({ errorMessage: "Could not create a card. Make sure you have appropriate permissions and you are approved" })
          }
          context.setState({ buttonDisabled: false })
        }}
      >
        <Klutch.PlusSign color={Klutch.KlutchTheme.colors.secondary} width={28} height={28} />
        <Klutch.KText style={{ color: Klutch.KlutchTheme.colors.secondary, marginLeft: 20 }}>
          Create new Single-Use Card
        </Klutch.KText>
      </Klutch.KPressable>
      <Klutch.KText style={{ color: "#6B6B6B", textAlign: "justify", marginTop: 15, flex: 2 }}>
        The virtual card will expire automatically after the transaction to protect you from new subscription renewals, online fraud and shady merchants.
      </Klutch.KText>
    </Klutch.KView>
  )
}

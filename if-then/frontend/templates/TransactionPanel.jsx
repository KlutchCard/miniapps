const styles = {
  loading: {
    flex: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    paddingLeft: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 15,
  },
  value: {
    fontWeight: "normal",
    color: Klutch.KlutchTheme.colors.secondary,
  },
}

// Enum
const State = {
  loading: 'loading',
  done: 'done',
}

Template = (data, context) => {
  if (data !== undefined) {
    const { condition, action } = data
    return (
      <Klutch.KView style={styles.container}>

        <Klutch.KText style={styles.title}>{"IF\t"}
          <Klutch.KText style={styles.value}>
            {`${condition.title}${condition.value}`}
          </Klutch.KText>
        </Klutch.KText>

        <Klutch.KText style={styles.title}>{"THEN\t"}
          <Klutch.KText style={styles.value}>
            {`${action.title}${action.value}`}
          </Klutch.KText>
        </Klutch.KText>

      </Klutch.KView>
    )
  }

  const { state } = context.state || { state: State.done }

  if (state == State.loading) {
    return (
      <Klutch.KView style={styles.loading}>
        <Klutch.KLoadingIndicator size="small" />
      </Klutch.KView>
    )
  }

  return (
    <Klutch.KView style={{
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    }}>

      <Klutch.KPressable
        style={{
          borderWidth: 1,
          borderColor: Klutch.KlutchTheme.colors.secondary,
          width: 64,
          height: 30,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 15,
        }}
        onPress={() => {
          context.setState({ state: State.loading })
          // TODO redirect
        }}
      >
        <Klutch.PlusSign color={Klutch.KlutchTheme.colors.secondary} width={15} height={15} />
      </Klutch.KPressable>

      <Klutch.KText style={styles.title}>{"IF\t"}
        <Klutch.KText style={styles.value}>Using this merchant</Klutch.KText>
      </Klutch.KText>

    </Klutch.KView>
  )
}

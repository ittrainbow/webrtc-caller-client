export const gridStyles = (users) => {
  switch (users.length) {
    case 1:
      return [1, 1]

    case 2:
      return [2, 1]

    case 3:
    case 4:
      return [2, 2]

    case 5:
    case 6:
      return [3, 2]

    case 7:
    case 8:
    case 9:
      return [3, 3]

    default:
      return [1, 1]
  }
}

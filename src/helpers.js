export const timeout = async (m) => {
    return new Promise((res) => {
        setTimeout(res, m*300)
    })
}
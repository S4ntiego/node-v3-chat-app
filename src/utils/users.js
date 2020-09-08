const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is already in use!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

        //splice usuwa czesc obiektu po numerze indeksu gdzie zostal znaleziony, zwraca obiekt, dlatego musimy uzyc [0] bo usuwamy tylko jedna rzecz i ja chcemy wybrac
        if (index !== -1) {
            return users.splice(index, 1)[0]
        }
}

//find szuka pierwszego i elo
const getUser = (id) => {
    return users.find((user) => user.id === id)
}

//filter szuka wszystkich i nie elo
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

addUser({
    id: 22,
    username: 'Brosky',
    room: 'bro'
})

addUser({
    id: 42,
    username: 'Mike',
    room: 'bro'
})

addUser({
    id: 32,
    username: 'danny',
    room: 'bro2'
})

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
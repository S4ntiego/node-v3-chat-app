//chat.js is the CLIENT side, index.js is the SERVER side

const socket = io()

//receives data, countUpdated name must match countUpdated name in index.js exactly
//order of arguments there and in index.js matters, they must be the same!
//with this function we are sending data from server to client

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const linkMessageTemplate = document.querySelector('#link-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options

//ignoreQueryprefix usuwa znak zapytania (?) przy pasku wyszukiwania ?username= itp
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    // Visible height (jaka wysokosc ma aktualny widok wiadomosci?)
    const visibleHeight = $messages.offsetHeight

    // Height of messages container (jak wysoki jest caly kontener wiadomosci?)
    const containerHeight = $messages.scrollHeight
    
    // How far have I scrolled? (ile przeskrolowalem od samej gory do danego momentu?)
    const scrollOffset = $messages.scrollTop + visibleHeight
 
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
} 

//socket.on odbiera funkcje countupdated z serwera i pokazuje ja w konsoli po stronie klienta
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        //mozna wpisac skrocona wersje, czyli po prostu message jezeli nazwa zmiennej jest taka sama jak jej wartosc
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('HH:m')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message.url)
    const html = Mustache.render(linkMessageTemplate, {
        username:message.username,
        url:message.url,
        createdAt: moment(message.createdAt).format('HH:m')
    })
//allows to insert other html adjacent to what we've selected
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    
    $messageFormButton.setAttribute('disabled', 'disabled')

    //disable
    //e.target to message-form w tym przypadku
    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        //enable

        if(error){
            return console.log(error)
        }
        
        console.log('The message was delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude
        const long = position.coords.longitude

        socket.emit('sendLocation', lat, long, (error) => {
            if(error){
                return console.log(error)
            }
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.emit('join', { username, room }, (error) => {
    if (error){
        alert(error)
        location.href = '/'
    }
})

//Biblioteki

//mustache - tworzy templejty html
//moment - pokazuje kiedy wiadomosc zostala wyslana itp
//qs - query string - room names/user names


//#to znacznik wartosci ID w html
// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked')
//     socket.emit('increment')
// })
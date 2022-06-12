exports.sendMessage = ({userId, message, data}) => {
    let socketIds = []
    for(let i = 0; i < activeUsers.length; i++) {
        
        if(activeUsers[i].userId == userId) {
            socketIds = activeUsers[i].sockets
        }
    }
    console.log(activeUsers)
    for(let i = 0; i < socketIds.length; i++) {
        io.to(socketIds[i]).emit(message, data);
    }
}
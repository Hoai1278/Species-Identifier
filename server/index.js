import { createServer } from "http"
import { Server } from "socket.io"
import { GoogleGenerativeAI } from "@google/generative-ai"
const httpServer = createServer()
import dotenv from 'dotenv'
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const io = new Server(httpServer, {
    cors: {
        orgin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5500"]
    }
})

io.on('connection', socket => {
    //console.log(`User ${socket.id} connected`)
    socket.on('message', data => {
        model
        .generateContentStream(data)
        .then(async (result) => {
            for await (const chunk of result.stream) {
                const chunkText = chunk.text()
                console.log(data)
                //io.emit("message", `${ data }`)
                console.log(chunkText)
                //socket.emit("content", chunkText)
                io.emit("message", chunkText)
            }
            //socket.emit("content", "end of content")
        })
        .catch((err) => {
            console.error("Error generating content:", err.message)
        })
    })
})

const PORT = process.env.PORT
httpServer.listen(PORT, () => console.log('Listening on port', `${PORT}`))
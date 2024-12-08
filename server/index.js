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

io.on('connection', async socket => {
    console.log(`User ${socket.id} connected`)
    socket.on('message', async (data, image) => {
        const imagePart = await fetch(`https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/American_Alligator.jpg/800px-American_Alligator.jpg`)
        .then((response) => response.arrayBuffer())
        console.log(data, image)
        model
        .generateContent([data, 
        {
            inlineData: {
                data: Buffer.from(imagePart).toString("base64"),
                mimeType: "image/*",
            }
        } ])
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
        //io.emit('image', image.toString('base64'))
    })
})

const PORT = process.env.PORT
httpServer.listen(PORT, () => console.log('Listening on port', `${PORT}`))
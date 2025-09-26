import { server } from './server-config'

const port = process.env.PORT || 3001

server.listen(port, (): void => console.log(`Server is running on ${port}...`))

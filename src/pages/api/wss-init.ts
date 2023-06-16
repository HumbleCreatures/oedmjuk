import { NextApiRequest, NextApiResponse } from 'next';
import { WebSocketServer } from 'ws';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { appRouter } from '../../server/api/root';
import { createTRPCContext } from '../../server/api/trpc';

const SocketHandler = async (req: any, res: any) => {
    if (res.socket.server.wss) {
        console.log('Socket is already running')
    } else {
        console.log('Socket is initializing')
        const server = res.socket?.server
        const wss = new WebSocketServer({ noServer: true })
        applyWSSHandler({ wss, router: appRouter, createContext: createTRPCContext });

        res.socket.server.wss = wss
        
        await server.on('upgrade', (req, socket, head) => {
            console.log("upgrade", req.url)
        
            if (!req.url.includes('/_next/webpack-hmr')) {
                wss.handleUpgrade(req, socket, head, (ws) => {
                    wss.emit('connection', ws, req);
                });
            }

        });

        wss.on('connection', (ws) => {
            console.log(`➕➕ Connection (${wss.clients.size})`);
            ws.once('close', () => {
              console.log(`➖➖ Connection (${wss.clients.size})`);
            });
          });

    }
    res.end()
}

export default SocketHandler
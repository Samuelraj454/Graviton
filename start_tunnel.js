import localtunnel from 'localtunnel';

(async () => {
    const tunnel = await localtunnel({ port: 5173 });
    console.log('TUNNEL_URL:', tunnel.url);
    tunnel.on('close', () => {
        console.log('Tunnel closed');
    });
})();

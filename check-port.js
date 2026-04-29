import net from 'net';

const 端口 = 5173;

const server = net.createServer();

server.once('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`端口 ${端口} 已被占用`);
    process.exit(1);
  }
});

server.once('listening', () => {
  server.close();
  console.log(`端口 ${端口} 可用`);
});

server.listen(端口);
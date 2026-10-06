// Live alerts for partner panels over Server-Sent Events. Each open panel keeps
// one stream; events are sent to partner ids (and "admin").
//
// Single-process only. When running several server instances, replace this
// with Redis pub/sub or Socket.IO with an adapter.

const streams = new Map(); // key -> Set<res>

function subscribe(keys, res) {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();
  res.write('retry: 5000\n\n');

  for (const key of keys) {
    if (!streams.has(key)) streams.set(key, new Set());
    streams.get(key).add(res);
  }
  // Comment lines keep proxies from closing an idle stream.
  const ping = setInterval(() => res.write(': ping\n\n'), 25_000);

  res.on('close', () => {
    clearInterval(ping);
    for (const key of keys) {
      const set = streams.get(key);
      set?.delete(res);
      if (set && !set.size) streams.delete(key);
    }
  });
}

function publish(keys, event, data = {}) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  const sent = new Set();
  for (const key of keys) {
    for (const res of streams.get(String(key)) || []) {
      if (sent.has(res)) continue;
      sent.add(res);
      res.write(payload);
    }
  }
}

const isListening = (key) => streams.has(String(key));

module.exports = { subscribe, publish, isListening };

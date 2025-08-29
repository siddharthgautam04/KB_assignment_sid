import { exec } from 'child_process';

export function pingOnce(ip: string): Promise<{ reachable: boolean; ms?: number }> {
  return new Promise(resolve => {
    const cmd = `ping -c 1 -W 1 ${ip}`;
    exec(cmd, (error, stdout) => {
      if (error) return resolve({ reachable: false });
      const match = stdout.match(/time=([\d.]+)\s*ms/);
      const ms = match ? parseFloat(match[1]) : undefined;
      resolve({ reachable: true, ms });
    });
  });
}
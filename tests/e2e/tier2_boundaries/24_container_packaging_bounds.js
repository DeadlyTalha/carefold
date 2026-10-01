import fs from 'node:fs';
import path from 'node:path';
import { runPython, assertEqual, assertTrue, assertContains } from '../helpers/utils.js';

export const name = 'F24-B: Container Packaging & Compose Boundaries';

export async function run() {
  const tests = [
    {
      id: 'F24-B01',
      name: 'docker-compose.yml parses as valid YAML with required service structure',
      fn: () => {
        const script = `
import yaml
from pathlib import Path

compose_file = Path('docker/docker-compose.yml')
assert compose_file.is_file()
data = yaml.safe_load(compose_file.read_text())
assert 'services' in data
assert 'backend' in data['services']
assert 'web' in data['services']
assert 'volumes' in data
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F24-B02',
      name: 'docker-compose.yml sets offline-first environment defaults for backend',
      fn: () => {
        const script = `
import yaml
from pathlib import Path

compose_file = Path('docker/docker-compose.yml')
data = yaml.safe_load(compose_file.read_text())
backend_env = data['services']['backend']['environment']
# Ensure offline default host is configured
assert 'CAREFOLD_WORKSPACE' in backend_env or any('OLLAMA' in k for k in backend_env)
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F24-B03',
      name: 'docker-compose.yml defines robust health check on backend service',
      fn: () => {
        const script = `
import yaml
from pathlib import Path

compose_file = Path('docker/docker-compose.yml')
data = yaml.safe_load(compose_file.read_text())
backend = data['services']['backend']
assert 'healthcheck' in backend
hc = backend['healthcheck']
assert 'test' in hc
assert 'interval' in hc
assert 'retries' in hc
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F24-B04',
      name: 'Dockerfile exposes backend port 8000 and web port 3000',
      fn: () => {
        const content = fs.readFileSync(path.join(process.cwd(), 'docker', 'Dockerfile'), 'utf8');
        assertContains(content, 'EXPOSE 8000');
        assertContains(content, 'EXPOSE 3000');
      }
    },
    {
      id: 'F24-B05',
      name: 'docker-compose.yml mounts carefold-data volume to preserve audit logs',
      fn: () => {
        const script = `
import yaml
from pathlib import Path

compose_file = Path('docker/docker-compose.yml')
data = yaml.safe_load(compose_file.read_text())
backend = data['services']['backend']
assert 'volumes' in backend
has_data_vol = any('carefold-data' in v for v in backend['volumes'])
assert has_data_vol, "Backend service must mount carefold-data volume"
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    }
  ];

  return tests;
}

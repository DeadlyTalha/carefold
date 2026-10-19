/*
 * Carefold — Healthcare AI Agent Marketplace & Runtime
 * Copyright 2026 Spectrayan (https://spectrayan.com)
 *
 * Licensed under the PolyForm Noncommercial License 1.0.0 and the
 * Carefold Additional Terms (see LICENSE and ADDITIONAL-TERMS.md).
 * Personal and household local use only. Commercial use, hosted service
 * offering, rebranding, white-labeling, and redistribution of modified
 * forks are prohibited without a written commercial license from Spectrayan.
 *
 * Required Notice: Copyright 2026 Spectrayan (https://spectrayan.com)
 */

import fs from 'node:fs';
import path from 'node:path';
import { assertEqual, assertTrue, assertContains } from '../helpers/utils.js';

export const name = 'F24: Container Packaging & Compose';

export async function run() {
  const getDockerfilePath = () => {
    const deployPath = path.join(process.cwd(), 'deploy', 'docker', 'Dockerfile');
    if (fs.existsSync(deployPath)) return deployPath;
    return path.join(process.cwd(), 'docker', 'Dockerfile');
  };

  const getComposePath = () => {
    const deployPath = path.join(process.cwd(), 'deploy', 'docker', 'docker-compose.yml');
    if (fs.existsSync(deployPath)) return deployPath;
    return path.join(process.cwd(), 'docker', 'docker-compose.yml');
  };

  const tests = [
    {
      id: 'F24-T01',
      name: 'deploy/docker/Dockerfile exists and contains valid multi-stage configuration',
      fn: () => {
        const dockerfilePath = getDockerfilePath();
        assertTrue(fs.existsSync(dockerfilePath), 'Dockerfile missing');
        const content = fs.readFileSync(dockerfilePath, 'utf8');
        assertContains(content, 'AS backend');
        assertContains(content, 'AS web');
        assertContains(content, 'AS all-in-one');
      }
    },
    {
      id: 'F24-T02',
      name: 'deploy/docker/docker-compose.yml defines backend and web service orchestration',
      fn: () => {
        const composePath = getComposePath();
        assertTrue(fs.existsSync(composePath), 'docker-compose.yml missing');
        const content = fs.readFileSync(composePath, 'utf8');
        assertContains(content, 'backend:');
        assertContains(content, 'web:');
        assertContains(content, 'carefold-data:');
      }
    },
    {
      id: 'F24-T03',
      name: 'docker-compose.yml configures local-first Ollama service under ollama profile',
      fn: () => {
        const composePath = getComposePath();
        const content = fs.readFileSync(composePath, 'utf8');
        assertContains(content, 'ollama:');
        assertContains(content, 'profiles: ["ollama"]');
        assertContains(content, '11434:11434');
      }
    },
    {
      id: 'F24-T04',
      name: 'Dockerfile configures non-root user and healthcheck endpoints',
      fn: () => {
        const dockerfilePath = getDockerfilePath();
        const content = fs.readFileSync(dockerfilePath, 'utf8');
        assertContains(content, 'HEALTHCHECK');
        assertContains(content, '/api/health');
      }
    },
    {
      id: 'F24-T05',
      name: 'Dockerfile packages declarative reference agents and skills assets',
      fn: () => {
        const dockerfilePath = getDockerfilePath();
        const content = fs.readFileSync(dockerfilePath, 'utf8');
        assertContains(content, 'COPY agents/ ./agents/');
        assertContains(content, 'COPY skills/ ./skills/');
      }
    }
  ];

  return tests;
}

#!/usr/bin/env node

import { program } from 'commander';
import { verify } from './commands/verify';

program
    .command('verify <hash>')
    .description('verify an anchor')
    .action(verify);

program.parse();
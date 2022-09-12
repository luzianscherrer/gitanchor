#!/usr/bin/env node

import { program } from 'commander';
import { verify } from './commands/verify';
import readline from 'readline';

program
    .name('gitanchor')
    .description('CLI to handle gitanchors')
    .version('1.0.0');

program
    .command('verify')
    .description('verify anchor for hash')
    .argument('[hash]', 'hash to verify')
    .option('--stdin', 'read hash from stdin')
    .option('--latest', 'use the latest Git commit hash in the current project directory')
    .option('--silent', 'suppress output; returns 0 when anchor is set, 2 otherwise')
    .action((hash, options) => {
        if(options.stdin) {
            const rl = readline.createInterface({
                input: process.stdin
            });            
            rl.on('line', function(line){
                rl.close();
                verify(line, options.silent);
            })            
        } else if(options.latest) {
            const exec = require('child_process').exec
            exec('git rev-parse HEAD', (err: any, stdout: any, stderr: any) => {
                if(!err) { 
                    verify(stdout.trim(), options.silent)
                } else {
                    console.log('Could not determine the latest Git commit; are you in a Git project directory?'); 
                }
            });
        } else if(hash) {
            verify(hash, options.silent);
        } else {
            console.log('Please indicate the hash to be verified');
        }
    });

program.parse();
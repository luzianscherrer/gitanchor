#!/usr/bin/env node

import { program } from 'commander';
import { verify } from './commands/verify';
import { create } from './commands/create';
import readline from 'readline';
const pj = require('../package.json');

program
    .name(pj.name)
    .description(pj.description)
    .version(pj.version);

program
    .command('verify')
    .summary('verify anchor for hash')
    .description('Verify if a hash has been anchored to the blockchain')
    .argument('[hash]', 'hash to verify')
    .option('--stdin', 'read hash from stdin')
    .option('--latest', 'use the latest Git commit hash in the current project directory')
    .option('--silent', 'suppress output; returns 0 when anchor is set, 1 otherwise')
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

program
    .command('create')
    .summary('create anchor for hash')
    .description('Create an achor for a hash in the blockchain')
    .argument('[hash]', 'hash to anchor')
    .option('--stdin', 'read hash from stdin')
    .option('--latest', 'use the latest Git commit hash in the current project directory')
    .option('--silent', 'suppress output; returns 0 on success, 2 otherwise')
    .action((hash, options) => {
        if(options.stdin) {
            const rl = readline.createInterface({
                input: process.stdin
            });            
            rl.on('line', function(line){
                rl.close();
                create(line, options.silent);
            })            
        } else if(options.latest) {
            const exec = require('child_process').exec
            exec('git rev-parse HEAD', (err: any, stdout: any, stderr: any) => {
                if(!err) { 
                    create(stdout.trim(), options.silent)
                } else {
                    console.log('Could not determine the latest Git commit; are you in a Git project directory?'); 
                }
            });
        } else if(hash) {
            create(hash, options.silent);
        } else {
            console.log('Please indicate the hash to be anchored');
        }
    });

program.parse();